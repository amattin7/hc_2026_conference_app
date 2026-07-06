import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { session, role, loading, authError, signInWithEmail, clearAuthError } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent

  if (!loading && session) {
    return <Navigate to={role === 'admin' ? '/admin' : '/home'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    const result = await signInWithEmail(email.trim())
    setStatus(result.ok ? 'sent' : 'idle')
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-semibold text-primary">History Camp</h1>
        <p className="mt-1 text-lg">Boston 2026</p>
        <p className="mt-6 text-base text-ink/80">Your guide to a great day of history.</p>

        {status === 'sent' ? (
          <div className="mt-10 rounded-lg border border-border bg-surface p-6">
            <p className="text-lg font-medium">Check your email</p>
            <p className="mt-2 text-base text-ink/80">
              We've sent a sign-in link to <span className="font-medium">{email}</span>. Tap it
              on this device to step right in.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-md border border-border px-4 py-3 text-base"
              onClick={() => {
                setStatus('idle')
                clearAuthError()
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 text-left">
            <label htmlFor="email" className="block text-base font-medium">
              Email address
            </label>
            <p className="mt-1 text-sm text-ink/70">
              Use the email you registered with on RegFox.
            </p>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-3 w-full rounded-md border border-border bg-surface px-4 py-3 text-base"
              placeholder="you@example.com"
            />

            {authError && (
              <p role="alert" className="mt-3 text-base text-primary-dark">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-6 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending your link…' : 'Send my sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
