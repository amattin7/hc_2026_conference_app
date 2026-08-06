import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function FeedbackLauncher() {
  const { attendee } = useAuth()
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [guideAlreadySubmitted, setGuideAlreadySubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!attendee) {
        setLoading(false)
        return
      }
      const [overallRes, guideRes] = await Promise.all([
        supabase.from('conference_feedback').select('id').eq('attendee_id', attendee.id).maybeSingle(),
        supabase.from('app_guide_feedback').select('id').eq('attendee_id', attendee.id).maybeSingle(),
      ])
      if (active) {
        setAlreadySubmitted(!!overallRes.data)
        setGuideAlreadySubmitted(!!guideRes.data)
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [attendee])

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold">Share your feedback</h1>
        <p className="mt-1 text-base text-ink/70">Help us make next year's History Camp even better.</p>
      </div>

      {loading ? null : alreadySubmitted ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Overall event</p>
          <p className="mt-2 text-lg font-semibold">Conference Feedback</p>
          <p className="mt-1 text-sm text-ink/60">
            Thanks — you've already submitted your conference feedback.
          </p>
        </div>
      ) : (
        <Link
          to="/feedback/overall"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Overall event</p>
          <p className="mt-2 text-lg font-semibold">Conference Feedback</p>
          <p className="mt-1 text-sm text-ink/60">
            A dozen quick questions about your day at History Camp Boston 2026.
          </p>
        </Link>
      )}

      <Link to="/feedback/sessions" className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Sessions</p>
        <p className="mt-2 text-lg font-semibold">Rate a Session</p>
        <p className="mt-1 text-sm text-ink/60">Score a talk you attended and leave notes for the speaker.</p>
      </Link>

      {loading ? null : guideAlreadySubmitted ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">This app</p>
          <p className="mt-2 text-lg font-semibold">Online Guide Feedback</p>
          <p className="mt-1 text-sm text-ink/60">
            Thanks — you've already shared your thoughts on the online guide.
          </p>
        </div>
      ) : (
        <Link to="/feedback/app-guide" className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">This app</p>
          <p className="mt-2 text-lg font-semibold">Online Guide Feedback</p>
          <p className="mt-1 text-sm text-ink/60">
            Two quick questions about the schedule app you're using right now.
          </p>
        </Link>
      )}
    </div>
  )
}
