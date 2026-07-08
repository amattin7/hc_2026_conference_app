import { useCallback, useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../../lib/supabase'

function average(nums) {
  if (nums.length === 0) return null
  return nums.reduce((sum, n) => sum + n, 0) / nums.length
}

export default function AdminDashboard() {
  const [timeBlocks, setTimeBlocks] = useState([])
  const [sessions, setSessions] = useState([])
  const [attendeeSessions, setAttendeeSessions] = useState([])
  const [feedback, setFeedback] = useState([])
  const [attendeesCount, setAttendeesCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [interestSortDesc, setInterestSortDesc] = useState(true)
  const [feedbackTimeBlockFilter, setFeedbackTimeBlockFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [tbRes, sessionsRes, favRes, feedbackRes, attendeesRes, notifRes] = await Promise.all([
      supabase.from('time_blocks').select('*').order('sort_order'),
      supabase
        .from('sessions')
        .select('*, time_block:time_blocks(id, label, sort_order), room:rooms(id, name)')
        .order('sort_order'),
      supabase.from('attendee_sessions').select('session_id'),
      supabase.from('session_feedback').select('*'),
      supabase.from('attendees').select('id', { count: 'exact', head: true }),
      supabase.from('notifications_log').select('*').order('sent_at', { ascending: false }),
    ])

    const error =
      tbRes.error ?? sessionsRes.error ?? favRes.error ?? feedbackRes.error ?? attendeesRes.error ?? notifRes.error

    if (error) {
      setLoadError(error)
    } else {
      setLoadError(null)
      setTimeBlocks(tbRes.data ?? [])
      setSessions(sessionsRes.data ?? [])
      setAttendeeSessions(favRes.data ?? [])
      setFeedback(feedbackRes.data ?? [])
      setAttendeesCount(attendeesRes.count ?? 0)
      setNotifications(notifRes.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions])

  const interestRows = useMemo(() => {
    const counts = new Map()
    attendeeSessions.forEach((r) => counts.set(r.session_id, (counts.get(r.session_id) ?? 0) + 1))
    return sessions
      .map((s) => ({ session: s, count: counts.get(s.id) ?? 0 }))
      .sort((a, b) => (interestSortDesc ? b.count - a.count : a.count - b.count))
  }, [sessions, attendeeSessions, interestSortDesc])

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

  if (loading) return <p className="text-base text-ink/60">Loading dashboard…</p>

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </section>

      {loadError && (
        <p className="text-sm text-primary-dark">Couldn't load dashboard data: {loadError.message}</p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Session Interest</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink/60">
              <tr>
                <th className="px-3 py-2">Session</th>
                <th className="px-3 py-2">Time block</th>
                <th className="px-3 py-2">Room</th>
                <th className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setInterestSortDesc((v) => !v)}
                    className="font-medium underline"
                  >
                    # Interested {interestSortDesc ? '↓' : '↑'}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {interestRows.map(({ session, count }) => (
                <tr key={session.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2">{session.title}</td>
                  <td className="px-3 py-2">{session.time_block?.label ?? '—'}</td>
                  <td className="px-3 py-2">{session.room?.name ?? '—'}</td>
                  <td className="px-3 py-2">{count}</td>
                </tr>
              ))}
              {interestRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-ink/50">
                    No sessions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Feedback</h2>

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
        <h2 className="text-xl font-semibold">Notification Log</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink/60">
              <tr>
                <th className="px-3 py-2">Session</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Recipients</th>
                <th className="px-3 py-2">Sent at</th>
                <th className="px-3 py-2">Sent by</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2">{sessionById.get(n.session_id)?.title ?? '—'}</td>
                  <td className="px-3 py-2">
                    {n.trigger_event === 'session_canceled' ? 'Canceled' : 'Modified'}
                  </td>
                  <td className="px-3 py-2">{n.recipients_count}</td>
                  <td className="px-3 py-2">{new Date(n.sent_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{n.sent_by_email ?? '—'}</td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-ink/50">
                    No notifications sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
