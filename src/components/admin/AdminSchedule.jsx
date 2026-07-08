import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import TimeBlocksPanel from './TimeBlocksPanel'
import RoomsPanel from './RoomsPanel'
import SessionsPanel from './SessionsPanel'

const tabs = [
  { key: 'time_blocks', label: 'Time Blocks' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'sessions', label: 'Sessions' },
]

export default function AdminSchedule() {
  const [tab, setTab] = useState('time_blocks')
  const [timeBlocks, setTimeBlocks] = useState([])
  const [rooms, setRooms] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [timeBlocksRes, roomsRes, sessionsRes] = await Promise.all([
      supabase.from('time_blocks').select('*').order('sort_order'),
      supabase.from('rooms').select('*').order('name'),
      supabase.from('sessions').select('*').order('sort_order'),
    ])

    const error = timeBlocksRes.error ?? roomsRes.error ?? sessionsRes.error
    if (error) {
      setLoadError(error)
    } else {
      setLoadError(null)
      setTimeBlocks(timeBlocksRes.data ?? [])
      setRooms(roomsRes.data ?? [])
      setSessions(sessionsRes.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <p className="text-base text-ink/60">Loading schedule…</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'bg-primary text-parchment' : 'border border-border text-ink/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadError && (
        <p className="text-sm text-primary-dark">Couldn't load schedule data: {loadError.message}</p>
      )}

      {tab === 'time_blocks' && <TimeBlocksPanel timeBlocks={timeBlocks} onChange={load} />}
      {tab === 'rooms' && <RoomsPanel rooms={rooms} onChange={load} />}
      {tab === 'sessions' && (
        <SessionsPanel sessions={sessions} timeBlocks={timeBlocks} rooms={rooms} onChange={load} />
      )}
    </div>
  )
}
