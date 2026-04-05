import type { Metadata } from 'next'
import { StoreProvider } from '@/lib/store'
import './globals.css'

export const metadata: Metadata = {
  title: 'Teacher OS — Report Writer',
  description: 'Write hundreds of report comments in minutes, not hours.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
