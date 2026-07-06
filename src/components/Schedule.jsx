import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import { formatTime } from '../lib/format'
import StatusBadge from './StatusBadge'
import LoadingScreen from './LoadingScreen'

function matchesSearch(session, query) {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    session.title.toLowerCase().includes(q) ||
    session.presenter_name.toLowerCase().includes(q)
  )
}

function SessionCard({ session }) {
  return (
    <Link
      to={`/schedule/${session.id}`}
      className="block rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-base font-medium ${
            session.status === 'canceled' ? 'line-through text-ink/50' : ''
          }`}
        >
          {session.title}
        </p>
        <StatusBadge status={session.status} />
      </div>
      <p className="mt-1 text-sm text-ink/70">{session.presenter_name}</p>
      <p className="mt-1 text-sm text-ink/70">{session.room?.name ?? 'Room TBD'}</p>
      {session.session_description && (
        <p className="mt-2 line-clamp-2 text-sm text-ink/60">{session.session_description}</p>
      )}
    </Link>
  )
}

export default function Schedule() {
  const { sessionsByBlock, loading } = useSchedule()
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState({})

  if (loading) return <LoadingScreen />

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      <h1 className="text-2xl font-semibold">Full Schedule</h1>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title or presenter"
        className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base"
      />

      {sessionsByBlock.map((block) => {
        const filtered = block.sessions.filter((s) => matchesSearch(s, query))
        if (query && filtered.length === 0) return null
        const isCollapsed = collapsed[block.id] ?? false

        return (
          <section key={block.id} className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) => ({ ...prev, [block.id]: !isCollapsed }))
              }
              className="flex items-center justify-between rounded-md bg-surface px-3 py-3 text-left"
            >
              <span>
                <span className="text-lg font-medium">{block.label}</span>
                <span className="ml-2 text-sm text-ink/60">
                  {formatTime(block.start_time)} – {formatTime(block.end_time)}
                </span>
              </span>
              <span className="text-ink/50">{isCollapsed ? '+' : '–'}</span>
            </button>

            {!isCollapsed && (
              <div className="flex flex-col gap-3">
                {filtered.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
