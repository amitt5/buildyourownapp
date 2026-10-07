'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Check, ChevronDown, Copy, LoaderCircle, Mail, MapPin, Sparkles, Users } from 'lucide-react'
import { Brand } from '@/components/brand'
import { FooterBar } from '@/components/footer-bar'
import { INSTAGRAM_URL, InstagramIcon, WHATSAPP_URL, WhatsAppIcon } from '@/components/social-icons'
import { HONEYPOT_FIELD, LIMITS, type EntryField, type EntryResponse, type FieldErrors } from '@/lib/entry-types'
import { PROGRAM, WORKSHOP } from '@/lib/event'
import { REMAINING } from '@/lib/remaining'

const REFERRAL_RULE = 'Bring friends with your link. If one of them is drawn, you both get a free seat.'
const WHEN = `${WORKSHOP.dayShort}, ${WORKSHOP.time}`

const steps = [
  ['01', 'Enter with your idea', 'Takes 30 seconds. Tell us what you want to build.'],
  ['02', 'Build it at the workshop', `Come to the free ${WORKSHOP.hours}-hour workshop on ${WORKSHOP.day.replace(' 2026', '')} and build a working demo, live on the internet, link on your phone.`],
  ['03', 'Win the full program', `One winner is drawn live from the people in the room. ${REFERRAL_RULE}`],
]

// Lessons + building for 4 weeks, then up to 2 extra building weeks.
const weeks = [
  ['01', 'Foundations + first build', 'Set up and understand every tool, decide the smallest version of your app worth launching, and make your first working screen.'],
  ['02', 'Core app', 'Learn what the screen part and the behind-the-scenes part of an app do. Build your main feature.'],
  ['03', 'Data, users + money', 'Add a database and sign-in, so your app remembers things and knows who you are. Add payments and automatic emails.'],
  ['04', 'Fix + launch', 'Find and fix what breaks, polish it, then put it live on your own web address and welcome your first real user.'],
  ['+2', 'Extra building weeks', 'Up to 2 more weeks of building, with help, if you need them to finish.'],
]

const faqs = [
  ['Do I need any coding experience?', 'No. You need a specific idea and the willingness to learn by building. Every tool and concept is explained in plain English.'],
  ['Do I have to come to the workshop?', `Yes. Entering means coming to the free workshop on ${WORKSHOP.day}, ${WORKSHOP.time}, at ${WORKSHOP.venue}, ${WORKSHOP.addressShort}. The winner is drawn live from the people in the room, so you must be there to win.`],
  ['How is the winner chosen?', 'One winner is drawn live at random from the entrants in the room at the end of the workshop.'],
  ['How does bringing friends work?', `${REFERRAL_RULE} Your friend must enter through your personal link before entries close and be at the draw. See the giveaway terms for the details.`],
  ['How long is the program?', `${PROGRAM.length}. The first 4 weeks are weekly lessons plus building. Then you get up to 2 extra weeks of building if you need them.`],
  ['Do I need to pay for any tools?', 'No. Everyone builds with free tools. No hidden costs.'],
  ['What tools will I use?', 'AI tools that write code for you, like Claude Code, Lovable and Cursor, plus GitHub to keep your work safe. You will understand what each one does and when to use it.'],
  ['What are the conditions for the winner?', 'You agree to attend at least 3 of the 4 weekly sessions, launch the app, and give a short testimonial about the experience.'],
  ["What if I don't have an idea yet?", 'You can still enter if you have a problem you would like to solve. We will help you shape it at the workshop.'],
]

const REF_KEY = 'byoa_ref'
const VISIT_KEY = 'byoa_visit_'
const REF_PATTERN = /^[A-Z0-9]{6,8}$/
// Used when sessionStorage is unavailable (some private modes), so the code still reaches the form.
let memoryRef = ''
const visitedInMemory = new Set<string>()

function readRef() {
  try { return window.sessionStorage.getItem(REF_KEY) || memoryRef } catch { return memoryRef }
}

