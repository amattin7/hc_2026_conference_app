import { Link, useSearchParams } from 'react-router-dom'

export default function FeedbackThanks() {
  const [searchParams] = useSearchParams()
  const isSession = searchParams.get('origin') === 'session'

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-16 pb-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-parchment">
        ✓
      </div>
      <h1 className="text-2xl font-semibold">Thank you!</h1>
      <p className="max-w-xs text-base text-ink/70">
        {isSession
          ? 'Your session feedback has been recorded.'
          : "Your feedback helps shape next year's History Camp."}
      </p>

      <div className="mt-4 flex w-full max-w-sm flex-col gap-3">
        {isSession && (
          <Link
            to="/feedback/sessions"
            className="rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment"
          >
            Rate another session
          </Link>
        )}
        <Link
          to="/feedback"
          className="rounded-md border border-border px-4 py-3 text-base font-medium"
        >
          Done
        </Link>
      </div>
    </div>
  )
}
