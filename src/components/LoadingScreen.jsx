export default function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-lg text-ink/70">{label}</p>
    </div>
  )
}
