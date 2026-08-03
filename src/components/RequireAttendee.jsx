import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'
import AttendeeSelect from './AttendeeSelect'
import ClaimEmail from './ClaimEmail'

// Gates the personal-schedule and feedback routes on having a claimed
// attendee — Home and the full Schedule stay open to anyone browsing
// anonymously, but these need to know who you are. Admins previewing the
// attendee app never have an attendees row of their own (see AuthContext),
// so the gate is skipped for them, same as before this flow existed.
export default function RequireAttendee({ children }) {
  const { loading, previewAttendee, attendee, needsAttendeeSelection } = useAuth()

  if (loading) return <LoadingScreen />
  if (previewAttendee) return children
  if (needsAttendeeSelection) return <AttendeeSelect />
  if (!attendee) return <ClaimEmail />

  return children
}
