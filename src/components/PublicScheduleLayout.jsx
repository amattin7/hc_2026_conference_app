import { Link, Outlet } from 'react-router-dom'
import { ScheduleProvider } from '../context/ScheduleContext'
import logo from '../assets/historycamp-logo.png'

// Read-only post-event browsing area — no auth gate (the global anonymous
// session from AuthProvider's bootstrap already satisfies the "authenticated"
// RLS check that sessions/rooms/time_blocks require), no favorites, no
// feedback. Just lets people look back at how the day's schedule appeared.
export default function PublicScheduleLayout() {
  return (
    <ScheduleProvider>
      <div className="flex min-h-screen flex-col bg-parchment">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <img src={logo} alt="History Camp" className="h-7 w-auto" />
          <Link to="/" className="ml-auto text-sm font-medium text-primary underline">
            Back
          </Link>
        </header>
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </ScheduleProvider>
  )
}
