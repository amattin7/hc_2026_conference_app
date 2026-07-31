import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchedule } from '../../context/ScheduleContext'
import LoadingScreen from '../LoadingScreen'

function matchesSearch(session, blockLabel, query) {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    blockLabel.toLowerCase().includes(q) ||
    session.title.toLowerCase().includes(q) ||
    session.presenter_name.toLowerCase().includes(q) ||
    (session.session_description ?? '').toLowerCase().includes(q)
  )
}

export default function SessionPicker() {
  const { sessionsByBlock, loading } = useSchedule()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState({})

  if (loading) return <LoadingScreen />

  const groups = sessionsByBlock
    .map((block) => ({
      id: block.id,
      label: block.label,
      sessions: block.sessions.filter((s) => matchesSearch(s, block.label, query)),
    }))
    .filter((g) => g.sessions.length > 0)

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by session, title, or speaker"
        className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base"
      />

      {groups.map((group) => {
        const isExpanded = !!query || !!expanded[group.id]
        return (
          <div key={group.id}>
            <button
              type="button"
              onClick={() => setExpanded((prev) => ({ ...prev, [group.id]: !isExpanded }))}
              className="flex items-center gap-2 py-1"
            >
              <span className="w-3 text-xs text-primary">{isExpanded ? '▾' : '▸'}</span>
              <span className="text-xs font-bold uppercase tracking-wide text-primary">
                {group.label}
              </span>
              <span className="text-xs text-ink/50">({group.sessions.length})</span>
            </button>

            {isExpanded && (
              <div className="mt-3 flex flex-col gap-2.5">
                {group.sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => navigate(`/feedback/sessions/${session.id}`)}
                    className="rounded-xl border border-border bg-surface p-4 text-left"
                  >
                    <p className="text-base font-semibold">{session.title}</p>
                    <p className="text-sm text-ink/60">{session.presenter_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
