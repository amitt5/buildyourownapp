// Small inline icons: lucide-react does not ship brand icons.
type IconProps = { size?: number }

export function InstagramIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function WhatsAppIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M3 21l1.6-4.9A8.5 8.5 0 1 1 8 19.5L3 21z" />
      <path d="M9 8.2c-.4 1.1.3 2.8 1.7 4.2s3.1 2.1 4.2 1.7l.7-1.1-1.8-1-.8.7c-.8-.4-1.5-1.1-1.9-1.9l.7-.8-1-1.8z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const INSTAGRAM_URL = 'https://www.instagram.com/buildyourownapp/'
export const WHATSAPP_URL = 'https://wa.me/31687188673'
