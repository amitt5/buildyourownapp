import type { Metadata } from 'next'
import { Download } from 'lucide-react'
import { Brand } from '@/components/brand'
import { isAdmin } from '@/lib/admin-auth'
import { getAdminData } from '@/lib/admin-data'
import type { AdminData } from '@/lib/entry-types'
import { LoginForm } from './login-form'
import { LogoutButton } from './logout-button'

export const metadata: Metadata = {
  title: 'Admin | BYOA',
  robots: { index: false, follow: false, nocache: true },
}

// Always rendered per request: the page depends on the login cookie and live data.
export const dynamic = 'force-dynamic'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
})

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export default async function AdminPage() {
  if (!(await isAdmin())) return <main className="login-wrap"><Brand href="/" /><LoginForm /></main>

  let data: AdminData | null = null
  try {
    data = await getAdminData()
  } catch (error) {
    console.error('[admin] failed to load entries:', error instanceof Error ? error.message : error)
  }

  const totals = data?.totals
  const stats: [string, number | undefined][] = [
    ['Entries', totals?.entries], ['With idea', totals?.withIdea], ['Without idea', totals?.withoutIdea],
    ['Referred sign-ups', totals?.referredEntries], ['Link visits', totals?.visits],
  ]

  return (
    <main className="admin">
      <header className="admin-header">
        <Brand href="/" />
        <div className="admin-actions">
          {/* Plain link on purpose: this is a file download, not a page. */}
          <a className="button button-secondary" href="/api/admin/export" download><Download size={15} /> Download CSV</a>
          <LogoutButton />
        </div>
      </header>
      <div className="admin-title"><p className="eyebrow">Giveaway admin</p><h1>Entries</h1></div>
      <dl className="stat-grid">{stats.map(([label, value]) => <div className="stat" key={label}><dt>{label}</dt><dd>{value ?? '–'}</dd></div>)}</dl>
      {!data ? (
        <div className="admin-card is-empty empty-state" role="alert"><h2>Could not load the entries.</h2><p>The database did not answer. Reload the page to try again.</p></div>
      ) : data.entries.length === 0 ? (
        <div className="admin-card is-empty empty-state"><h2>No entries yet.</h2><p>When someone enters the giveaway, they will show up here, newest first.</p></div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead><tr><th scope="col">Date</th><th scope="col">First name</th><th scope="col">Email</th><th scope="col">Phone</th><th scope="col">Idea</th><th scope="col">Their code</th><th scope="col">Referred by</th><th scope="col" className="num">Link visits</th><th scope="col" className="num">Referred sign-ups</th></tr></thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="Date" className="nowrap"><time dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time></td>
                  <td data-label="First name"><strong>{entry.firstName}</strong></td>
                  <td data-label="Email"><a href={`mailto:${entry.email}`}>{entry.email}</a></td>
                  <td data-label="Phone" className="nowrap"><a href={telHref(entry.phone)}>{entry.phone}</a></td>
                  <td data-label="Idea" className="idea">{entry.hasIdea && entry.idea ? entry.idea : <span className="muted">No idea yet</span>}</td>
                  <td data-label="Their code"><span className="code">{entry.referralCode}</span></td>
                  <td data-label="Referred by" className="ref-by">{entry.referredByCode ? <div><span>{entry.referredByName ?? 'Unknown'}</span><span className="code">{entry.referredByCode}</span></div> : <span className="muted">—</span>}</td>
                  <td data-label="Link visits" className="num">{entry.visitCount}</td>
                  <td data-label="Referred sign-ups" className="num">{entry.referralCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
