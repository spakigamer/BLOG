'use client'

import { Suspense, useState } from 'react'
import { login } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Mail, Loader2 } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const isUnconfirmed = message?.toLowerCase().includes('email not confirmed')
  const [isPending, setIsPending] = useState(false)

  return (
    <div className="animate-in" style={{ maxWidth: '440px', margin: '4rem auto' }}>
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.03em' }}>
          Welcome back
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Enter your credentials to access your dashboard.
        </p>

        {isUnconfirmed ? (
          <div className="alert alert-warning" style={{ flexDirection: 'column', textAlign: 'center', gap: '1rem', padding: '1.5rem' }}>
            <Mail size={32} color="var(--warning-text)" style={{ margin: '0 auto' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Please verify your email</strong>
              <p style={{ fontSize: '0.85rem' }}>We sent a confirmation link to your inbox. You must click it before you can sign in.</p>
            </div>
          </div>
        ) : message ? (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{message}</span>
          </div>
        ) : null}

        <form action={async (formData) => {
          setIsPending(true)
          await login(formData)
          setIsPending(false)
        }} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input className="form-input" id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-input" id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={isPending}>
            {isPending && <Loader2 size={18} className="animate-spin" />}
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/register" style={{ fontWeight: '500' }}>Create one now</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading login...</div>}>
      <LoginForm />
    </Suspense>
  )
}
