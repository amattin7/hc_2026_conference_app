import { useAuth } from '../context/AuthContext'

export default function AdminHome() {
  const { signOut, user } = useAuth()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-primary">History Camp Admin</h1>
      <p className="text-base text-ink/70">
        Signed in as {user?.email}. Attendee management, session CRUD, and the dashboard land in
        a later phase.
      </p>
      <button
        type="button"
        onClick={signOut}
        className="rounded-md border border-border px-4 py-3 text-base font-medium"
      >
        Sign out
      </button>
    </div>
  )
}
