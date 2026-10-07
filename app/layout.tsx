import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, Antonio, Inter_Tight } from 'next/font/google'
import './globals.css'

const display = Antonio({ subsets: ['latin'], weight: ['700'], variable: '--font-display', display: 'swap' })
const logo = Anton({ subsets: ['latin'], weight: '400', variable: '--font-logo', display: 'swap' })
const body = Inter_Tight({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title: 'Build your app in Amsterdam | Win a free 4–6 week program',
  description: 'Have a business idea? Build the app yourself. Come to a free workshop in Amsterdam on Sat 31 Oct 2026 and win a free seat in a 4–6 week in-person app-building program. No coding background needed.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${logo.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
