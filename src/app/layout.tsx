import type { Metadata, Viewport } from 'next'
import { StoreProvider } from '@/lib/store'
import './globals.css'

export const metadata: Metadata = {
  title: 'Teacher OS',
  description: 'The operating system for teachers — report comments, lesson planning, email templates, and resources.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Teacher OS',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D9488',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
