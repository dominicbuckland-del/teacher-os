'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const coreNav = [
  { href: '/', label: 'Dashboard', icon: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z' },
  { href: '/classes', label: 'Reports', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', matchStart: true },
  { href: '/rubrics', label: 'Assessments', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { href: '/emails', label: 'Emails', icon: 'M2 4h20v16H2zM22 7l-10 7L2 7' },
  { href: '/relief', label: 'Relief Notes', icon: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9zM12 11h4M12 16h4M8 11h.01M8 16h.01' },
]

const moreNav = [
  { href: '/planner', label: 'Planner', icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18' },
  { href: '/behaviour', label: 'Behaviour', icon: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
  { href: '/students', label: 'Students', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { href: '/feedback', label: 'Feedback', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { href: '/comms', label: 'Parent Comms', icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' },
  { href: '/resources', label: 'Resources', icon: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM14 2v6h6M12 18v-6M9 15h6' },
  { href: '/context', label: 'My Context', icon: 'M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 21a8 8 0 0 0-16 0' },
  { href: '/settings', label: 'Settings', icon: 'M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(() => {
    // Auto-expand if current page is in the "more" section
    return moreNav.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  })

  function isActive(item: { href: string; matchStart?: boolean }) {
    if (item.href === '/') return pathname === '/'
    if (item.href === '/classes') return pathname.startsWith('/classes') || pathname.startsWith('/workspace')
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed md:static top-0 left-0 h-full z-50 w-[220px] border-r border-border bg-surface flex flex-col shrink-0 transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="p-4 pb-2 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 text-text">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Teacher OS</span>
          </Link>
          <button onClick={onClose} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-border-light">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-1 overflow-y-auto">
          {/* Core features */}
          {coreNav.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-[8px] rounded-lg text-[13px] font-medium mb-px',
                  active ? 'bg-primary-light text-primary-hover' : 'text-text-secondary hover:bg-border-light hover:text-text'
                )}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#0F766E' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                {item.label}
              </Link>
            )
          })}

          {/* Divider + More Tools */}
          <div className="mt-3 mb-1">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center justify-between w-full px-2.5 py-[6px] text-[11px] uppercase tracking-wider font-medium text-text-muted hover:text-text-secondary"
            >
              More Tools
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '150ms' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {moreOpen && moreNav.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium mb-px',
                  active ? 'bg-primary-light text-primary-hover' : 'text-text-muted hover:bg-border-light hover:text-text'
                )}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#0F766E' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={async () => { const s = createClient(); await s.auth.signOut(); onClose(); window.location.href = '/login' }}
            className="w-full flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] text-text-muted hover:bg-border-light hover:text-text transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
