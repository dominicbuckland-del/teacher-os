'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: DashboardIcon },
  { href: '/emails', label: 'Email Templates', icon: EmailIcon },
  { href: '/planner', label: 'Calendar & Planner', icon: CalendarIcon },
  { href: '/resources', label: 'Resources', icon: ResourceIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] h-full border-r border-border bg-surface flex flex-col shrink-0">
      <div className="p-5 pb-3">
        <Link href="/" className="flex items-center gap-2 text-text hover:no-underline">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Teacher OS</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium mb-0.5',
                active
                  ? 'bg-primary-light text-primary-hover'
                  : 'text-text-secondary hover:bg-border-light hover:text-text'
              )}
            >
              <item.icon active={active} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-[11px] text-text-muted">Teacher OS</p>
        <p className="text-[11px] text-text-muted mt-0.5">v1.1</p>
      </div>
    </aside>
  )
}

function DashboardIcon({ active }: { active: boolean }) {
  const c = active ? '#0F766E' : '#64748B'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function EmailIcon({ active }: { active: boolean }) {
  const c = active ? '#0F766E' : '#64748B'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  const c = active ? '#0F766E' : '#64748B'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ResourceIcon({ active }: { active: boolean }) {
  const c = active ? '#0F766E' : '#64748B'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? '#0F766E' : '#64748B'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}
