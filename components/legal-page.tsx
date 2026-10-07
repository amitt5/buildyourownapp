import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Brand } from '@/components/brand'
import { FooterBar } from '@/components/footer-bar'

// Shared frame for the privacy policy and the giveaway terms.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <header className="site-header"><Brand href="/" /><Link className="legal-back" href="/"><ArrowLeft size={15} /> Back to the giveaway</Link></header>
      <main className="legal">
        <h1>{title}</h1>
        <p className="legal-meta">Last updated: {updated}</p>
        {children}
      </main>
      <footer className="footer footer-plain"><FooterBar brandHref="/" /></footer>
    </>
  )
}

// A clearly marked gap the organiser still has to fill in.
export function Todo({ children }: { children: React.ReactNode }) {
  return <span className="todo">[TODO: {children}]</span>
}
