import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// Mounted only once RequireAttendee has an attendee resolved (single match,
// or picked via AttendeeSelect) — bounces straight back to wherever the
// claim was triggered from (e.g. the session detail page someone tapped
// "I'm interested" on), falling back to My Schedule if there's nowhere to
// return to.
export default function ClaimEmailRedirect() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(searchParams.get('next') || '/my-schedule', { replace: true })
  }, [navigate, searchParams])

  return null
}
