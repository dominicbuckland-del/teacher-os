'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 300ms ease, border-color 300ms ease',
        background: scrolled ? '#fefefc' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(10,10,10,0.08)' : '1px solid transparent',
        fontFamily: 'GTAmerica, sans-serif',
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          fontFamily: 'DomaineText, serif',
          fontSize: 18,
          fontWeight: 300,
          color: scrolled ? '#0a0a0a' : '#fefefc',
          textDecoration: 'none',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}>
          Teacher OS
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="mktg-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {['Features', 'How it works', 'Pricing'].map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, '-')}`}
                style={{
                  fontSize: 12,
                  fontWeight: 300,
                  color: scrolled ? 'rgba(10,10,10,0.6)' : 'rgba(254,254,252,0.6)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  transition: 'color 150ms ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLAnchorElement).style.color = scrolled ? '#0a0a0a' : '#fefefc'
                }}
                onMouseLeave={e => {
                  (e.target as HTMLAnchorElement).style.color = scrolled ? 'rgba(10,10,10,0.6)' : 'rgba(254,254,252,0.6)'
                }}
              >
                {label}
              </a>
            ))}
          </div>

          <Link href="/signup" style={{
            fontSize: 12,
            fontWeight: 500,
            color: scrolled ? '#fefefc' : '#0a0a0a',
            background: scrolled ? '#0a0a0a' : '#fefefc',
            padding: '8px 18px',
            borderRadius: 2,
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'opacity 150ms ease',
            whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  )
}
