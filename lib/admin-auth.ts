import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

// Server-only: admin login with a signed, stateless session cookie.
//
// Cookie value: `v1.<expiry ms>.<HMAC-SHA256 signature, base64url>`.
// The password is never stored in the cookie. The signing key comes from
// ADMIN_SESSION_SECRET when set, otherwise it is derived from ADMIN_PASSWORD
// with HMAC-SHA256 (so changing the password signs everyone out).
// Missing env vars fail closed: nobody is an admin and login is refused.

export const ADMIN_COOKIE = 'byoa_admin'
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7 // 7 days

const KEY_CONTEXT = 'byoa-admin-session-v1'
const COMPARE_CONTEXT = 'byoa-admin-password-compare-v1'

let warned = false

/** True when ADMIN_PASSWORD is set. Logs one clear server-side error if not. */
export function isAdminConfigured(): boolean {
  if (process.env.ADMIN_PASSWORD) return true
  if (!warned) {
    warned = true
    console.error('[admin-auth] ADMIN_PASSWORD is not set: admin access is disabled.')
  }
  return false
}

function signingKey(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  const secret = process.env.ADMIN_SESSION_SECRET || password
  return createHmac('sha256', secret).update(KEY_CONTEXT).digest()
}

function sign(payload: string, key: Buffer): Buffer {
  return createHmac('sha256', key).update(payload).digest()
}

/** Constant-time check of a submitted password. False if not configured. */
export function checkAdminPassword(candidate: unknown): boolean {
  const password = process.env.ADMIN_PASSWORD
  if (!isAdminConfigured() || !password || typeof candidate !== 'string') return false
  // Hash both to equal-length digests, then compare in constant time.
  const a = createHmac('sha256', COMPARE_CONTEXT).update(candidate).digest()
  const b = createHmac('sha256', COMPARE_CONTEXT).update(password).digest()
  return timingSafeEqual(a, b)
}

export function createSessionToken(now = Date.now()): string | null {
  const key = signingKey()
  if (!key) return null
  const payload = `v1.${now + ADMIN_SESSION_SECONDS * 1000}`
  return `${payload}.${sign(payload, key).toString('base64url')}`
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  const key = signingKey()
  if (!key || !token || token.length > 200) return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1' || !/^\d{1,16}$/.test(parts[1])) return false
  const expected = sign(`${parts[0]}.${parts[1]}`, key)
  const given = Buffer.from(parts[2], 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false
  return Number(parts[1]) > now
}

/**
 * True when the current request carries a valid admin session cookie.
 * Call from Server Components, Server Functions and Route Handlers.
 */
export async function isAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) return false
  const store = await cookies()
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value)
}

/** Sets the session cookie. Route Handlers / Server Functions only. */
export async function startAdminSession(): Promise<boolean> {
  const token = createSessionToken()
  if (!token) return false
  const store = await cookies()
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  })
  return true
}

/** Clears the session cookie. Route Handlers / Server Functions only. */
export async function endAdminSession(): Promise<void> {
  const store = await cookies()
  store.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
