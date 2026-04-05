'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // If user is immediately confirmed (autoconfirm enabled), redirect
    if (data.session) {
      router.push('/')
      router.refresh()
      return
    }

    // If email confirmation required, show a message
    if (data.user && !data.session) {
      // Try signing in immediately — some Supabase configs auto-confirm
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInData?.session) {
        router.push('/')
        router.refresh()
        return
      }

      // If sign-in also fails, show confirmation message
      setSuccess(true)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  if (success) {
    return (
      <div className="min-h-full flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">Check your email</h1>
          <p className="text-text-secondary text-[14px] mb-6">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
          <Link href="/login" className="text-primary font-medium text-[14px]">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-text-secondary text-[14px] mt-1">Start using Teacher OS in seconds</p>
        </div>

        <form onSubmit={handleSignup} className="card p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Sarah Thompson"
              required
              autoFocus
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@school.edu.au"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[13px] text-text-muted mt-4">
          Already have an account? <Link href="/login" className="text-primary font-medium hover:text-primary-hover">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
