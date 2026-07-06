export default function StatusBadge({ status }) {
  if (status === 'canceled') {
    return (
      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary-dark">
        Canceled
      </span>
    )
  }
  if (status === 'modified') {
    return (
      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary-dark">
        Updated
      </span>
    )
  }
  return null
}
