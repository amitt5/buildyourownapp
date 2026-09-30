'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // The refresh below shows whatever state the server is really in.
    }
    router.refresh()
    setBusy(false)
  }

  return <button className="button button-dark" type="button" onClick={logout} disabled={busy}><LogOut size={15} /> {busy ? 'Logging out…' : 'Log out'}</button>
}
