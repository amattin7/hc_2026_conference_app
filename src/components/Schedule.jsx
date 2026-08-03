import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { formatTime, sortSessionsChronologically } from '../lib/format'
import StatusBadge from './StatusBadge'
import LoadingScreen from './LoadingScreen'

const GROUP_MODES = [
  { key: 'time', label: 'Time' },
  { key: 'room', label: 'Room' },
  { key: 'presenter', label: 'Presenter' },
  { key: 'tag', label: 'Tag' },
]

function matchesSearch(session, query) {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    session.title.toLowerCase().includes(q) ||
    session.presenter_name.toLowerCase().includes(q) ||
    (session.session_description ?? '').toLowerCase().includes(q)
  )
}

function buildSections(mode, sessionsByBlock, sessions) {
  if (mode === 'time') {
    return sessionsByBlock.map((block) => ({
      key: block.id,
      label: block.label,
      sublabel: `${formatTime(block.start_time)} – ${formatTime(block.end_time)}`,
      sessions: block.sessions,
    }))
  }

  if (mode === 'room') {
    const byRoom = new Map()
    for (const session of sessions) {
      const name = session.room?.name ?? 'Room TBD'
      if (!byRoom.has(name)) byRoom.set(name, [])
      byRoom.get(name).push(session)
    }
    return Array.from(byRoom.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, list]) => ({ key: name, label: name, sessions: sortSessionsChronologically(list) }))
  }

  if (mode === 'presenter') {
    const byPresenter = new Map()
    for (const session of sessions) {
      const names = [
        session.presenter_name,
        ...(Array.isArray(session.co_presenters) ? session.co_presenters.map((c) => c.name) : []),
      ].filter(Boolean)
      for (const name of names) {
        if (!byPresenter.has(name)) byPresenter.set(name, [])
        byPresenter.get(name).push(session)
      }
    }
    return Array.from(byPresenter.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, list]) => ({ key: name, label: name, sessions: sortSessionsChronologically(list) }))
  }

  // tag
  const byTag = new Map()
  for (const session of sessions) {
    for (const tag of session.tags ?? []) {
      if (!byTag.has(tag)) byTag.set(tag, [])
      byTag.get(tag).push(session)
    }
  }
  return Array.from(byTag.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, list]) => ({ key: tag, label: tag, sessions: sortSessionsChronologically(list) }))
}

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { attendee, previewAttendee } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const favorited = isFavorite(session.id)

  function handleAddToSchedule() {
    // Browsing anonymously (no attendee claimed yet): send them to claim
    // their email first, then bring them right back to this list — same
    // pattern as the "I'm interested" button on the session detail page.
    if (!attendee && !previewAttendee) {
      navigate(`/claim-email?next=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    toggleFavorite(session.id)
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <Link to={`/schedule/${session.id}`} className="block">
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
        <p className="mt-1 text-sm text-ink/70">
          {session.time_block?.label ?? 'Time TBD'} · {session.room?.name ?? 'Room TBD'}
        </p>
      </Link>

      {session.session_description && (
        <p className={`mt-2 text-sm text-ink/60 ${expanded ? '' : 'line-clamp-2'}`}>
          {session.session_description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-4">
        {session.session_description && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-primary underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
        <button
          type="button"
          onClick={handleAddToSchedule}
          className="text-sm font-medium text-primary underline"
        >
          {favorited ? 'Added to My Schedule ✓' : 'Add to my Schedule'}
        </button>
      </div>
    </div>
  )
}

export default function Schedule() {
  const { sessionsByBlock, sessions, loading } = useSchedule()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState({})

  const mode = GROUP_MODES.some((m) => m.key === searchParams.get('by'))
    ? searchParams.get('by')
    : 'time'
  const jumpTo = searchParams.get('value')

  const sections = useMemo(
    () => buildSections(mode, sessionsByBlock, sessions),
    [mode, sessionsByBlock, sessions],
  )

  if (loading) return <LoadingScreen />

  function setMode(nextMode) {
    setCollapsed({})
    setSearchParams(nextMode === 'time' ? {} : { by: nextMode })
  }

  function isSectionCollapsed(key) {
    if (key in collapsed) return collapsed[key]
    if (jumpTo === key) return false
    return true
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      <h1 className="text-2xl font-semibold">Full Schedule</h1>

      <div className="flex gap-2 overflow-x-auto">
        {GROUP_MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              mode === m.key ? 'bg-primary text-parchment' : 'bg-surface text-ink/70'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, presenter, or description"
        className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base"
      />

      {sections.map((section) => {
        const filtered = section.sessions.filter((s) => matchesSearch(s, query))
        if (query && filtered.length === 0) return null
        const collapsedNow = isSectionCollapsed(section.key)

        return (
          <section key={section.key} className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) => ({ ...prev, [section.key]: !collapsedNow }))
              }
              className="flex items-center justify-between rounded-md bg-surface px-3 py-3 text-left"
            >
              <span>
                <span className="text-lg font-medium">{section.label}</span>
                {section.sublabel && (
                  <span className="ml-2 text-sm text-ink/60">{section.sublabel}</span>
                )}
                <span className="ml-2 text-sm text-ink/50">({filtered.length})</span>
              </span>
              <span className="text-ink/50">{collapsedNow ? '+' : '–'}</span>
            </button>

            {!collapsedNow && (
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
