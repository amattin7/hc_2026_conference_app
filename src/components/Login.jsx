import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RESEND_COOLDOWN_SECONDS = 45

export default function Login() {
  const { session, role, loading, authError, signInWithEmail, verifyCode, clearAuthError } =
    useAuth()
  const [step, setStep] = useState('email') // email | code
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  if (!loading && session) {
    return <Navigate to={role === 'admin' ? '/admin' : '/home'} replace />
  }

  async function requestCode(e) {
    e?.preventDefault()
    if (!email.trim()) return
    setSending(true)
    const result = await signInWithEmail(email.trim())
    setSending(false)
    if (result.ok) {
      setStep('code')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (code.trim().length !== 6) return
    setVerifying(true)
    await verifyCode(email.trim(), code.trim())
    setVerifying(false)
  }

  function backToEmail() {
    setStep('email')
    setCode('')
    setCooldown(0)
    clearAuthError()
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-semibold text-primary">History Camp</h1>
        <p className="mt-1 text-lg">Boston 2026</p>
        <p className="mt-6 text-base text-ink/80">Your guide to a great day of history.</p>

        {step === 'email' ? (
          <form onSubmit={requestCode} className="mt-10 text-left">
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
              disabled={sending}
              className="mt-6 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:opacity-60"
            >
              {sending ? 'Sending your code…' : 'Send my sign-in code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-10 text-left">
            <p className="text-base font-medium">Check your email</p>
            <p className="mt-1 text-sm text-ink/70">
              We've sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it
              below.
            </p>
            <p className="mt-1 text-sm text-ink/70">
              No rush — this code stays valid for a full hour.
            </p>

            <label htmlFor="code" className="mt-6 block text-base font-medium">
              Sign-in code
            </label>
            <input
              id="code"
              type="text"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-3 w-full rounded-md border border-border bg-surface px-4 py-3 text-center text-2xl tracking-[0.5em]"
              placeholder="000000"
            />

            {authError && (
              <p role="alert" className="mt-3 text-base text-primary-dark">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="mt-6 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:opacity-60"
            >
              {verifying ? 'Checking…' : 'Sign in'}
            </button>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button type="button" onClick={backToEmail} className="text-ink/60 underline">
                Use a different email
              </button>
              <button
                type="button"
                onClick={() => requestCode()}
                disabled={cooldown > 0 || sending}
                className="text-primary underline disabled:text-ink/40 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
