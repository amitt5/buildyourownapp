import { randomInt } from 'node:crypto'

// 31 characters: no 0/O, 1/I/L, so codes are easy to read out and retype.
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const CODE_LENGTH = 7

const CODE_PATTERN = /^[A-HJKMNP-Z2-9]{6,8}$/

/** Random code from a cryptographically secure source (31^7 ≈ 27.5 billion). */
export function generateReferralCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return code
}

/** Returns the cleaned-up code, or null if it cannot be a real code. */
export function normaliseReferralCode(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 32) return null
  const code = value.trim().toUpperCase()
  return CODE_PATTERN.test(code) ? code : null
}
