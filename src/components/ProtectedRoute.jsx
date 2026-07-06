import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, requireRole }) {
  const { session, role, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!session) return <Navigate to="/" replace />

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/home'} replace />
  }

  return children
}
