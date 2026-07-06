import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSchedule } from '../context/ScheduleContext'
import { useFavorites } from '../context/FavoritesContext'
import { formatTime, greetingForNow } from '../lib/format'
import AlertBanner from './AlertBanner'
import LoadingScreen from './LoadingScreen'

function findUpNext(timeBlocks, now) {
  const current = timeBlocks.find(
    (b) => new Date(b.start_time) <= now && now <= new Date(b.end_time),
  )
  if (current) return { block: current, label: 'Happening now' }

  const upcoming = timeBlocks
    .filter((b) => new Date(b.start_time) > now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0]
  if (upcoming) return { block: upcoming, label: 'Up next' }

  return null
}

export default function Home() {
  const { attendee } = useAuth()
  const { timeBlocks, sessions, loading } = useSchedule()
  const { favorites } = useFavorites()

  if (loading) return <LoadingScreen />

  const upNext = findUpNext(timeBlocks, new Date())
  const favoritedSessionIds = new Set(favorites.map((f) => f.session_id))
  const alertSessions = sessions.filter(
    (s) => favoritedSessionIds.has(s.id) && s.status !== 'active',
  )

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-semibold">
          {greetingForNow()}, {attendee?.first_name ?? 'friend'}
        </h1>
        <p className="mt-1 text-base text-ink/70">Your guide to a great day of history.</p>
      </div>

      <AlertBanner sessions={alertSessions} />

      <div className="px-4">
        {upNext ? (
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              {upNext.label}
            </p>
            <p className="mt-1 text-lg font-medium">{upNext.block.label}</p>
            <p className="mt-1 text-base text-ink/70">
              {formatTime(upNext.block.start_time)} – {formatTime(upNext.block.end_time)}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-lg font-medium">That's a wrap for today's sessions.</p>
            <p className="mt-1 text-base text-ink/70">Thanks for spending the day with us.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        <Link
          to="/my-schedule"
          className="rounded-lg border border-border bg-surface p-4 text-center text-base font-medium"
        >
          My Schedule
        </Link>
        <Link
          to="/schedule"
          className="rounded-lg border border-border bg-surface p-4 text-center text-base font-medium"
        >
          Full Schedule
        </Link>
      </div>
    </div>
  )
}