// Runs once after mount: remembers ?ref=CODE for the form and counts one visit per browser session.
function useReferralTracking() {
  useEffect(() => {
    const code = (new URLSearchParams(window.location.search).get('ref') ?? '').trim().toUpperCase()
    if (!REF_PATTERN.test(code)) return
    memoryRef = code
    let seen = false
    try {
      window.sessionStorage.setItem(REF_KEY, code)
      seen = window.sessionStorage.getItem(VISIT_KEY + code) === '1'
      window.sessionStorage.setItem(VISIT_KEY + code, '1')
    } catch {
      seen = visitedInMemory.has(code)
    }
    if (seen || visitedInMemory.has(code)) return
    visitedInMemory.add(code)
    fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: code }), keepalive: true }).catch(() => {})
  }, [])
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true } catch { /* fall through to the old way */ }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let ok = false
  try { ok = document.execCommand('copy') } catch { ok = false }
  area.remove()
  return ok
}

function SuccessCard({ link }: { link: string }) {
  const [copied, setCopied] = useState<'' | 'Copied' | 'Select and copy'>('')
  const card = useRef<HTMLDivElement>(null)
  useEffect(() => { card.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(''), 2200)
    return () => window.clearTimeout(timer)
  }, [copied])
  const shareText = encodeURIComponent(`Build your app in Amsterdam ${link}`)
  return (
    <div className="success-card" ref={card} tabIndex={-1} role="status">
      <div className="success-icon"><Check /></div>
      <p className="eyebrow">You&apos;re in</p>
      <h3>See you there.</h3>
      <p>You&apos;re in. See you {WHEN} at {WORKSHOP.venue}, {WORKSHOP.addressShort}. Save the date — we&apos;ll be in touch before the workshop.</p>
      <p className="success-share">{REFERRAL_RULE}</p>
      <div className="share-link"><span>{link}</span><button type="button" onClick={async () => setCopied((await copyText(link)) ? 'Copied' : 'Select and copy')} aria-label="Copy referral link">{copied === 'Copied' ? <Check size={16} /> : <Copy size={16} />}<span aria-live="polite">{copied || 'Copy'}</span></button></div>
      <div className="share-actions"><a href={`mailto:?subject=${encodeURIComponent('Build your app in Amsterdam')}&body=${encodeURIComponent(`Join me at the workshop: ${link}`)}`}><Mail size={16} /> Email</a><a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> WhatsApp</a></div>
    </div>
  )
}

const emptyValues = { firstName: '', email: '', phone: '', choice: '' as '' | 'yes' | 'no', idea: '', [HONEYPOT_FIELD]: '' }
const fieldOrder: EntryField[] = ['firstName', 'email', 'phone', 'hasIdea', 'idea']
const fieldIds: Record<EntryField, string> = { firstName: 'entry-first-name', email: 'entry-email', phone: 'entry-phone', hasIdea: 'entry-idea-yes', idea: 'entry-idea' }

