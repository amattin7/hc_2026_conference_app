import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'
import AttendeeSelect from './AttendeeSelect'

export default function ProtectedRoute({ children, requireRole }) {
  const { session, effectiveRole, loading, needsAttendeeSelection } = useAuth()

  if (loading) return <LoadingScreen />

  if (!session) return <Navigate to="/" replace />

  if (requireRole && effectiveRole !== requireRole) {
    return <Navigate to={effectiveRole === 'admin' ? '/admin' : '/home'} replace />
  }

  if (requireRole === 'attendee' && needsAttendeeSelection) {
    return <AttendeeSelect />
  }

  return children
}
