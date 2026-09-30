import { LIMITS } from './entry-types'

// Small helpers shared by the route handlers.

const NO_STORE = { 'Cache-Control': 'no-store' }

export function json<T>(body: T, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE })
}

export type BodyResult = { ok: true; data: Record<string, unknown> } | { ok: false; status: number; message: string }

/** Reads a small JSON object body, refusing anything over LIMITS.body bytes. */
export async function readJsonBody(request: Request): Promise<BodyResult> {
  const type = request.headers.get('content-type') ?? ''
  if (!type.toLowerCase().startsWith('application/json'))
    return { ok: false, status: 415, message: 'Send the request as application/json.' }

  const declared = Number(request.headers.get('content-length') ?? '0')
  if (declared > LIMITS.body) return { ok: false, status: 413, message: 'Request is too large.' }

  // Read in chunks and stop early, so an oversized body is never held in full.
  const reader = request.body?.getReader()
  if (!reader) return { ok: false, status: 400, message: 'Request body is missing.' }
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > LIMITS.body) {
      await reader.cancel()
      return { ok: false, status: 413, message: 'Request is too large.' }
    }
    chunks.push(value)
  }

  try {
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (typeof data !== 'object' || data === null || Array.isArray(data))
      return { ok: false, status: 400, message: 'Request body must be a JSON object.' }
    return { ok: true, data: data as Record<string, unknown> }
  } catch {
    return { ok: false, status: 400, message: 'Request body is not valid JSON.' }
  }
}

/**
 * False when a browser says the request came from another site. Requests
 * without an Origin header (curl, same-origin GETs) pass.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
