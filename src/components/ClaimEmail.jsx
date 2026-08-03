import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Shown in place of My Schedule / Feedback until an attendee has been
// claimed on this device — via RequireAttendee, either as a route guard
// (My Schedule, Feedback) or standalone at /claim-email with a ?next= to
// return to afterward (e.g. tapping "I'm interested" while browsing
// anonymously from a session's detail page — see ClaimEmailRedirect). No
// code, no link — just a lookup against the registration list (see
// claim_attendee_by_email in AuthContext).
export default function ClaimEmail() {
  const { authError, claimAttendeeByEmail, clearAuthError } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    clearAuthError()
    await claimAttendeeByEmail(email.trim())
    setSubmitting(false)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-primary">What's your email?</h1>
        <p className="mt-2 text-base text-ink/70">
          Enter the email you registered with on RegFox to save sessions and leave feedback.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 text-left">
          <label htmlFor="claim-email" className="block text-base font-medium">
            Email address
          </label>
          <input
            id="claim-email"
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
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:opacity-60"
          >
            {submitting ? 'Looking up your registration…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
