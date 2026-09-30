import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// Server-only. Uses Neon's HTTP driver: one stateless HTTPS request per query,
// so there are no long-lived connections to manage on serverless.

let cached: NeonQueryFunction<false, false> | undefined

export class MissingEnvError extends Error {
  constructor(name: string) {
    super(`${name} is not set. Add it to .env.local (dev) or the Vercel project env vars.`)
    this.name = 'MissingEnvError'
  }
}

export function getSql(): NeonQueryFunction<false, false> {
  if (!cached) {
    const url = process.env.DATABASE_URL
    if (!url) throw new MissingEnvError('DATABASE_URL')
    cached = neon(url)
  }
  return cached
}

/** Postgres error code (e.g. '23505' unique violation), if the error has one. */
export function pgErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code
    return typeof code === 'string' ? code : undefined
  }
  return undefined
}

/** Name of the violated constraint, if the error has one. */
export function pgConstraint(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'constraint' in error) {
    const c = (error as { constraint: unknown }).constraint
    return typeof c === 'string' ? c : undefined
  }
  return undefined
}
