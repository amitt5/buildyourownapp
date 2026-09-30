// Shared request/response shapes and limits. No server imports here, so both
// client components and server code can import from this file.

export const LIMITS = {
  firstName: 80,
  email: 254,
  phone: 32,
  idea: 500,
  /** Max size of a request body, in bytes. */
  body: 8 * 1024,
} as const

/** Honeypot field name: render it hidden in the form and leave it empty. */
export const HONEYPOT_FIELD = 'website'

/** Body of POST /api/entries (JSON). */
export interface EntryRequest {
  firstName: string
  email: string
  phone: string
  hasIdea: boolean
  /** Required when hasIdea is true, ignored otherwise. */
  idea?: string
  /** Referral code from ?ref=CODE, if the visitor arrived through a link. */
  ref?: string
  /** Honeypot: must be absent or empty. */
  website?: string
}

export type EntryField = 'firstName' | 'email' | 'phone' | 'hasIdea' | 'idea'

export type FieldErrors = Partial<Record<EntryField, string>>

export interface EntrySuccess {
  ok: true
  /** The entrant's own code. Share link: `${origin}?ref=${referralCode}` */
  referralCode: string
}

export type EntryError =
  | { ok: false; error: 'validation'; message: string; fieldErrors: FieldErrors }
  | { ok: false; error: 'invalid_request' | 'server_error'; message: string }

export type EntryResponse = EntrySuccess | EntryError

/** Body of POST /api/visits (JSON). */
export interface VisitRequest {
  ref: string
}

/** Always the same, whether or not the code exists. */
export interface VisitResponse {
  ok: true
}

/** Body of POST /api/admin/login (JSON). */
export interface AdminLoginRequest {
  password: string
}

export type AdminLoginResponse =
  | { ok: true }
  | { ok: false; error: 'invalid_password' | 'invalid_request' | 'not_configured' | 'forbidden'; message: string }

export interface AdminSessionResponse {
  admin: boolean
}

export interface AdminEntry {
  id: number
  firstName: string
  email: string
  phone: string
  hasIdea: boolean
  idea: string | null
  referralCode: string
  /** Code of the person who referred this entry, if any. */
  referredByCode: string | null
  referredByName: string | null
  referredByEmail: string | null
  /** Times this person's link was opened. */
  visitCount: number
  /** Entries that signed up through this person's link. */
  referralCount: number
  /** ISO 8601 timestamp (UTC). */
  createdAt: string
}

export interface AdminTotals {
  entries: number
  withIdea: number
  withoutIdea: number
  /** Entries that came in through someone's link. */
  referredEntries: number
  /** All recorded link visits. */
  visits: number
}

export interface AdminData {
  totals: AdminTotals
  /** Newest first. */
  entries: AdminEntry[]
}

export type AdminDataResponse =
  | ({ ok: true } & AdminData)
  | { ok: false; error: 'unauthorized' | 'server_error'; message: string }
