import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function FeedbackForm({ sessionId }) {
  const { attendee } = useAuth()
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
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
    if (rating < 1) {
      setError('Please choose a star rating.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { data, error: submitError } = await supabase
      .from('session_feedback')
      .insert({
        session_id: sessionId,
        attendee_id: attendee.id,
        rating,
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
  }

  if (loading) {
    return <p className="text-sm text-ink/60">Loading feedback…</p>
  }

  if (existing) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-base font-medium">Thank you for your feedback!</p>
        <p className="mt-2 text-sm text-ink/70">Your rating: {'★'.repeat(existing.rating)}</p>
        {existing.comment && <p className="mt-1 text-sm text-ink/70">"{existing.comment}"</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-4">
      <p className="text-base font-medium">How was this session?</p>

      <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => setRating(n)}
            className={`flex h-11 w-11 items-center justify-center rounded-md border text-xl ${
              rating >= n
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-ink/40'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <label htmlFor="feedback-comment" className="mt-4 block text-sm font-medium">
        Comments (optional)
      </label>
      <textarea
        id="feedback-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-base"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-primary-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit feedback'}
      </button>
    </form>
  )
}
