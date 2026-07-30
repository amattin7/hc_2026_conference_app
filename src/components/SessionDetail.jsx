import { useParams, Link } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import { useFavorites } from '../context/FavoritesContext'
import { formatTime } from '../lib/format'
import StatusBadge from './StatusBadge'
import SessionFeedbackForm from './feedback/SessionFeedbackForm'
import LoadingScreen from './LoadingScreen'

function PresenterBlock({ name, credentials, bio, website, email }) {
  return (
    <div>
      <p className="text-base font-medium">
        <Link to={`/schedule?by=presenter&value=${encodeURIComponent(name)}`} className="underline">
          {name}
        </Link>
        {credentials ? `, ${credentials}` : ''}
      </p>
      {bio && <p className="mt-2 text-base text-ink/80">{bio}</p>}
      {(website || email) && (
        <p className="mt-2 text-sm text-ink/60">
          {website && (
            <a href={website} target="_blank" rel="noreferrer" className="underline">
              {website}
            </a>
          )}
          {website && email && ' · '}
          {email && (
            <a href={`mailto:${email}`} className="underline">
              {email}
            </a>
          )}
        </p>
      )}
    </div>
  )
}

export default function SessionDetail() {
  const { sessionId } = useParams()
  const { getSession, loading } = useSchedule()
  const { isFavorite, toggleFavorite } = useFavorites()

  if (loading) return <LoadingScreen />

  const session = getSession(sessionId)

  if (!session) {
    return (
      <div className="px-4 py-6">
        <p className="text-base">We couldn't find that session.</p>
        <Link to="/schedule" className="mt-2 inline-block text-primary underline">
          Back to schedule
        </Link>
      </div>
    )
  }

  const favorited = isFavorite(session.id)
  const coPresenters = Array.isArray(session.co_presenters) ? session.co_presenters : []

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-6">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold">{session.title}</h1>
          <StatusBadge status={session.status} />
        </div>
        {session.status !== 'active' && session.status_note && (
          <p className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary-dark">
            {session.status_note}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
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
        {session.room?.name && (
          <Link
            to={`/schedule?by=room&value=${encodeURIComponent(session.room.name)}`}
            className="mt-1 inline-block text-base font-medium underline"
          >
            {session.room.name}
          </Link>
        )}
        {session.room?.notes && <p className="mt-1 text-sm text-ink/60">{session.room.notes}</p>}
      </div>

      {session.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {session.tags.map((tag) => (
            <Link
              key={tag}
              to={`/schedule?by=tag&value=${encodeURIComponent(tag)}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary-dark"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => toggleFavorite(session.id)}
        className={`w-full rounded-md px-4 py-3 text-base font-medium ${
          favorited
            ? 'border border-primary text-primary'
            : 'bg-primary text-parchment'
        }`}
      >
        {favorited ? "I'm interested ✓" : "I'm interested"}
      </button>

      {session.session_description && (
        <div>
          <h2 className="text-lg font-medium">About this session</h2>
          <p className="mt-2 text-base text-ink/80">{session.session_description}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium">Presenter</h2>
        <div className="mt-2">
          <PresenterBlock
            name={session.presenter_name}
            credentials={session.presenter_credentials}
            bio={session.presenter_bio}
            website={session.presenter_website}
            email={session.presenter_email}
          />
        </div>
      </div>

      {coPresenters.map((cp, idx) => (
        <div key={idx}>
          <h2 className="text-lg font-medium">Co-presenter</h2>
          <div className="mt-2">
            <PresenterBlock name={cp.name} credentials={cp.credentials} bio={cp.bio} />
          </div>
        </div>
      ))}

      <div>
        <h2 className="text-lg font-medium">Feedback</h2>
        <div className="mt-2">
          <SessionFeedbackForm sessionId={session.id} />
        </div>
      </div>
    </div>
  )
}
