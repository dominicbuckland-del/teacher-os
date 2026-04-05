'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Page titles for mobile header
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/emails': 'Email Templates',
    '/planner': 'Planner',
    '/resources': 'Resources',
    '/settings': 'Settings',
  }
  const title = Object.entries(titles).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )?.[1] || 'Teacher OS'

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden flex items-center h-12 px-4 border-b border-border bg-surface shrink-0 safe-top">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-border-light -ml-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="font-semibold text-[15px] ml-2">{title}</span>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
    </div>
  )
}
