import { checkAdminPassword, isAdminConfigured, startAdminSession } from '@/lib/admin-auth'
import type { AdminLoginResponse } from '@/lib/entry-types'
import { isSameOrigin, json, readJsonBody } from '@/lib/http'

// POST /api/admin/login — body { password }. Sets the session cookie.
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request))
    return json<AdminLoginResponse>({ ok: false, error: 'forbidden', message: 'Cross-site request refused.' }, 403)

  if (!isAdminConfigured())
    return json<AdminLoginResponse>({ ok: false, error: 'not_configured', message: 'Admin access is not available.' }, 503)

  const body = await readJsonBody(request)
  if (!body.ok)
    return json<AdminLoginResponse>({ ok: false, error: 'invalid_request', message: body.message }, body.status)

  const password = body.data.password
  if (typeof password !== 'string' || password.length > 1024 || !checkAdminPassword(password)) {
    // Slow down guessing a little. This is not real rate limiting.
    await new Promise((resolve) => setTimeout(resolve, 500))
    return json<AdminLoginResponse>({ ok: false, error: 'invalid_password', message: 'Wrong password.' }, 401)
  }

  await startAdminSession()
  return json<AdminLoginResponse>({ ok: true })
}
