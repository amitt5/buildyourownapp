import { isAdmin } from '@/lib/admin-auth'
import type { AdminSessionResponse } from '@/lib/entry-types'
import { json } from '@/lib/http'

// GET /api/admin/session — is the current browser logged in as admin?
export async function GET(): Promise<Response> {
  return json<AdminSessionResponse>({ admin: await isAdmin() })
}
