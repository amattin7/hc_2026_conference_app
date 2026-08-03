import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function SessionFeedbackForm({ sessionId, onSubmitted }) {
  const { attendee, previewAttendee } = useAuth()
  const location = useLocation()
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('session_feedback')
        .select('id, rating, comment')
        .eq('session_id', sessionId)
        .maybeSingle()
      if (active) {
        setExisting(data ?? null)
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [sessionId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!attendee) {
      setError("Feedback isn't available in attendee preview mode.")
      return
    }
    if (score < 1) {
      setError('Please choose a score.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { data, error: submitError } = await supabase
      .from('session_feedback')
      .insert({
        session_id: sessionId,
        attendee_id: attendee.id,
        rating: score,
        comment: comment.trim() || null,
        source: 'app',
      })
      .select('id, rating, comment')
      .single()

    setSubmitting(false)

    if (submitError) {
      setError("We couldn't save your feedback. Please try again.")
      return
    }
    setExisting(data)
    onSubmitted?.()
  }

  if (loading) {
    return <p className="text-sm text-ink/60">Loading feedback…</p>
  }

  if (!attendee && !previewAttendee) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-base text-ink/70">
          Enter the email you registered with to leave feedback on this session.
        </p>
        <Link
          to={`/claim-email?next=${encodeURIComponent(location.pathname)}`}
          className="mt-3 inline-block rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment"
        >
          Enter your email
        </Link>
      </div>
    )
  }

  if (existing) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-base font-medium">Thank you for your feedback!</p>
        <p className="mt-2 text-sm text-ink/70">Your score: {existing.rating}/5</p>
        {existing.comment && <p className="mt-1 text-sm text-ink/70">"{existing.comment}"</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Required</p>
      <p className="text-base font-semibold">How much did you enjoy this session?</p>

      <div className="mt-3 flex gap-2.5" role="radiogroup" aria-label="Session score">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={score === n}
            aria-label={`${n} out of 5`}
            onClick={() => setScore(n)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border text-base font-semibold ${
              score >= n
                ? 'border-primary bg-primary text-parchment'
                : 'border-border text-ink'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink/60">
        <span>Did not enjoy</span>
        <span>Very enjoyable</span>
      </div>

      <label htmlFor="feedback-comment" className="mt-5 block text-base font-semibold">
        Comments for the speaker
      </label>
      <p className="text-sm text-ink/60">
        Shared with the presenter so they can improve — be specific!
      </p>
      <textarea
        id="feedback-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={6}
        placeholder="Your comments"
        className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-base"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-primary-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || score < 1}
        className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:bg-border disabled:text-ink/40"
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
