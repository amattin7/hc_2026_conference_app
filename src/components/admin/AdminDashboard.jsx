import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([])
  const [attendeeSessions, setAttendeeSessions] = useState([])
  const [attendees, setAttendees] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [interestSortDesc, setInterestSortDesc] = useState(true)
  const [interestExpanded, setInterestExpanded] = useState(false)
  const [checkInExpanded, setCheckInExpanded] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [sessionsRes, favRes, attendeesRes, notifRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('*, time_block:time_blocks(id, label, sort_order), room:rooms(id, name)')
        .order('sort_order'),
      supabase.from('attendee_sessions').select('session_id'),
      supabase.from('attendees').select('id, checked_in'),
      supabase.from('notifications_log').select('*').order('sent_at', { ascending: false }),
    ])

    const error = sessionsRes.error ?? favRes.error ?? attendeesRes.error ?? notifRes.error

    if (error) {
      setLoadError(error)
    } else {
      setLoadError(null)
      setSessions(sessionsRes.data ?? [])
      setAttendeeSessions(favRes.data ?? [])
      setAttendees(attendeesRes.data ?? [])
      setNotifications(notifRes.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions])

  const totalAttendees = attendees.length
  const checkedInCount = attendees.filter((a) => a.checked_in).length
  const notCheckedInCount = totalAttendees - checkedInCount
  const checkedInPct = totalAttendees ? Math.round((checkedInCount / totalAttendees) * 100) : 0

  const interestRows = useMemo(() => {
    const counts = new Map()
    attendeeSessions.forEach((r) => counts.set(r.session_id, (counts.get(r.session_id) ?? 0) + 1))
    return sessions
      .map((s) => ({ session: s, count: counts.get(s.id) ?? 0 }))
      .sort((a, b) => (interestSortDesc ? b.count - a.count : a.count - b.count))
  }, [sessions, attendeeSessions, interestSortDesc])

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
        <button
          type="button"
          onClick={() => setCheckInExpanded((v) => !v)}
          className="flex items-center justify-between rounded-md bg-surface px-3 py-3 text-left"
        >
          <h2 className="text-xl font-semibold">Check-In</h2>
          <span className="text-ink/50">{checkInExpanded ? '–' : '+'}</span>
        </button>

        {checkInExpanded && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-semibold">{totalAttendees}</p>
              <p className="text-sm text-ink/60">Total attendees</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-semibold">{checkedInCount}</p>
              <p className="text-sm text-ink/60">Checked in</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-semibold">{notCheckedInCount}</p>
              <p className="text-sm text-ink/60">Not checked in</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-semibold">{checkedInPct}%</p>
              <p className="text-sm text-ink/60">Checked in</p>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setInterestExpanded((v) => !v)}
          className="flex items-center justify-between rounded-md bg-surface px-3 py-3 text-left"
        >
          <h2 className="text-xl font-semibold">Session Interest</h2>
          <span className="text-ink/50">{interestExpanded ? '–' : '+'}</span>
        </button>

        {interestExpanded && (
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
        )}
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
