import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'hc_dismissed_alerts'

function readDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

function persistDismissed(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export default function AlertBanner({ sessions }) {
  const [dismissed, setDismissed] = useState(readDismissed)

  useEffect(() => {
    persistDismissed(dismissed)
  }, [dismissed])

  const visible = sessions.filter((s) => !dismissed.has(s.id))

  if (visible.length === 0) return null

  return (
    <div className="flex flex-col gap-2 px-4 pt-4">
      {visible.map((session) => (
        <div
          key={session.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <div>
            <p className="text-base font-medium text-primary-dark">
              {session.status === 'canceled' ? 'Canceled: ' : 'Updated: '}
              <Link to={`/schedule/${session.id}`} className="underline">
                {session.title}
              </Link>
            </p>
            {session.status_note && (
              <p className="mt-1 text-sm text-ink/80">{session.status_note}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed((prev) => new Set(prev).add(session.id))}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-ink/60"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}
