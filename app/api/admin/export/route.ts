import { isAdmin } from '@/lib/admin-auth'
import { adminDataToCsv, getAdminData } from '@/lib/admin-data'
import { json } from '@/lib/http'

// GET /api/admin/export — CSV download of all entries. Admin only.
export async function GET(): Promise<Response> {
  if (!(await isAdmin())) return json({ ok: false, error: 'unauthorized', message: 'Log in first.' }, 401)
  try {
    const csv = adminDataToCsv(await getAdminData())
    const date = new Date().toISOString().slice(0, 10)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="giveaway-entries-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[admin] failed to export entries:', error instanceof Error ? error.message : error)
    return json({ ok: false, error: 'server_error', message: 'Could not export entries.' }, 500)
  }
}
