import { getSql } from './db'
import type { AdminData, AdminEntry } from './entry-types'

// Server-only. These functions do NOT check auth themselves: every caller
// must check `await isAdmin()` first.

/** All entries, newest first, with referrer details and per-person counts. */
export async function getAdminData(): Promise<AdminData> {
  const sql = getSql()
  const [rows, visitTotal] = await Promise.all([
    sql`
      SELECT
        e.id, e.first_name, e.email, e.phone, e.has_idea, e.idea, e.referral_code,
        e.referred_by, r.first_name AS referrer_name, r.email AS referrer_email, e.created_at,
        (SELECT count(*) FROM referral_visits v WHERE v.referral_code = e.referral_code)::int AS visit_count,
        (SELECT count(*) FROM entries c WHERE c.referred_by = e.referral_code)::int AS referral_count
      FROM entries e
      LEFT JOIN entries r ON r.referral_code = e.referred_by
      ORDER BY e.created_at DESC, e.id DESC`,
    sql`SELECT count(*)::int AS visits FROM referral_visits`,
  ])

  const entries: AdminEntry[] = rows.map((row) => ({
    id: Number(row.id),
    firstName: row.first_name,
    email: row.email,
    phone: row.phone,
    hasIdea: row.has_idea,
    idea: row.idea,
    referralCode: row.referral_code,
    referredByCode: row.referred_by,
    referredByName: row.referrer_name,
    referredByEmail: row.referrer_email,
    visitCount: row.visit_count,
    referralCount: row.referral_count,
    createdAt: new Date(row.created_at).toISOString(),
  }))

  const withIdea = entries.filter((e) => e.hasIdea).length
  return {
    totals: {
      entries: entries.length,
      withIdea,
      withoutIdea: entries.length - withIdea,
      referredEntries: entries.filter((e) => e.referredByCode).length,
      visits: visitTotal[0].visits,
    },
    entries,
  }
}

function csvCell(value: string | number | boolean | null): string {
  let text = value === null ? '' : String(value)
  // Stop spreadsheet apps running a cell as a formula. Plain phone numbers
  // like "+31 6 1234 5678" are left alone.
  if (/^[=+\-@\t\r]/.test(text) && !/^\+?[\d\s().\-/]+$/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function adminDataToCsv(data: AdminData): string {
  const header = [
    'id', 'created_at', 'first_name', 'email', 'phone', 'has_idea', 'idea', 'referral_code',
    'referred_by_code', 'referred_by_name', 'referred_by_email', 'link_visits', 'referred_signups',
  ]
  const lines = data.entries.map((e) =>
    [
      e.id, e.createdAt, e.firstName, e.email, e.phone, e.hasIdea ? 'yes' : 'no', e.idea, e.referralCode,
      e.referredByCode, e.referredByName, e.referredByEmail, e.visitCount, e.referralCount,
    ].map(csvCell).join(','),
  )
  // BOM so Excel reads UTF-8 names correctly.
  return `﻿${[header.join(','), ...lines].join('\r\n')}\r\n`
}
