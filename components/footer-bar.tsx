import Link from 'next/link'
import { Brand } from '@/components/brand'
import { KVK } from '@/lib/event'

// Bottom row of the footer: logo, legal links, business details. Used on every public page.
export function FooterBar({ brandHref = '#top' }: { brandHref?: string }) {
  return (
    <div className="section-shell footer-inner">
      <Brand descriptor={false} href={brandHref} />
      <div><Link href="/giveaway-terms">Giveaway terms</Link><Link href="/privacy">Privacy policy</Link></div>
      <p>BYOA · Amsterdam · KvK {KVK}</p>
    </div>
  )
}
