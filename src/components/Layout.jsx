import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/schedule', label: 'Full Schedule' },
  { to: '/my-schedule', label: 'My Schedule' },
]

function navLinkClass({ isActive }) {
  return `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-sm font-medium ${
    isActive ? 'text-primary' : 'text-ink/60'
  }`
}

export default function Layout() {
  const { signOut, previewAttendee, togglePreviewAttendee } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      {previewAttendee && (
        <div className="flex items-center justify-between bg-primary px-4 py-2 text-sm text-parchment">
          <span>Previewing as attendee</span>
          <button type="button" onClick={togglePreviewAttendee} className="font-medium underline">
            Back to admin
          </button>
        </div>
      )}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <span className="text-lg font-semibold text-primary">History Camp</span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-md px-3 py-2 text-sm font-medium text-ink/70"
        >
          Sign out
        </button>
      </header>

      <main className="flex flex-1 flex-col pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-border bg-surface">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
