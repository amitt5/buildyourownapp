'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, Check, ChevronDown, Copy, LoaderCircle, Mail, MapPin, Sparkles } from 'lucide-react'
import { Brand } from '@/components/brand'
import { INSTAGRAM_URL, InstagramIcon, WHATSAPP_URL, WhatsAppIcon } from '@/components/social-icons'
import { HONEYPOT_FIELD, LIMITS, type EntryField, type EntryResponse, type FieldErrors } from '@/lib/entry-types'

const steps = [
  ['01', 'Enter with your idea', 'Takes 30 seconds. Tell us what you want to build.'],
  ['02', 'Build it at the workshop', 'Come to the 3-hour Saturday workshop and build a working demo, live on the internet, link on your phone.'],
  ['03', 'Win the full program', 'One winner is drawn from the room. Bring friends: if any of them wins, you win too.'],
]

const weeks = [
  ['01', 'Foundations + first build', 'Install and understand every tool, scope your MVP, and make your first working screen.'],
  ['02', 'Core app', 'Understand the front end and back end simply. Build your main feature end to end.'],
  ['03', 'Data + users', 'Add databases and sign-in. Your app remembers things and knows who you are.'],
  ['04', 'Money + email', 'Add payments and automated email. Get your first paid flow working.'],
  ['05', 'Where it breaks', 'Debug, fix what is fragile, and polish the user experience.'],
  ['06', 'Launch', 'Deploy, add a domain and analytics, then onboard your first real user.'],
]

const faqs = [
  ['Do I need any coding experience?', 'No. You need a specific idea and the willingness to learn by building. Every tool and concept is explained in plain English.'],
  ['What tools will I use?', 'Claude Code, Lovable, Cursor, GitHub, Linear and other practical tools. You will understand what each one does and when to use it.'],
  ["What if I can't attend the workshop?", 'The workshop ticket is part of the giveaway entry, so you need to attend in person to be eligible for the live draw.'],
  ['How is the winner chosen?', 'One winner is drawn live at random from the people in the room at the end of the workshop.'],
  ['What are the conditions for the winner?', 'You agree to attend 5 of the 6 sessions, ship the app, and give a short testimonial about the experience.'],
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
      <h3>Bring friends.</h3>
      <p>If any of them wins, you win too. Share your link and bring them to the workshop.</p>
      <div className="share-link"><span>{link}</span><button type="button" onClick={async () => setCopied((await copyText(link)) ? 'Copied' : 'Select and copy')} aria-label="Copy referral link">{copied === 'Copied' ? <Check size={16} /> : <Copy size={16} />}<span aria-live="polite">{copied || 'Copy'}</span></button></div>
      <div className="share-actions"><a href={`mailto:?subject=${encodeURIComponent('Build your app in Amsterdam')}&body=${encodeURIComponent(`Join me at the workshop: ${link}`)}`}><Mail size={16} /> Email</a><a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> WhatsApp</a></div>
    </div>
  )
}

const emptyValues = { firstName: '', email: '', phone: '', choice: '' as '' | 'yes' | 'no', idea: '', [HONEYPOT_FIELD]: '' }
const fieldOrder: EntryField[] = ['firstName', 'email', 'phone', 'hasIdea', 'idea']
const fieldIds: Record<EntryField, string> = { firstName: 'entry-first-name', email: 'entry-email', phone: 'entry-phone', hasIdea: 'entry-idea-yes', idea: 'entry-idea' }

function EntryForm() {
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
      if (data.ok) { setErrors({}); setLink(`${window.location.origin}?ref=${data.referralCode}`); return }
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
      <p className="form-note">Free to enter. You&apos;ll get your workshop ticket by email. First 6 registrations get a 1-week Claude Code pass.</p>
    </form>
  )
}

