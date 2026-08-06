import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ScheduleProvider } from './context/ScheduleContext'
import { FavoritesProvider } from './context/FavoritesContext'
import ProtectedRoute from './components/ProtectedRoute'
import RequireAttendee from './components/RequireAttendee'
import ClaimEmailRedirect from './components/ClaimEmailRedirect'
import Layout from './components/Layout'
import Welcome from './components/Welcome'
import Home from './components/Home'
import Schedule from './components/Schedule'
import SessionDetail from './components/SessionDetail'
import MySchedule from './components/MySchedule'
import FeedbackLauncher from './components/feedback/FeedbackLauncher'
import OverallFeedbackWizard from './components/feedback/OverallFeedbackWizard'
import AppGuideFeedback from './components/feedback/AppGuideFeedback'
import SessionPicker from './components/feedback/SessionPicker'
import SessionFeedbackPage from './components/feedback/SessionFeedbackPage'
import FeedbackThanks from './components/feedback/FeedbackThanks'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminAttendees from './components/admin/AdminAttendees'
import AdminSchedule from './components/admin/AdminSchedule'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminFeedback from './components/admin/AdminFeedback'

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
          <Route path="/" element={<Welcome />} />
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
            <Route
              path="/claim-email"
              element={
                <RequireAttendee>
                  <ClaimEmailRedirect />
                </RequireAttendee>
              }
            />
            <Route
              path="/my-schedule"
              element={
                <RequireAttendee>
                  <MySchedule />
                </RequireAttendee>
              }
            />
            <Route
              path="/feedback"
              element={
                <RequireAttendee>
                  <FeedbackLauncher />
                </RequireAttendee>
              }
            />
            <Route
              path="/feedback/overall"
              element={
                <RequireAttendee>
                  <OverallFeedbackWizard />
                </RequireAttendee>
              }
            />
            <Route
              path="/feedback/app-guide"
              element={
                <RequireAttendee>
                  <AppGuideFeedback />
                </RequireAttendee>
              }
            />
            <Route
              path="/feedback/sessions"
              element={
                <RequireAttendee>
                  <SessionPicker />
                </RequireAttendee>
              }
            />
            <Route
              path="/feedback/sessions/:sessionId"
              element={
                <RequireAttendee>
                  <SessionFeedbackPage />
                </RequireAttendee>
              }
            />
            <Route
              path="/feedback/thanks"
              element={
                <RequireAttendee>
                  <FeedbackThanks />
                </RequireAttendee>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
