import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const STEPS = [
  {
    key: 'overallRating',
    kind: 'scale10',
    required: true,
    question: 'How would you rate History Camp Boston 2026?',
    low: 'Disappointing',
    high: 'Excellent',
  },
  {
    key: 'recommend',
    kind: 'scale10',
    required: true,
    question: 'Would you recommend History Camp to someone who enjoys history?',
    low: 'Definitely not',
    high: 'Definitely would',
  },
  {
    key: 'travelFrom',
    kind: 'text',
    question: 'Where did you travel from to come to History Camp today?',
    placeholder: 'City, state',
  },
  {
    key: 'reason',
    kind: 'textarea',
    question: 'What was the primary reason you came today, and did you achieve what you wanted?',
  },
  {
    key: 'describeToFriend',
    kind: 'textarea',
    question:
      'How would you describe History Camp to a friend or colleague who is also interested in history?',
  },
  {
    key: 'sundayTours',
    kind: 'textarea',
    question: 'Did you sign up for any of the Sunday tours? Why or why not?',
  },
  {
    key: 'pohWeekend',
    kind: 'single',
    question: 'Have you attended a Pursuit of History Weekend?',
    options: ['Yes!', 'Plan to in the future', 'Not interested'],
  },
  {
    key: 'howHeard',
    kind: 'multi',
    question: 'How did you hear about History Camp?',
    options: ['Friend or colleague', 'Social media', 'Email', 'Website', 'Returning attendee', 'Other'],
  },
  {
    key: 'destination',
    kind: 'text',
    question: 'What destination would you like to see offered for a Pursuit of History Weekend?',
  },
  {
    key: 'change',
    kind: 'textarea',
    question: 'What is one thing you would change about History Camp?',
  },
  {
    key: 'historian',
    kind: 'text',
    question: 'If you could attend an event with any contemporary historian, who would it be?',
  },
  {
    key: 'otherComments',
    kind: 'textarea',
    question:
      'Use this space to provide any other comments or feedback you have about History Camp 2026 for organizers, vendors, and/or presenters.',
  },
]

function buildRow({ attendee, answers }) {
  return {
    attendee_id: attendee.id,
    overall_rating: answers.overallRating,
    recommend: answers.recommend,
    travel_from: answers.travelFrom?.trim() || null,
    reason: answers.reason?.trim() || null,
    describe_to_friend: answers.describeToFriend?.trim() || null,
    sunday_tours: answers.sundayTours?.trim() || null,
    poh_weekend: answers.pohWeekend || null,
    how_heard: answers.howHeard || [],
    destination: answers.destination?.trim() || null,
    change: answers.change?.trim() || null,
    historian: answers.historian?.trim() || null,
    other_comments: answers.otherComments?.trim() || null,
  }
}

export default function OverallFeedbackWizard() {
  const { attendee } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const current = STEPS[step]
  const answer = answers[current.key]
  const isLastStep = step === STEPS.length - 1
  const canAdvance = current.required ? answer !== undefined && answer !== null : true

  function setAnswer(value) {
    setAnswers((prev) => ({ ...prev, [current.key]: value }))
  }

  function toggleMulti(option) {
    const list = answers[current.key] || []
    setAnswer(list.includes(option) ? list.filter((o) => o !== option) : [...list, option])
  }

  async function handleNext() {
    if (!canAdvance) return
    if (!isLastStep) {
      setStep((s) => s + 1)
      return
    }

    setSubmitting(true)
    setError(null)
    const { error: submitError } = await supabase
      .from('conference_feedback')
      .insert(buildRow({ attendee, answers }))
    setSubmitting(false)

    if (submitError) {
      setError("We couldn't save your feedback. Please try again.")
      return
    }
    navigate('/feedback/thanks?origin=overall')
  }

  function handleBack() {
    if (step === 0) {
      navigate('/feedback')
      return
    }
    setStep((s) => s - 1)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      <div>
        <p className="text-sm text-ink/60">
          Question {step + 1} of {STEPS.length}
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(((step + 1) / STEPS.length) * 100)}%` }}
          />
        </div>
      </div>

      {current.required && (
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Required</p>
      )}
      <h2 className="text-xl font-semibold leading-snug">{current.question}</h2>

      {current.kind === 'scale10' && (
        <div>
          <div className="flex justify-between gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAnswer(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                  answer === n ? 'border-primary bg-primary text-parchment' : 'border-border text-ink'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink/60">
            <span>{current.low}</span>
            <span>{current.high}</span>
          </div>
        </div>
      )}

      {current.kind === 'text' && (
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={current.placeholder || 'Your answer'}
          className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base"
        />
      )}

      {current.kind === 'textarea' && (
        <textarea
          value={answer || ''}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          rows={5}
          className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base"
        />
      )}

      {current.kind === 'single' && (
        <div className="flex flex-col gap-2.5">
          {current.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAnswer(option)}
              className={`rounded-md px-4 py-3 text-left text-base font-medium ${
                answer === option
                  ? 'border border-primary bg-primary text-parchment'
                  : 'border border-border bg-surface text-ink'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {current.kind === 'multi' && (
        <div className="flex flex-col gap-2.5">
          {current.options.map((option) => {
            const selected = Array.isArray(answer) && answer.includes(option)
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleMulti(option)}
                className={`flex items-center gap-2.5 rounded-md px-4 py-3 text-left text-base font-medium ${
                  selected
                    ? 'border border-primary bg-primary text-parchment'
                    : 'border border-border bg-surface text-ink'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                    selected ? 'border-parchment' : 'border-primary text-primary'
                  }`}
                >
                  {selected ? '✓' : ''}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-primary-dark">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-md border border-border bg-surface px-5 py-3 text-base font-medium"
        >
          Back
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance || submitting}
          className="rounded-md bg-primary px-7 py-3 text-base font-medium text-parchment disabled:bg-border disabled:text-ink/40"
        >
          {submitting ? 'Submitting…' : isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
}
