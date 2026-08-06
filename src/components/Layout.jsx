import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/historycamp-logo.png'

function HomeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

function ScheduleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  )
}

function MyScheduleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  )
}

function FeedbackIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5Z" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

const navItems = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/schedule', label: 'Full Schedule', Icon: ScheduleIcon },
  { to: '/my-schedule', label: 'My Schedule', Icon: MyScheduleIcon },
  { to: '/feedback', label: 'Feedback', Icon: FeedbackIcon },
]

export default function Layout() {
  const { signOut, previewAttendee, togglePreviewAttendee } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function handleBackToAdmin() {
    togglePreviewAttendee()
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      {previewAttendee && (
        <div className="flex items-center justify-between bg-primary px-4 py-2 text-sm text-parchment">
          <span>Previewing as attendee</span>
          <button type="button" onClick={handleBackToAdmin} className="font-medium underline">
            Back to admin
          </button>
        </div>
      )}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <img src={logo} alt="History Camp" className="h-7 w-auto" />
        {/* Previewing admins exit via "Back to admin" above — a real sign-out
            here would end their actual admin login, not just the preview. */}
        {!previewAttendee && (
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md px-3 py-2 text-sm font-medium text-ink/70"
          >
            Sign out
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col pb-36">
        <Outlet />
      </main>

      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] flex gap-1 rounded-3xl border border-border bg-surface p-2 shadow-lg shadow-ink/10">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className="flex flex-1 justify-center">
            {({ isActive }) => (
              <span
                className={`flex flex-col items-center gap-0.5 whitespace-nowrap rounded-2xl px-3 py-2.5 text-xs ${
                  isActive ? 'bg-primary font-semibold text-parchment' : 'font-medium text-ink/50'
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
