import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useSchedule } from '../../context/ScheduleContext'
import LoadingScreen from '../LoadingScreen'
import SessionFeedbackForm from './SessionFeedbackForm'

export default function SessionFeedbackPage() {
  const { sessionId } = useParams()
  const { getSession, loading } = useSchedule()
  const navigate = useNavigate()

  if (loading) return <LoadingScreen />

  const session = getSession(sessionId)
  if (!session) return <Navigate to="/feedback/sessions" replace />

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          {session.time_block?.label ?? 'Time TBD'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{session.title}</h1>
        <p className="mt-1 text-sm text-ink/60">{session.presenter_name}</p>
      </div>

      <SessionFeedbackForm
        sessionId={session.id}
        onSubmitted={() => navigate('/feedback/thanks?origin=session')}
      />
    </div>
  )
}
