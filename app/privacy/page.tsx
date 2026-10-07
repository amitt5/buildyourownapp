import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, Todo } from '@/components/legal-page'
import { WHATSAPP_URL } from '@/components/social-icons'
import { KVK, WHATSAPP_DISPLAY } from '@/lib/event'

export const metadata: Metadata = {
  title: 'Privacy policy | BYOA — Build Your Own App',
  description: 'How BYOA collects, uses and protects your details when you enter the giveaway and come to the workshop.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="2 October 2026">
      <p className="legal-lead">This page explains, in plain English, what we do with your details when you enter the BYOA giveaway and come to the workshop. Short version: we only collect what we need to run the giveaway and the workshop, we never sell your data, and you can ask us to delete it at any time.</p>

      <h2>Who is responsible</h2>
      <p>BYOA — Build Your Own App, <Todo>legal entity name</Todo>, Amsterdam, the Netherlands, KvK {KVK}. We are the &quot;controller&quot; of your personal data under the GDPR (AVG in Dutch).</p>
      <p>Contact: WhatsApp <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a> or email <Todo>contact email</Todo>.</p>

      <h2>What we collect</h2>
      <p>When you enter the giveaway:</p>
      <ul>
        <li>Your first name, email address and phone number.</li>
        <li>Whether you have an app idea, and the idea itself if you share it.</li>
        <li>Your personal referral code, and who referred you (if you came through a friend&apos;s link).</li>
        <li>The date and time you entered.</li>
      </ul>
      <p>When someone opens a referral link, we count the visit for that link. We only store the number of visits, not who visited. We do not store IP addresses.</p>
      <p>To remember which referral link you came from, your browser keeps the code for the current visit (session storage). We do not use cookies for this.</p>
      <p>We use Vercel Web Analytics to see how many people visit the site and which pages they view. It does not use cookies and does not let us identify you.</p>

      <h2>Why we use it, and on what basis</h2>
      <ul>
        <li><strong>To run the giveaway and the workshop:</strong> register your entry, check who is in the room for the draw, apply the referral rule, and tell the winner. Basis: taking part in the giveaway under the <Link href="/giveaway-terms">giveaway terms</Link> (performance of an agreement).</li>
        <li><strong>To contact you</strong> about the workshop (for example a reminder or a change of plans) by email, WhatsApp or phone. Basis: the same agreement.</li>
        <li><strong>To tell you about the founding-price offer</strong> for the program after the workshop. Basis: our legitimate interest. You can tell us to stop at any time.</li>
        <li><strong>To understand how the site is used</strong> (visit counts, referral counts). Basis: our legitimate interest in improving the site.</li>
      </ul>

      <h2>Where it is stored, and who helps us</h2>
      <p>Your entry is stored in a Neon Postgres database in the EU (Frankfurt, Germany). The website is hosted by Vercel. Both act as &quot;processors&quot;: they store and handle data for us, under our instructions, and may not use it for anything else. Vercel is a US company; where data is handled outside the EU, it is protected by the EU–US Data Privacy Framework or standard contractual clauses.</p>
      <p>Only the organiser can see the entries, through a password-protected admin page.</p>
      <p><strong>We never sell your data</strong> and we do not share it with anyone else, unless the law requires it.</p>

      <h2>How long we keep it</h2>
      <p>We delete giveaway entries within 12 months after the program ends. If you join the program as a student, we keep what we need for that (for example invoices, which Dutch law requires us to keep for 7 years). You can ask us to delete your details earlier at any time.</p>

      <h2>Your rights</h2>
      <p>You can ask us to:</p>
      <ul>
        <li>show you the data we have about you (access);</li>
        <li>correct it if it is wrong (correction);</li>
        <li>delete it (deletion);</li>
        <li>stop using it, for example for messages about the program (objection);</li>
        <li>give you a copy in a common format (portability).</li>
      </ul>
      <p>Send us a message (see &quot;How to contact us&quot;) and we will reply within one month. If you delete your entry before the draw, you can no longer win.</p>
      <p>If you are not happy with how we handle your data, please tell us first. You also have the right to complain to the Dutch data protection authority, the <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.</p>

      <h2>How to contact us</h2>
      <p>WhatsApp: <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a><br />Email: <Todo>contact email</Todo></p>

      <h2>Changes to this policy</h2>
      <p>If we change how we use your data, we will update this page and the date at the top. If the change is important, we will tell entrants directly.</p>
    </LegalPage>
  )
}
