import { Link } from 'react-router-dom'
import logo from '../assets/historycamp-logo.png'

// Post-event landing page. Every attendee-facing route falls through to this
// once the conference wraps — the app itself (schedule, my-schedule,
// feedback) is no longer routed to. /admin/* is untouched so organizers can
// still log in for reports/exports.
export default function ThankYou() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <img src={logo} alt="History Camp" className="mx-auto h-14 w-auto" />
        <p className="mt-2 text-lg text-ink">Boston 2026</p>

        <h1 className="mt-8 text-2xl font-semibold text-ink">
          Thank you for a successful History Camp 2026!
        </h1>
        <p className="mt-4 text-base text-ink/80">
          We look forward to seeing you next year!
        </p>

        <a
          href="https://thepursuitofhistory.org"
          className="mt-10 inline-block w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment"
        >
          Visit The Pursuit of History
        </a>

        <Link
          to="/schedule"
          className="mt-4 inline-block w-full rounded-md border border-primary px-4 py-3 text-base font-medium text-primary"
        >
          View the History Camp 2026 Schedule
        </Link>
      </div>
    </div>
  )
}
