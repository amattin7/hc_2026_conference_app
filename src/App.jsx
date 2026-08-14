import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ThankYou from './components/ThankYou'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminAttendees from './components/admin/AdminAttendees'
import AdminSchedule from './components/admin/AdminSchedule'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminFeedback from './components/admin/AdminFeedback'

// The conference is over. Every attendee-facing route (schedule, my
// schedule, feedback, the old welcome screen) now falls through to the
// ThankYou catch-all below instead of the live app. Admin routes are left
// fully wired up so organizers can still log in for reports/exports. The
// attendee components themselves weren't deleted — just unrouted — so
// next year's event can flip this back on.
export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="attendees" replace />} />
            <Route path="attendees" element={<AdminAttendees />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>

          <Route path="*" element={<ThankYou />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
