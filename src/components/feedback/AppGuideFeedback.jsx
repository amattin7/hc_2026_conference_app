import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function AppGuideFeedback() {
  const { attendee } = useAuth()
  const navigate = useNavigate()
  const [helpful, setHelpful] = useState(null)
  const [suggestions, setSuggestions] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!attendee) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-base text-ink/70">Feedback isn't available in attendee preview mode.</p>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (helpful === null) {
      setError('Please choose an answer.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { error: submitError } = await supabase.from('app_guide_feedback').insert({
      attendee_id: attendee.id,
      helpful,
      suggestions: suggestions.trim() || null,
    })

    setSubmitting(false)

    if (submitError) {
      setError("We couldn't save your feedback. Please try again.")
      return
    }
    navigate('/feedback/thanks?origin=app-guide')
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold">About the Online Guide</h1>
        <p className="mt-1 text-base text-ink/70">
          Quick feedback on this app itself — the schedule, saving sessions, all of it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="text-base font-semibold">Was the online guide helpful?</p>
          <div className="mt-3 flex gap-3">
            {[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setHelpful(option.value)}
                className={`flex-1 rounded-md border px-4 py-3 text-base font-medium ${
                  helpful === option.value
                    ? 'border-primary bg-primary text-parchment'
                    : 'border-border text-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="guide-suggestions" className="block text-base font-semibold">
            Any suggestions for us about the online guide?
          </label>
          <p className="text-sm text-ink/60">Optional — anything you'd want us to know.</p>
          <textarea
            id="guide-suggestions"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            rows={6}
            placeholder="Your suggestions"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-base"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-primary-dark">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
