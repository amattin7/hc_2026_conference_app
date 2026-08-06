import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin/attendees', label: 'Attendees' },
  { to: '/admin/schedule', label: 'Schedule' },
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/feedback', label: 'Feedback' },
]

function tabClass({ isActive }) {
  return `px-4 py-3 text-sm font-medium border-b-2 ${
    isActive ? 'border-primary text-primary' : 'border-transparent text-ink/60'
  }`
}

export default function AdminLayout() {
  const { signOut, user, togglePreviewAttendee } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <span className="text-lg font-semibold text-primary">History Camp Admin</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink/60 sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={togglePreviewAttendee}
            className="rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary"
          >
            Preview as attendee
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex border-b border-border bg-surface">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={tabClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex flex-1 flex-col px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
