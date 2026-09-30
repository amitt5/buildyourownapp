import { createEntry, validateEntry } from '@/lib/entries'
import { HONEYPOT_FIELD, type EntryResponse } from '@/lib/entry-types'
import { json, readJsonBody } from '@/lib/http'
import { generateReferralCode } from '@/lib/referral-code'

// POST /api/entries — enter the giveaway. See lib/entry-types.ts for shapes.
export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request)
  if (!body.ok)
    return json<EntryResponse>({ ok: false, error: 'invalid_request', message: body.message }, body.status)

  // Honeypot: bots that fill the hidden field get a normal-looking success
  // with a throwaway code, and nothing is stored.
  const trap = body.data[HONEYPOT_FIELD]
  if (trap !== undefined && trap !== null && trap !== '')
    return json<EntryResponse>({ ok: true, referralCode: generateReferralCode() })

  const result = validateEntry(body.data)
  if (!result.ok)
    return json<EntryResponse>(
      { ok: false, error: 'validation', message: 'Please check the highlighted fields.', fieldErrors: result.fieldErrors },
      400,
    )

  try {
    const { referralCode } = await createEntry(result.entry)
    return json<EntryResponse>({ ok: true, referralCode })
  } catch (error) {
    console.error('[entries] failed to store entry:', error instanceof Error ? error.message : error)
    return json<EntryResponse>(
      { ok: false, error: 'server_error', message: 'Something went wrong. Please try again in a moment.' },
      500,
    )
  }
}
