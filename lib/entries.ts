import { getSql, pgConstraint, pgErrorCode } from './db'
import { LIMITS, type EntryField, type FieldErrors } from './entry-types'
import { generateReferralCode, normaliseReferralCode } from './referral-code'

// Server-only: entry validation and storage.

export interface ValidEntry {
  firstName: string
  email: string
  phone: string
  hasIdea: boolean
  idea: string | null
  ref: string | null
}

export type ValidationResult = { ok: true; entry: ValidEntry } | { ok: false; fieldErrors: FieldErrors }

const EMAIL_PATTERN = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:".]{2,}$/
const PHONE_CHARS = /^\+?[\d\s().\-/]+$/

/** Trim, collapse runs of whitespace, drop control characters. */
function clean(value: unknown, keepNewlines = false): string {
  if (typeof value !== 'string') return ''
  const noControl = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  return keepNewlines
    ? noControl.replace(/\r\n?/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
    : noControl.replace(/\s+/g, ' ').trim()
}

export function validateEntry(input: unknown): ValidationResult {
  const body = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>
  const errors: FieldErrors = {}
  const fail = (field: EntryField, message: string) => {
    if (!errors[field]) errors[field] = message
  }

  const firstName = clean(body.firstName)
  if (!firstName) fail('firstName', 'Please enter your first name.')
  else if (firstName.length > LIMITS.firstName) fail('firstName', `Keep your name under ${LIMITS.firstName} characters.`)

  const email = clean(body.email).toLowerCase()
  if (!email) fail('email', 'Please enter your email address.')
  else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) fail('email', 'Please enter a valid email address.')

  const phone = clean(body.phone)
  const digits = phone.replace(/\D/g, '').length
  if (!phone) fail('phone', 'Please enter your phone number.')
  else if (phone.length > LIMITS.phone || !PHONE_CHARS.test(phone) || digits < 7 || digits > 15)
    fail('phone', 'Please enter a valid phone number, e.g. +31 6 1234 5678.')

  let idea: string | null = null
  const hasIdea = body.hasIdea
  if (typeof hasIdea !== 'boolean') fail('hasIdea', 'Please choose one of the options.')
  else if (hasIdea) {
    const text = clean(body.idea, true)
    if (!text) fail('idea', 'Please tell us your app idea.')
    else if (text.length > LIMITS.idea) fail('idea', `Keep your idea under ${LIMITS.idea} characters.`)
    else idea = text
  }

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors }
  return {
    ok: true,
    entry: { firstName, email, phone, hasIdea: hasIdea === true, idea, ref: normaliseReferralCode(body.ref) },
  }
}

/**
 * Stores the entry and returns the entrant's referral code.
 *
 * - Same email again: nothing is written or updated (the original entry is
 *   kept as it was, including its original referrer) and the existing code
 *   is returned.
 * - `ref` that matches no entry is stored as NULL. A person cannot refer
 *   themselves: a new entry's code does not exist yet, and a repeat
 *   submission never changes the stored row.
 */
export async function createEntry(entry: ValidEntry): Promise<{ referralCode: string }> {
  const sql = getSql()
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode()
    try {
      const inserted = await sql`
        INSERT INTO entries (first_name, email, phone, has_idea, idea, referral_code, referred_by)
        VALUES (
          ${entry.firstName}, ${entry.email}, ${entry.phone}, ${entry.hasIdea}, ${entry.idea}, ${code},
          (SELECT referral_code FROM entries WHERE referral_code = ${entry.ref})
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING referral_code`
      if (inserted.length > 0) return { referralCode: inserted[0].referral_code as string }

      const existing = await sql`SELECT referral_code FROM entries WHERE email = ${entry.email}`
      if (existing.length > 0) return { referralCode: existing[0].referral_code as string }
      // Row vanished between the two statements (deleted): try again.
    } catch (error) {
      // Only a clash on the generated code is worth a retry.
      if (pgErrorCode(error) === '23505' && pgConstraint(error) === 'entries_referral_code_key') continue
      throw error
    }
  }
  throw new Error('Could not generate a unique referral code')
}

/** Counts one visit for the code. Unknown codes are ignored. */
export async function recordVisit(ref: unknown): Promise<void> {
  const code = normaliseReferralCode(ref)
  if (!code) return
  const sql = getSql()
  await sql`
    INSERT INTO referral_visits (referral_code)
    SELECT referral_code FROM entries WHERE referral_code = ${code}`
}
