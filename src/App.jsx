import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import AdminHome from './components/AdminHome'

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
                <AdminHome />
              </ProtectedRoute>
            }
          />

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
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
