import { useParams, Link } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import StatusBadge from './StatusBadge'
import LoadingScreen from './LoadingScreen'

// Read-only counterpart to SessionDetail.jsx — no "Add to my Schedule"
// button, no Feedback section, no auth/claim-email redirect logic. See
// PublicSchedule.jsx for why this is a separate file instead of a shared one.
function PresenterBlock({ name, credentials, bio, website }) {
  return (
    <div>
      <p className="text-base font-medium">
        <Link to={`/schedule?by=presenter&value=${encodeURIComponent(name)}`} className="underline">
          {name}
        </Link>
        {credentials ? `, ${credentials}` : ''}
      </p>
      {bio && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium text-primary">
            Presenter bio
          </summary>
          <p className="mt-2 text-base text-ink/80">{bio}</p>
        </details>
      )}
      {website && (
        <p className="mt-2 text-sm text-ink/60">
          <a href={website} target="_blank" rel="noreferrer" className="underline">
            {website}
          </a>
        </p>
      )}
    </div>
  )
}

export default function PublicSessionDetail() {
  const { sessionId } = useParams()
  const { getSession, loading } = useSchedule()

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

  const coPresenters = Array.isArray(session.co_presenters) ? session.co_presenters : []

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-6">
      <Link
        to="/schedule"
        className="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-primary"
      >
        <span aria-hidden="true">‹</span> Back to Schedule
      </Link>

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
        <p className="text-sm text-ink/60">{session.time_block?.label}</p>
        {session.room?.name && (
          <div className="mt-1 flex items-baseline gap-2">
            <Link
              to={`/schedule?by=room&value=${encodeURIComponent(session.room.name)}`}
              className="inline-block text-base font-medium underline"
            >
              {session.room.name}
            </Link>
            {session.room?.floor && <span className="text-sm text-ink/60">{session.room.floor}</span>}
          </div>
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

      {session.session_description && (
        <details className="rounded-lg border border-border bg-surface p-4">
          <summary className="cursor-pointer text-lg font-medium">Full Description</summary>
          <p className="mt-2 text-base text-ink/80">{session.session_description}</p>
        </details>
      )}

      <div>
        <h2 className="text-lg font-medium">Presenter</h2>
        <div className="mt-2">
          <PresenterBlock
            name={session.presenter_name}
            credentials={session.presenter_credentials}
            bio={session.presenter_bio}
            website={session.presenter_website}
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
    </div>
  )
}
