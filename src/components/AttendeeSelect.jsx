import { useAuth } from '../context/AuthContext'

// Shown when a login resolves to more than one attendees row — e.g. a
// couple who registered with the same email. The choice is remembered per
// device (see AuthContext's localStorage key), not written to the server,
// so each person just picks their name once on their own phone.
export default function AttendeeSelect() {
  const { attendees, selectAttendee, signOut } = useAuth()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-primary">Which of you is this?</h1>
        <p className="mt-2 text-base text-ink/70">
          This email is registered for more than one person. Pick your name to continue — you can
          switch anytime from this same device.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {attendees.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => selectAttendee(a.id)}
              className="rounded-md border border-border bg-surface px-4 py-3 text-left text-base font-medium"
            >
              {a.first_name} {a.last_name}
            </button>
          ))}
        </div>

        <button type="button" onClick={signOut} className="mt-8 text-sm text-ink/60 underline">
          Not you? Sign out
        </button>
      </div>
    </div>
  )
}
