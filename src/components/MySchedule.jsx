import { Link } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { formatTime } from '../lib/format'
import StatusBadge from './StatusBadge'
import LoadingScreen from './LoadingScreen'

export default function MySchedule() {
  const { sessions, timeBlocks, loading: scheduleLoading } = useSchedule()
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites()
  const { attendee } = useAuth()

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

  // Lunch runs between Session 3 and Session 4 for everyone, regardless of
  // what they've favorited — derived from the real time blocks rather than
  // hardcoded so it stays correct if the schedule ever shifts.
  const beforeLunch = timeBlocks.find((b) => b.sort_order === 3)
  const afterLunch = timeBlocks.find((b) => b.sort_order === 4)
  const lunchBlock =
    beforeLunch && afterLunch
      ? { start_time: beforeLunch.end_time, end_time: afterLunch.start_time }
      : null

  const items = [
    ...mySessions.map((session) => ({ type: 'session', session, sortKey: session.time_block?.start_time ?? '' })),
    ...(lunchBlock ? [{ type: 'lunch', lunchBlock, sortKey: lunchBlock.start_time }] : []),
  ].sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      <h1 className="text-2xl font-semibold">My Schedule</h1>

      {mySessions.length === 0 && (
        <p className="text-base text-ink/70">
          You haven't saved any sessions yet. Browse the{' '}
          <Link to="/schedule" className="text-primary underline">
            full schedule
          </Link>{' '}
          and tap "I'm interested" on anything that catches your eye.
        </p>
      )}

      {items.map((item) => {
        if (item.type === 'lunch') {
          return (
            <div key="lunch" className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-ink/60">
                Lunch · {formatTime(item.lunchBlock.start_time)} – {formatTime(item.lunchBlock.end_time)}
              </p>
              <p className="mt-1 text-base font-medium">
                {attendee?.lunch
                  ? 'Please join us for your History Camp lunch!'
                  : 'Break period, enjoy lunch on your own!'}
              </p>
            </div>
          )
        }

        const session = item.session
        const hasConflict = (countByBlock[session.time_block_id] ?? 0) > 1

        return (
          <div key={session.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-ink/60">{session.time_block?.label}</p>

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

            <div className="mt-3 flex items-center gap-4">
              <Link
                to={`/feedback/sessions/${session.id}`}
                className="text-sm font-medium text-primary underline"
              >
                Give feedback
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite(session.id)}
                className="text-sm font-medium text-ink/60 underline"
              >
                Remove from My Schedule
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