export default function Page() {
  useReferralTracking()
  const scrollToForm = () => document.getElementById('entry')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <main>
      <header className="site-header"><Brand /><button className="header-cta" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={15} /></button></header>
      <section className="hero section-shell" id="top"><div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> Amsterdam · In person · 6 weeks</p><h1>Have a business idea?<br /><em>Build the app yourself.</em></h1><p className="hero-sub">Win a free seat in a 6-week program in Amsterdam where you build and launch your own app. <strong>No coding background needed.</strong></p><div className="hero-proof"><span><Check size={15} /> Build a real demo</span><span><Check size={15} /> Learn by doing</span></div></div><div className="hero-form" id="entry"><EntryForm /><p className="under-form">Entering gets you a ticket to the Saturday workshop on <strong>[DATE]</strong>. Winner drawn live at the end.</p></div></section>
      <section className="strip"><div className="section-shell strip-inner"><span>One idea.</span><span className="strip-line" /><span>One Saturday.</span><span className="strip-line" /><span>One shot at the full program.</span></div></section>
      <section className="section-shell section"><div className="section-intro"><p className="eyebrow">The simple version</p><h2>From idea to something<br /><em>you can show people.</em></h2></div><div className="steps-grid">{steps.map(([number, title, text]) => <article className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div><button className="button button-secondary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></section>
      <section className="tinted-section"><div className="section-shell section"><div className="section-intro"><p className="eyebrow">The prize</p><h2>Six weeks to build<br /><em>something real.</em></h2><p>A seat in the program, worth <strong>€2,600.</strong> Small group. Hands-on. Your idea on the screen.</p></div><div className="win-layout"><ul className="feature-list">{['Six weekly 4-hour in-person sessions in Amsterdam, group of 6–8: 1 hour teaching, 3 hours building with the instructor next to you','Weekly assignments between sessions: talk to users, test with strangers, write your launch copy','Slack support all week — post the broken screen, get unstuck','A production-ready app: sign-in, database, payments, deployed, ready for real customers','Fixed demo day with a 2-week buffer','Bonus session after demo day: AI for running the business — agents, reels, UGC ads, outreach'].map(item => <li key={item}><Check size={18} /> <span>{item}</span></li>)}</ul><div className="price-note"><Sparkles size={20} /><p>Getting an app like this built by an agency costs <strong>€10,000 or more</strong> — and you don&apos;t learn how to change it afterwards.</p></div></div><h3 className="subheading">Week by week</h3><div className="week-list">{weeks.map(([num, title, text]) => <div className="week-row" key={num}><span>{num}</span><strong>{title}</strong><p>{text}</p></div>)}</div><button className="button button-primary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></div></section>
      <section className="section-shell section"><div className="section-intro"><p className="eyebrow">Even if you don&apos;t win</p><h2>The Saturday workshop<br /><em>is worth showing up for.</em></h2></div><div className="workshop-grid"><ul className="feature-list compact">{['Bring your idea, leave with a working demo you built yourself, live on the internet','Leave with a detailed step-by-step plan for taking that demo to production — every step, tool and prompt','Watch a live build hit a wall and get fixed, so you know what breaks and how to get past it','Everyone builds with free tools. The first 6 registrations also get a 1-week Claude Code pass, handed out at the door'].map(item => <li key={item}><Check size={18} /> <span>{item}</span></li>)}</ul><div className="event-card"><MapPin size={20} /><p><strong>[DATE], [TIME]</strong><br />[VENUE], Amsterdam</p><span className="seat-badge">15–20 seats</span></div></div><button className="button button-secondary" onClick={scrollToForm}>Save my workshop ticket <ArrowRight size={17} /></button></section>
      <section className="dark-section"><div className="section-shell section"><div className="section-intro"><p className="eyebrow">A good fit goes both ways</p><h2>Is this <em>for you?</em></h2></div><div className="fit-grid"><div><h3>This is for you if</h3><ul><li>You have a specific idea</li><li>You can commit 5–6 hours a week for six weeks</li><li>You want to launch, not just learn</li></ul></div><div><h3>Not for you if</h3><ul><li>You want someone else to build it</li><li>You&apos;re looking for a general AI course</li><li>You can&apos;t attend in person in Amsterdam</li></ul></div></div><button className="button button-light" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></div></section>
      <section className="section-shell section teacher-section"><div className="teacher-photo" aria-label="Instructor photo placeholder"><span>[PHOTO]</span></div><div><p className="eyebrow">Who&apos;s teaching</p><h2>[NAME]</h2><p className="teacher-copy">Senior software engineer, 10+ years building production software. Teaches where AI-built apps break — and how to get past it.</p><button className="button button-secondary" onClick={scrollToForm}>Meet me at the workshop <ArrowRight size={17} /></button></div></section>
      <section className="accent-section"><div className="section-shell section founding"><div><p className="eyebrow">Everyone else</p><h2>Join at the<br /><em>founding price.</em></h2></div><div><p>If you don&apos;t win, workshop attendees can join the first cohort for <strong>€1,300</strong>. List price is €2,600 once the results are in.</p><p>Valid for 72 hours after the workshop. Pairs building one idea together pay 1.5 seats.</p><button className="button button-dark" onClick={scrollToForm}>Get my workshop ticket <ArrowRight size={17} /></button></div></div></section>
      <section className="section-shell section faq-section"><div className="section-intro"><p className="eyebrow">Questions, answered</p><h2>Good to know.</h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={20} /></summary><p>{answer}</p></details>)}</div><button className="button button-primary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></section>
      <section className="final-cta"><div className="section-shell"><p className="eyebrow">Your idea is waiting</p><h2>Have a business idea?<br /><em>Build the app yourself.</em></h2><button className="button button-light" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button><p className="cta-contact">Got a question first? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us</a> or find us on <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>.</p></div></section>
      <footer className="footer"><div className="section-shell footer-contact"><div><h2>Got a question?</h2><p>Message us. A real person answers.</p></div><div className="contact-links"><a className="button button-light" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} /> WhatsApp us</a><a className="button button-ghost" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><InstagramIcon size={18} /> Instagram</a></div></div><div className="section-shell footer-inner"><Brand descriptor={false} /><div><a href="#">Giveaway terms</a><a href="#">Privacy policy</a></div><p>Made for people with an idea.</p></div></footer>
      <div className="mobile-bar"><button className="button button-primary" onClick={scrollToForm}>Enter the giveaway <ArrowRight size={17} /></button></div>
    </main>
  )
}
