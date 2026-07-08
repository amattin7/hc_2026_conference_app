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
