import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'
import AttendeeSelect from './AttendeeSelect'

export default function ProtectedRoute({ children, requireRole }) {
  const { session, role, effectiveRole, loading, needsAttendeeSelection } = useAuth()

  if (loading) return <LoadingScreen />

  // Admin routes gate on the real role, never the preview-adjusted one —
  // toggling "Preview as attendee" must not be able to bounce an actual
  // admin out of /admin, since effectiveRole flips to 'attendee' the whole
  // time preview is on.
  if (requireRole === 'admin') {
    if (role !== 'admin') return <Navigate to="/admin/login" replace />
    return children
  }

  if (requireRole === 'attendee') {
    if (!session) return <Navigate to="/" replace />
    if (effectiveRole !== 'attendee') return <Navigate to="/admin" replace />
    if (needsAttendeeSelection) return <AttendeeSelect />
  }

  return children
}
