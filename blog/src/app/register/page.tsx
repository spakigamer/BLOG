'use client'

import { Suspense, useState } from 'react'
import { signup } from '../login/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

function RegisterForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const isSuccess = searchParams.get('success') === 'true'
  const [isPending, setIsPending] = useState(false)

  return (
    <div className="animate-in" style={{ maxWidth: '440px', margin: '4rem auto' }}>
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.03em' }}>
          Create an account
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Join our premium blogging community.
        </p>

        {isSuccess ? (
          <div className="alert alert-warning" style={{ flexDirection: 'column', textAlign: 'center', gap: '1rem', padding: '2rem 1.5rem' }}>
            <CheckCircle2 size={48} color="var(--warning-text)" />
            <div>
              <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verification Required</strong>
              We've sent a confirmation link to your email address. Please click it to verify your account and sign in.
            </div>
            <Link href="/login" className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {message && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{message}</span>
              </div>
            )}
            <form action={async (formData) => {
              setIsPending(true)
              await signup(formData)
              setIsPending(false)
            }} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input className="form-input" id="name" name="name" type="text" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input className="form-input" id="email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input className="form-input" id="password" name="password" type="password" required placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="role">Evaluation Role Selection</label>
                <select className="form-input" id="role" name="role" required defaultValue="Viewer">
                  <option value="Viewer">Viewer (Read Only & Comments)</option>
                  <option value="Author">Author (Create & Edit Own Posts)</option>
                  <option value="Admin">Admin (Full Access & Delete Anything)</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={isPending}>
                {isPending && <Loader2 size={18} className="animate-spin" />}
                {isPending ? 'Creating Account...' : 'Continue'}
              </button>
            </form>
            
            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Already registered? <Link href="/login" style={{ fontWeight: '500' }}>Sign in to your account</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
