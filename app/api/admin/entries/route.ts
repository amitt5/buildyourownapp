import { isAdmin } from '@/lib/admin-auth'
import { getAdminData } from '@/lib/admin-data'
import type { AdminDataResponse } from '@/lib/entry-types'
import { json } from '@/lib/http'

// GET /api/admin/entries — all entries with counts and totals. Admin only.
export async function GET(): Promise<Response> {
  if (!(await isAdmin()))
    return json<AdminDataResponse>({ ok: false, error: 'unauthorized', message: 'Log in first.' }, 401)
  try {
    return json<AdminDataResponse>({ ok: true, ...(await getAdminData()) })
  } catch (error) {
    console.error('[admin] failed to load entries:', error instanceof Error ? error.message : error)
    return json<AdminDataResponse>({ ok: false, error: 'server_error', message: 'Could not load entries.' }, 500)
  }
}
