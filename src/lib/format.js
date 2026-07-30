export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function greetingForNow(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// <input type="datetime-local"> works in the browser's local time, and the
// conference runs in a single timezone, so no explicit TZ conversion needed
// beyond what Date already does.
export function toDatetimeLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDatetimeLocalInput(value) {
  if (!value) return null
  return new Date(value).toISOString()
}

// Sessions are fetched in their own sort_order, which is only meaningful
// within a single time block — anywhere sessions get grouped by something
// other than time (room, presenter, tag, feedback picker), they need
// re-sorting chronologically first.
export function sortSessionsChronologically(sessions) {
  return sessions.slice().sort((a, b) => {
    const aBlock = a.time_block?.sort_order ?? 0
    const bBlock = b.time_block?.sort_order ?? 0
    return aBlock - bBlock || (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })
}
