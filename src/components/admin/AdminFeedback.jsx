import { useCallback, useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../../lib/supabase'

function average(nums) {
  if (nums.length === 0) return null
  return nums.reduce((sum, n) => sum + n, 0) / nums.length
}

export default function AdminFeedback() {
  const [timeBlocks, setTimeBlocks] = useState([])
  const [sessions, setSessions] = useState([])
  const [feedback, setFeedback] = useState([])
  const [overallFeedback, setOverallFeedback] = useState([])
  const [attendeesCount, setAttendeesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [feedbackTimeBlockFilter, setFeedbackTimeBlockFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [tbRes, sessionsRes, feedbackRes, overallFeedbackRes, attendeesRes] = await Promise.all([
      supabase.from('time_blocks').select('*').order('sort_order'),
      supabase
        .from('sessions')
        .select('*, time_block:time_blocks(id, label, sort_order), room:rooms(id, name)')
        .order('sort_order'),
      supabase.from('session_feedback').select('*'),
      supabase.from('conference_feedback').select('*'),
      supabase.from('attendees').select('id', { count: 'exact', head: true }),
    ])

    const error =
      tbRes.error ?? sessionsRes.error ?? feedbackRes.error ?? overallFeedbackRes.error ?? attendeesRes.error

    if (error) {
      setLoadError(error)
    } else {
      setLoadError(null)
      setTimeBlocks(tbRes.data ?? [])
      setSessions(sessionsRes.data ?? [])
      setFeedback(feedbackRes.data ?? [])
      setOverallFeedback(overallFeedbackRes.data ?? [])
      setAttendeesCount(attendeesRes.count ?? 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions])

  const feedbackBySession = useMemo(() => {
    const map = new Map()
    feedback.forEach((f) => {
      const bucket = map.get(f.session_id) ?? { app: 0, paper: 0, ratings: [] }
      if (f.source === 'app') bucket.app += 1
      else bucket.paper += 1
      bucket.ratings.push(f.rating)
      map.set(f.session_id, bucket)
    })
    return map
  }, [feedback])

  const feedbackRows = useMemo(() => {
    return sessions
      .filter((s) => !feedbackTimeBlockFilter || s.time_block_id === feedbackTimeBlockFilter)
      .map((s) => {
        const bucket = feedbackBySession.get(s.id)
        return {
          session: s,
          app: bucket?.app ?? 0,
          paper: bucket?.paper ?? 0,
          avgRating: bucket ? average(bucket.ratings) : null,
        }
      })
      .filter((r) => r.app + r.paper > 0)
  }, [sessions, feedbackBySession, feedbackTimeBlockFilter])

  const totalSubmissions = feedback.length
  const overallAvg = average(feedback.map((f) => f.rating))
  const earlyFlaggedCount = feedback.filter((f) => f.flagged_early).length
  const attendeesWithFeedback = useMemo(
    () => new Set(feedback.filter((f) => f.attendee_id).map((f) => f.attendee_id)).size,
    [feedback],
  )
  const feedbackParticipationPct = attendeesCount
    ? Math.round((attendeesWithFeedback / attendeesCount) * 100)
    : 0

  const overallSubmissions = overallFeedback.length
  const overallAvgRating = average(overallFeedback.map((f) => f.overall_rating))
  const overallAvgRecommend = average(overallFeedback.map((f) => f.recommend))

  function exportOverallFeedbackCsv() {
    const rows = overallFeedback.map((f) => ({
      overall_rating: f.overall_rating,
      recommend: f.recommend,
      travel_from: f.travel_from ?? '',
      reason: f.reason ?? '',
      describe_to_friend: f.describe_to_friend ?? '',
      sunday_tours: f.sunday_tours ?? '',
      poh_weekend: f.poh_weekend ?? '',
      how_heard: (f.how_heard ?? []).join('; '),
      destination: f.destination ?? '',
      change: f.change ?? '',
      historian: f.historian ?? '',
      other_comments: f.other_comments ?? '',
      submitted_at: f.submitted_at,
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'history-camp-overall-feedback.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportFeedbackCsv() {
    const timeBlockById = new Map(timeBlocks.map((b) => [b.id, b]))
    const rows = feedback.map((f) => {
      const session = sessionById.get(f.session_id)
      const timeBlock = session ? timeBlockById.get(session.time_block_id) : null
      return {
        session_title: session?.title ?? '',
        time_block: timeBlock?.label ?? '',
        rating: f.rating,
        comment: f.comment ?? '',
        source: f.source,
        submitted_at: f.submitted_at,
        flagged_early: f.flagged_early,
      }
    })
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'history-camp-feedback.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <p className="text-base text-ink/60">Loading feedback…</p>

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold">Feedback</h1>
      </section>

      {loadError && (
        <p className="text-sm text-primary-dark">Couldn't load feedback data: {loadError.message}</p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Session Feedback</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold">{totalSubmissions}</p>
            <p className="text-sm text-ink/60">Total submissions</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold">{overallAvg != null ? overallAvg.toFixed(1) : '—'}</p>
            <p className="text-sm text-ink/60">Overall average</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold">{earlyFlaggedCount}</p>
            <p className="text-sm text-ink/60">Early-flagged</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold">{feedbackParticipationPct}%</p>
            <p className="text-sm text-ink/60">Attendees w/ feedback</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <select
            value={feedbackTimeBlockFilter}
            onChange={(e) => setFeedbackTimeBlockFilter(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">All time blocks</option>
            {timeBlocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportFeedbackCsv}
            disabled={feedback.length === 0}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink/60">
              <tr>
                <th className="px-3 py-2">Session</th>
                <th className="px-3 py-2">App</th>
                <th className="px-3 py-2">Paper</th>
                <th className="px-3 py-2">Avg rating</th>
              </tr>
            </thead>
            <tbody>
              {feedbackRows.map(({ session, app, paper, avgRating }) => (
                <tr key={session.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2">{session.title}</td>
                  <td className="px-3 py-2">{app}</td>
                  <td className="px-3 py-2">{paper}</td>
                  <td className="px-3 py-2">{avgRating != null ? avgRating.toFixed(1) : '—'}</td>
                </tr>
              ))}
              {feedbackRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-ink/50">
                    No feedback yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Overall Feedback</h2>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold">{overallSubmissions}</p>
            <p className="text-sm text-ink/60">Total submissions</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold">
              {overallAvgRating != null ? overallAvgRating.toFixed(1) : '—'}
            </p>
            <p className="text-sm text-ink/60">Avg. rating (of 10)</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold">
              {overallAvgRecommend != null ? overallAvgRecommend.toFixed(1) : '—'}
            </p>
            <p className="text-sm text-ink/60">Avg. would recommend (of 10)</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={exportOverallFeedbackCsv}
            disabled={overallFeedback.length === 0}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </section>
    </div>
  )
}
