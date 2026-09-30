import { recordVisit } from '@/lib/entries'
import type { VisitResponse } from '@/lib/entry-types'
import { json, readJsonBody } from '@/lib/http'

// POST /api/visits — count one visit for a referral code. The answer is the
// same whether or not the code exists, so codes cannot be probed here.
export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request)
  if (body.ok) {
    try {
      await recordVisit(body.data.ref)
    } catch (error) {
      console.error('[visits] failed to record visit:', error instanceof Error ? error.message : error)
    }
  }
  return json<VisitResponse>({ ok: true })
}
