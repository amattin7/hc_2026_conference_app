import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'
import AttendeeSelect from './AttendeeSelect'

export default function ProtectedRoute({ children, requireRole }) {
  const { session, role, loading, needsAttendeeSelection } = useAuth()

  if (loading) return <LoadingScreen />

  if (!session) return <Navigate to="/" replace />

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/home'} replace />
  }

  if (requireRole === 'attendee' && needsAttendeeSelection) {
    return <AttendeeSelect />
  }

  return children
}
