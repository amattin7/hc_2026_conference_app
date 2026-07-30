import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ScheduleProvider } from './context/ScheduleContext'
import { FavoritesProvider } from './context/FavoritesContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './components/Login'
import Home from './components/Home'
import Schedule from './components/Schedule'
import SessionDetail from './components/SessionDetail'
import MySchedule from './components/MySchedule'
import FeedbackLauncher from './components/feedback/FeedbackLauncher'
import OverallFeedbackWizard from './components/feedback/OverallFeedbackWizard'
import SessionPicker from './components/feedback/SessionPicker'
import SessionFeedbackPage from './components/feedback/SessionFeedbackPage'
import FeedbackThanks from './components/feedback/FeedbackThanks'
import AdminLayout from './components/admin/AdminLayout'
import AdminAttendees from './components/admin/AdminAttendees'
import AdminSchedule from './components/admin/AdminSchedule'
import AdminDashboard from './components/admin/AdminDashboard'

function AttendeeArea() {
  return (
    <ScheduleProvider>
      <FavoritesProvider>
        <Layout />
      </FavoritesProvider>
    </ScheduleProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

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
          </Route>

          <Route
            element={
              <ProtectedRoute requireRole="attendee">
                <AttendeeArea />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/:sessionId" element={<SessionDetail />} />
            <Route path="/my-schedule" element={<MySchedule />} />
            <Route path="/feedback" element={<FeedbackLauncher />} />
            <Route path="/feedback/overall" element={<OverallFeedbackWizard />} />
            <Route path="/feedback/sessions" element={<SessionPicker />} />
            <Route path="/feedback/sessions/:sessionId" element={<SessionFeedbackPage />} />
            <Route path="/feedback/thanks" element={<FeedbackThanks />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
