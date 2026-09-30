'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import type { AdminLoginResponse } from '@/lib/entry-types'

export function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const data = (await response.json()) as AdminLoginResponse
      if (data.ok) {
        // Stay busy: the server re-renders this page with the entries.
        router.refresh()
        return
      }
      if (data.error === 'invalid_password') setError('Wrong password. Please try again.')
      else if (data.error === 'not_configured') setError('Admin access is not set up on the server yet. Set ADMIN_PASSWORD in the site settings, then redeploy.')
      else setError(data.message || 'Could not log in. Please try again.')
    } catch {
      setError('We could not reach the server. Check your connection and try again.')
    }
    setBusy(false)
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <h1>Admin</h1>
      <p>Enter the admin password to see the giveaway entries.</p>
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? 'admin-login-error' : undefined} />
      <div role="alert">{error && <p className="form-error" id="admin-login-error">{error}</p>}</div>
      <button className="button button-primary" type="submit" disabled={busy}>{busy ? <>Checking… <LoaderCircle className="spin" size={17} /></> : <>Log in <ArrowRight size={17} /></>}</button>
    </form>
  )
}
