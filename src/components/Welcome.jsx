import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/historycamp-logo.png'
import InstallBanner from './InstallBanner'

export default function Welcome() {
  const { role, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <img src={logo} alt="History Camp" className="mx-auto h-14 w-auto" />
        <p className="mt-2 text-lg">Boston 2026</p>
        <p className="mt-6 text-base text-ink/80">Your guide to a great day of history.</p>

        <div className="mt-6">
          <InstallBanner />
        </div>

        <button
          type="button"
          onClick={() => navigate('/home')}
          disabled={loading}
          className="mt-10 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment disabled:opacity-60"
        >
          View Schedule
        </button>

        <p className="mt-4 text-sm text-ink/60">
          No sign-in needed to browse. You'll only need your registered email if you want to save
          sessions or leave feedback.
        </p>
      </div>
    </div>
  )
}