function EntryForm({ onSuccess }: { onSuccess: () => void }) {
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  // Built from the site's own address after a successful entry (client only), so it works on any domain.
  const [link, setLink] = useState('')

  const set = (field: keyof typeof emptyValues, errorField?: EntryField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    if (errorField && errors[errorField]) setErrors((current) => ({ ...current, [errorField]: undefined }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setFormError('')
    const hasIdea = values.choice === '' ? undefined : values.choice === 'yes'
    const ref = readRef()
    const payload = { firstName: values.firstName, email: values.email, phone: values.phone, hasIdea, ...(hasIdea ? { idea: values.idea } : {}), ...(ref ? { ref } : {}), [HONEYPOT_FIELD]: values[HONEYPOT_FIELD] }
    try {
      const response = await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = (await response.json()) as EntryResponse
      if (data.ok) { setErrors({}); setLink(`${window.location.origin}?ref=${data.referralCode}`); onSuccess(); return }
      if (data.error === 'validation') {
        setErrors(data.fieldErrors)
        setFormError(data.message)
        const first = fieldOrder.find((field) => data.fieldErrors[field])
        if (first) document.getElementById(fieldIds[first])?.focus()
      } else {
        setErrors({})
        setFormError(data.message || 'Something went wrong. Please try again in a moment.')
      }
    } catch {
      setFormError('We could not reach the server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (link) return <SuccessCard link={link} />

  const describe = (field: EntryField) => ({ 'aria-invalid': errors[field] ? true : undefined, 'aria-describedby': errors[field] ? `${fieldIds[field]}-error` : undefined })
  const fieldError = (field: EntryField) => errors[field] && <p className="field-error" id={`${fieldIds[field]}-error`}>{errors[field]}</p>
  const star = <span className="req" aria-hidden="true"> *</span>

  return (
    <form className="entry-form" onSubmit={submit} noValidate aria-busy={busy}>
      <div className="form-heading"><span className="form-kicker">Free giveaway</span><h2>Enter with your idea.</h2><p>It takes 30 seconds.</p></div>
      <div className="field"><label htmlFor={fieldIds.firstName}>First name{star}</label><input id={fieldIds.firstName} required name="firstName" type="text" autoComplete="given-name" autoCapitalize="words" maxLength={LIMITS.firstName} placeholder="Your first name" value={values.firstName} onChange={set('firstName', 'firstName')} {...describe('firstName')} />{fieldError('firstName')}</div>
      <div className="field"><label htmlFor={fieldIds.email}>Email{star}</label><input id={fieldIds.email} required name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={LIMITS.email} placeholder="you@example.com" value={values.email} onChange={set('email', 'email')} {...describe('email')} />{fieldError('email')}</div>
      <div className="field"><label htmlFor={fieldIds.phone}>Phone number{star}</label><input id={fieldIds.phone} required name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.phone} placeholder="+31 6 1234 5678" value={values.phone} onChange={set('phone', 'phone')} {...describe('phone')} />{fieldError('phone')}</div>
      <fieldset className="choice" aria-describedby={errors.hasIdea ? `${fieldIds.hasIdea}-error` : undefined}>
        <legend>Do you have an app idea?{star}</legend>
        <label className="choice-option"><input id={fieldIds.hasIdea} type="radio" name="hasIdea" value="yes" required checked={values.choice === 'yes'} onChange={set('choice', 'hasIdea')} aria-invalid={errors.hasIdea ? true : undefined} /><span>I have an app idea</span></label>
        <label className="choice-option"><input type="radio" name="hasIdea" value="no" required checked={values.choice === 'no'} onChange={set('choice', 'hasIdea')} aria-invalid={errors.hasIdea ? true : undefined} /><span>I don&apos;t have an app idea yet</span></label>
        {fieldError('hasIdea')}
      </fieldset>
      {values.choice === 'yes' && <div className="field"><label htmlFor={fieldIds.idea}>Your app idea{star}</label><textarea id={fieldIds.idea} required name="idea" maxLength={LIMITS.idea} rows={3} placeholder="e.g. a booking app for my yoga studio" value={values.idea} onChange={set('idea', 'idea')} {...describe('idea')} />{fieldError('idea')}</div>}
      <div className="hp" aria-hidden="true"><label htmlFor="entry-website">Website</label><input id="entry-website" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" value={values[HONEYPOT_FIELD]} onChange={set(HONEYPOT_FIELD)} /></div>
      <div role="alert">{formError && <p className="form-error">{formError}</p>}</div>
      <button className="button button-primary form-submit" type="submit" disabled={busy}>{busy ? <>Sending your entry… <LoaderCircle className="spin" size={17} /></> : <>Enter the giveaway <ArrowRight size={17} /></>}</button>
      <p className="form-note">Free to enter. You must come to the workshop on <strong className="nw">{WHEN}</strong> at {WORKSHOP.venue} Amsterdam to win.</p>
      <p className="form-consent">By entering you agree to the <Link href="/giveaway-terms">giveaway terms</Link> and our <Link href="/privacy">privacy policy</Link>.</p>
    </form>
  )
}

// Hides the phone sticky bar while the form (or the success card) is on screen,
// and for good after a successful entry, so it never covers the real submit button.
function useStickyBar(entered: boolean) {
  // Starts hidden: the server render and the first client render match, then the observer decides.
  const [formInView, setFormInView] = useState(true)
  useEffect(() => {
    const target = document.getElementById('entry')
    if (!target || typeof IntersectionObserver === 'undefined') { setFormInView(false); return }
    const observer = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), { rootMargin: '0px 0px 80px 0px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])
  return !entered && !formInView
}

function Remaining() {
  if (REMAINING.length === 0) return null
  return (
    <section className="remaining" aria-labelledby="remaining-title"><div className="section-shell remaining-inner"><p className="eyebrow">For the organiser</p><h2 id="remaining-title">Remaining before launch</h2><p className="remaining-intro">Open items. When this list is empty, the page is ready to share.</p><ul>{REMAINING.map((item) => <li key={item}><span aria-hidden="true" className="remaining-box" />{item}</li>)}</ul></div></section>
  )
}

const prizeFeatures = [
  'Four weekly 4-hour in-person sessions in Amsterdam, group of 6–8: 1 hour teaching, 3 hours building with the instructor next to you',
  'Then up to 2 extra weeks of building, with help, if you need them to finish',
  'Weekly assignments between sessions: talk to users, test with strangers, write your launch copy',
  'A group chat for questions between sessions — post the broken screen, get unstuck',
  'An app that is ready for real customers: sign-in, a database, payments, and live on the internet',
  'A demo day at the end, to show people what you built',
  'Bonus session after demo day: using AI to run the business — AI assistants that do tasks for you, reels, ads made with AI, outreach',
  'Everyone builds with free tools. No hidden costs.',
]

const workshopFeatures = [
  'Bring your idea, leave with a working demo you built yourself, live on the internet',
  'Leave with a detailed step-by-step plan for turning that demo into a real app people can use — every step, tool and prompt',
  'Watch a live build hit a wall and get fixed, so you know what breaks and how to get past it',
  'Everyone builds with free tools. No hidden costs.',
]

export default function Page() {
  useReferralTracking()
  const [entered, setEntered] = useState(false)
  const showBar = useStickyBar(entered)
  const scrollToForm = () => document.getElementById('entry')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <main>
      <header className="site-header"><Brand /><button className="header-cta" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={15} /></button></header>
      <section className="hero section-shell" id="top"><div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> Amsterdam · In person · {PROGRAM.length}</p><h1>Have a business idea?<br /><em>Build the app yourself.</em></h1><p className="hero-sub">Win a free seat in a {PROGRAM.length.replace('weeks', 'week')} program in Amsterdam where you build and launch your own app. <strong>No coding background needed.</strong></p>
        <div className="hero-deal"><p className="hero-deal-title">How it works</p><ul><li><CalendarDays size={17} /><span>Entering means coming to the <strong>free workshop</strong> on <strong className="nw">{WHEN}</strong>.</span></li><li><MapPin size={17} /><span>{WORKSHOP.venue}, {WORKSHOP.addressShort}.</span></li><li><Users size={17} /><span>The winner is drawn live from the people in the room. <strong>You must be there to win.</strong></span></li></ul></div></div>
        <div className="hero-form" id="entry"><EntryForm onSuccess={() => setEntered(true)} /></div></section>
      <section className="strip"><div className="section-shell strip-inner"><span>One idea.</span><span className="strip-line" /><span>One Saturday.</span><span className="strip-line" /><span>One shot at the full program.</span></div></section>
      <section className="section-shell section"><div className="section-intro"><p className="eyebrow">The simple version</p><h2>From idea to something<br /><em>you can show people.</em></h2></div><div className="steps-grid">{steps.map(([number, title, text]) => <article className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div><button className="button button-secondary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></section>
      <section className="tinted-section"><div className="section-shell section"><div className="section-intro"><p className="eyebrow">The prize</p><h2>Four to six weeks to<br /><em>build something real.</em></h2><p>A seat in the program, worth <strong>{PROGRAM.regularPrice} (incl. BTW).</strong> Four weeks of lessons and building, then up to 2 extra weeks of building if you need them. Small group. Hands-on. Your idea on the screen.</p></div><div className="win-layout"><ul className="feature-list">{prizeFeatures.map(item => <li key={item}><Check size={18} /> <span>{item}</span></li>)}</ul><div className="price-note"><Sparkles size={20} /><p>Getting an app like this built by an agency costs <strong>€10,000 or more</strong> — and you don&apos;t learn how to change it afterwards.</p></div></div><h3 className="subheading">Week by week</h3><div className="week-list">{weeks.map(([num, title, text]) => <div className="week-row" key={num}><span>{num}</span><strong>{title}</strong><p>{text}</p></div>)}</div><button className="button button-primary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></div></section>
      <section className="section-shell section"><div className="section-intro"><p className="eyebrow">Even if you don&apos;t win</p><h2>The Saturday workshop<br /><em>is worth showing up for.</em></h2></div><div className="workshop-grid"><ul className="feature-list compact">{workshopFeatures.map(item => <li key={item}><Check size={18} /> <span>{item}</span></li>)}</ul><div className="event-card"><MapPin size={20} /><p><strong>{WORKSHOP.day}<br />{WORKSHOP.time}</strong><br />{WORKSHOP.venue}, {WORKSHOP.address}</p><span className="seat-badge">Free · {WORKSHOP.seats} seats</span></div></div><button className="button button-secondary" onClick={scrollToForm}>Save my workshop ticket <ArrowRight size={17} /></button></section>
      <section className="dark-section"><div className="section-shell section"><div className="section-intro"><p className="eyebrow">A good fit goes both ways</p><h2>Is this <em>for you?</em></h2></div><div className="fit-grid"><div><h3>This is for you if</h3><ul><li>You have a specific idea</li><li>You can commit 5–6 hours a week for 4 to 6 weeks</li><li>You want to launch, not just learn</li></ul></div><div><h3>Not for you if</h3><ul><li>You want someone else to build it</li><li>You&apos;re looking for a general AI course</li><li>You can&apos;t attend in person in Amsterdam</li></ul></div></div><button className="button button-light" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></div></section>
      <section className="section-shell section teacher-section"><Image className="teacher-photo" src="/amit-goel.jpg" alt="Amit Goel, the instructor" width={560} height={720} sizes="(max-width: 760px) 180px, 260px" /><div><p className="eyebrow">Who&apos;s teaching</p><h2>Amit Goel</h2><p className="teacher-copy">Senior software engineer, 10+ years building software that real customers use every day. Teaches where AI-built apps break — and how to get past it.</p><button className="button button-secondary" onClick={scrollToForm}>Meet Amit at the workshop <ArrowRight size={17} /></button></div></section>
      <section className="accent-section"><div className="section-shell section founding"><div><p className="eyebrow">Everyone else</p><h2>Join at the<br /><em>founding price.</em></h2></div><div><p className="founding-price"><span className="founding-now">{PROGRAM.foundingPrice}</span><s aria-label={`Regular price ${PROGRAM.regularPrice}`}>{PROGRAM.regularPrice}</s><span className="founding-vat">incl. BTW</span></p><p>The regular price is {PROGRAM.regularPrice} (incl. BTW). Workshop attendees who don&apos;t win can join the first cohort for <strong>{PROGRAM.foundingPrice} (incl. BTW)</strong>, valid for 72 hours after the workshop.</p><p>Pairs building one idea together pay 1.5 seats. Everyone builds with free tools. No hidden costs.</p><button className="button button-dark" onClick={scrollToForm}>Enter the giveaway first <ArrowRight size={17} /></button></div></div></section>
      <section className="section-shell section faq-section"><div className="section-intro"><p className="eyebrow">Questions, answered</p><h2>Good to know.</h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={20} /></summary><p>{answer}</p></details>)}</div><button className="button button-primary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></section>
      <section className="final-cta"><div className="section-shell"><p className="eyebrow">Your idea is waiting</p><h2>Have a business idea?<br /><em>Build the app yourself.</em></h2><button className="button button-light" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button><p className="cta-contact">Got a question first? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us</a> or find us on <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>.</p></div></section>
      <Remaining />
      <footer className="footer"><div className="section-shell footer-contact"><div><h2>Got a question?</h2><p>Message us. A real person answers.</p></div><div className="contact-links"><a className="button button-light" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} /> WhatsApp us</a><a className="button button-ghost" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><InstagramIcon size={18} /> Instagram</a></div></div><FooterBar /></footer>
      <div className={`mobile-bar${showBar ? '' : ' is-hidden'}`} aria-hidden={showBar ? undefined : true} inert={!showBar}><button className="button button-primary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></div>
    </main>
  )
}
