import { endAdminSession } from '@/lib/admin-auth'
import { isSameOrigin, json } from '@/lib/http'

// POST /api/admin/logout — clears the session cookie.
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ ok: false, error: 'forbidden', message: 'Cross-site request refused.' }, 403)
  await endAdminSession()
  return json({ ok: true })
}
