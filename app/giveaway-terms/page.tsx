import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, Todo } from '@/components/legal-page'
import { WHATSAPP_URL } from '@/components/social-icons'
import { KVK, PROGRAM, WHATSAPP_DISPLAY, WORKSHOP } from '@/lib/event'

export const metadata: Metadata = {
  title: 'Giveaway terms | BYOA — Build Your Own App',
  description: `The rules of the BYOA giveaway: who can enter, the prize, the referral rule and how the winner is drawn live at the workshop on ${WORKSHOP.day}.`,
}

export default function GiveawayTermsPage() {
  return (
    <LegalPage title="Giveaway terms" updated="2 October 2026">
      <p className="legal-lead">These are the rules of the BYOA giveaway. They follow the Dutch code of conduct for promotional games of chance (Gedragscode Promotionele Kansspelen). By entering, you agree to them.</p>

      <h2>1. Who runs the giveaway</h2>
      <p>BYOA — Build Your Own App, <Todo>legal entity name and address</Todo>, Amsterdam, KvK {KVK}. Contact: WhatsApp <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a> or email <Todo>contact email</Todo>.</p>

      <h2>2. When it runs</h2>
      <p>The giveaway starts when this page is published. Entries close at the start of the workshop: <strong>{WORKSHOP.day}, 10:00</strong> (Amsterdam time).</p>

      <h2>3. Who can enter</h2>
      <ul>
        <li>You are 18 or older.</li>
        <li>You can come to the workshop and the program in person in Amsterdam.</li>
        <li>People who organise or work on BYOA cannot enter.</li>
      </ul>

      <h2>4. How to enter</h2>
      <ul>
        <li>Fill in the form on our website. Entering is <strong>free</strong>. You never have to buy anything to take part or to win.</li>
        <li>One entry per person and per email address. Entering again with the same email does not give you an extra chance.</li>
        <li>Use your own, correct details. We may exclude entries that are fake, made in someone else&apos;s name, or made to game the referral rule.</li>
      </ul>

      <h2>5. The workshop</h2>
      <p>Entering means you come to the free in-person workshop on <strong>{WORKSHOP.day}, {WORKSHOP.time}</strong>, at {WORKSHOP.venue}, {WORKSHOP.address}. The workshop has room for {WORKSHOP.seats} people. <Todo>what happens when the workshop is full, e.g. a waiting list in order of entry</Todo></p>

      <h2>6. The prize</h2>
      <p>One free seat in the BYOA in-person program in Amsterdam ({PROGRAM.length}: 4 weeks of weekly lessons and building, then up to 2 extra weeks of building if needed). The prize is worth <strong>{PROGRAM.regularPrice} (incl. BTW)</strong>.</p>
      <ul>
        <li>The prize cannot be exchanged for cash or for another prize, and cannot be passed on to someone else.</li>
        <li>The winner agrees to attend at least 3 of the 4 weekly sessions, to launch the app, and to give a short testimonial about the experience.</li>
        <li>If the winner does not accept the prize within 7 days of the draw, or cannot take part, we may draw a new winner from the entrants who were at the workshop.</li>
        <li>You do not pay any tax on the prize. If games-of-chance tax (kansspelbelasting) is due, the organiser pays it.</li>
      </ul>

      <h2>7. Bringing friends (the referral rule)</h2>
      <p>After you enter, you get a personal link. <strong>Bring friends with your link. If one of them is drawn, you both get a free seat.</strong> This applies when all of these are true:</p>
      <ul>
        <li>Your friend entered through your personal link before entries closed.</li>
        <li>Your friend is at the workshop and is drawn as the winner.</li>
        <li>You are a valid entrant yourself: you meet the rules in sections 3 and 4 and entered before entries closed. <Todo>confirm whether the referrer must also be at the draw</Todo></li>
      </ul>
      <p>Then your friend wins the prize and you get a free seat on the same terms as in section 6. Only the person whose link the winner used gets the extra seat.</p>

      <h2>8. How and when the winner is chosen</h2>
      <p>One winner is drawn live and at random at the end of the workshop on {WORKSHOP.day}, from the entrants who are in the room. You must be there to win. The winner is told on the spot. If the winner came through a referral link, we tell the referrer within 7 days by email, WhatsApp or phone. We only share a winner&apos;s name publicly (for example on Instagram) with their permission.</p>

      <h2>9. If you don&apos;t win: founding price</h2>
      <p>The regular price of the program is {PROGRAM.regularPrice} (incl. BTW). Workshop attendees who don&apos;t win can join the first cohort for <strong>{PROGRAM.foundingPrice} (incl. BTW)</strong>. This offer is valid for 72 hours after the workshop ends (until Tuesday 3 November 2026, 14:00). Buying is never a condition for entering or winning.</p>

      <h2>10. Your privacy</h2>
      <p>We use your details only to run the giveaway and the workshop, and to tell you about the founding-price offer. See our <Link href="/privacy">privacy policy</Link>.</p>

      <h2>11. Questions and complaints</h2>
      <p>Send a message to WhatsApp <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a> or email <Todo>contact email</Todo>. We will reply within two weeks.</p>

      <h2>12. Changes</h2>
      <p>We may change or end the giveaway early for a good reason, for example if the venue becomes unavailable or there is fraud. We will not change the rules to the disadvantage of entrants without a good reason. Any change is posted on this page and shared with entrants.</p>

      <h2>13. Law</h2>
      <p>Dutch law applies to this giveaway.</p>
    </LegalPage>
  )
}
