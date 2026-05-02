'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Profile {
  subscription_status: string
  subscription_period_end: string | null
  comments_generated: number
  stripe_customer_id: string | null
}

const TRIAL_LIMIT = 10

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$15',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || '',
    features: [
      'Unlimited report comments',
      'All AI tools — rubrics, emails, relief notes',
      'Australian Curriculum v9 aligned',
      'Export to Accelerus + CSV',
      'Priority support',
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$99',
    period: '/year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL || '',
    badge: 'Save 45%',
    features: [
      'Everything in Monthly',
      'Best value — $8.25/month',
      'Locked-in price guarantee',
    ],
  },
]

function BillingContent() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_period_end, comments_generated, stripe_customer_id')
        .eq('id', user.id)
        .single()

      setProfile(data as Profile | null)
      setLoading(false)
    }
    fetchProfile()
  }, [success])

  async function startCheckout(priceId: string, planId: string) {
    if (!priceId) {
      setError('Stripe not yet configured. Check back soon.')
      return
    }
    setCheckoutLoading(planId)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout')
      }
    } catch {
      setError('Failed to connect. Try again.')
    }
    setCheckoutLoading(null)
  }

  async function openPortal() {
    setPortalLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to open billing portal')
      }
    } catch {
      setError('Failed to connect. Try again.')
    }
    setPortalLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = profile?.subscription_status === 'active'
  const commentsUsed = profile?.comments_generated ?? 0
  const remaining = Math.max(0, TRIAL_LIMIT - commentsUsed)
  const exhausted = !isActive && commentsUsed >= TRIAL_LIMIT

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Billing</h1>
      <p className="text-text-secondary text-[14px] mb-8">Manage your Teacher OS subscription.</p>

      {/* Success / canceled banners */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-[14px] text-emerald-700">
          You're now subscribed. Unlimited access is now active — enjoy!
        </div>
      )}
      {canceled && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-[14px] text-amber-700">
          Checkout canceled. Your free trial is still active.
        </div>
      )}

      {/* Current plan status */}
      <div className="card p-5 mb-8">
        <h2 className="font-semibold text-[15px] mb-4">Current Plan</h2>

        {isActive ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-[14px]">Pro — Active</span>
            </div>
            {profile?.subscription_period_end && (
              <p className="text-[13px] text-text-secondary mb-4">
                Renews {new Date(profile.subscription_period_end).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="btn btn-secondary btn-sm"
            >
              {portalLoading ? 'Opening...' : 'Manage Subscription'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('w-2 h-2 rounded-full', exhausted ? 'bg-red-400' : 'bg-amber-400')} />
              <span className="font-medium text-[14px]">Free Trial</span>
            </div>
            {exhausted ? (
              <p className="text-[13px] text-red-600 mb-1">
                Trial complete — you've used all {TRIAL_LIMIT} free AI generations.
              </p>
            ) : (
              <p className="text-[13px] text-text-secondary mb-1">
                {commentsUsed} of {TRIAL_LIMIT} free AI generations used — {remaining} remaining.
              </p>
            )}
            <div className="mt-3 h-2 bg-border-light rounded-full overflow-hidden w-full max-w-xs">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (commentsUsed / TRIAL_LIMIT) * 100)}%`,
                  background: exhausted ? '#EF4444' : '#F59E0B',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upgrade plans — only show if not active */}
      {!isActive && (
        <>
          <h2 className="font-semibold text-[15px] mb-4">Upgrade to Pro</h2>
          {error && <p className="text-[13px] text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={cn(
                  'card p-5 relative',
                  plan.id === 'annual' && 'border-primary/40 bg-primary-light/10'
                )}
              >
                {plan.badge && (
                  <span className="absolute top-4 right-4 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary text-white">
                    {plan.badge}
                  </span>
                )}
                <p className="font-semibold text-[15px] mb-1">{plan.name}</p>
                <p className="text-[28px] font-semibold tracking-tight">
                  {plan.price}
                  <span className="text-[14px] font-normal text-text-muted">{plan.period}</span>
                </p>
                <ul className="mt-4 space-y-2 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-text-secondary">
                      <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => startCheckout(plan.priceId, plan.id)}
                  disabled={!!checkoutLoading}
                  className={cn(
                    'btn w-full',
                    plan.id === 'annual' ? 'btn-primary' : 'btn-secondary'
                  )}
                >
                  {checkoutLoading === plan.id ? 'Redirecting...' : `Get ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-text-muted text-center">
            Secure payment via Stripe. Cancel anytime. Prices in AUD.
          </p>
        </>
      )}
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
