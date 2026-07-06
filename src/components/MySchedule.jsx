import { Link } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import { useFavorites } from '../context/FavoritesContext'
import { formatTime } from '../lib/format'
import StatusBadge from './StatusBadge'
import LoadingScreen from './LoadingScreen'

export default function MySchedule() {
  const { sessions, loading: scheduleLoading } = useSchedule()
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites()

  if (scheduleLoading || favoritesLoading) return <LoadingScreen />

  const favoritedIds = new Set(favorites.map((f) => f.session_id))
  const mySessions = sessions
    .filter((s) => favoritedIds.has(s.id))
    .slice()
    .sort((a, b) => {
      const aStart = a.time_block?.start_time ?? ''
      const bStart = b.time_block?.start_time ?? ''
      return aStart.localeCompare(bStart)
    })

  // Conflict detection: more than one favorite sharing the same time block.
  const countByBlock = {}
  for (const s of mySessions) {
    if (!s.time_block_id) continue
    countByBlock[s.time_block_id] = (countByBlock[s.time_block_id] ?? 0) + 1
  }

  if (mySessions.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-semibold">My Schedule</h1>
        <p className="mt-3 text-base text-ink/70">
          You haven't saved any sessions yet. Browse the{' '}
          <Link to="/schedule" className="text-primary underline">
            full schedule
          </Link>{' '}
          and tap "I'm interested" on anything that catches your eye.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      <h1 className="text-2xl font-semibold">My Schedule</h1>

      {mySessions.map((session) => {
        const hasConflict = (countByBlock[session.time_block_id] ?? 0) > 1

        return (
          <div key={session.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-ink/60">
              {session.time_block?.label}
              {session.time_block && (
                <>
                  {' · '}
                  {formatTime(session.time_block.start_time)} –{' '}
                  {formatTime(session.time_block.end_time)}
                </>
              )}
            </p>

            <div className="mt-1 flex items-start justify-between gap-2">
              <Link
                to={`/schedule/${session.id}`}
                className={`text-base font-medium ${
                  session.status === 'canceled' ? 'line-through text-ink/50' : ''
                }`}
              >
                {session.title}
              </Link>
              <StatusBadge status={session.status} />
            </div>

            <p className="mt-1 text-sm text-ink/70">{session.room?.name ?? 'Room TBD'}</p>

            {session.status === 'canceled' && (
              <p className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary-dark">
                This session was canceled. You may want to choose another for this time slot.
              </p>
            )}

            {hasConflict && (
              <p className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary-dark">
                You already have another session at this time — you can only attend one.
              </p>
            )}

            <button
              type="button"
              onClick={() => removeFavorite(session.id)}
              className="mt-3 text-sm font-medium text-ink/60 underline"
            >
              Remove from My Schedule
            </button>
          </div>
        )
      })}
    </div>
  )
}
