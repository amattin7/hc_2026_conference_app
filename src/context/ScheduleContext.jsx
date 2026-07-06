import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ScheduleContext = createContext(undefined)

export function ScheduleProvider({ children }) {
  const [timeBlocks, setTimeBlocks] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [timeBlocksRes, sessionsRes] = await Promise.all([
      supabase.from('time_blocks').select('*').order('sort_order'),
      supabase
        .from('sessions')
        .select(
          '*, room:rooms(id, name, floor, building, notes, map_svg_id), time_block:time_blocks(id, label, start_time, end_time, sort_order)',
        )
        .order('sort_order'),
    ])

    if (timeBlocksRes.error || sessionsRes.error) {
      setError(timeBlocksRes.error ?? sessionsRes.error)
    } else {
      setTimeBlocks(timeBlocksRes.data ?? [])
      setSessions(sessionsRes.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sessionsByBlock = timeBlocks.map((block) => ({
    ...block,
    sessions: sessions
      .filter((s) => s.time_block_id === block.id)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
  }))

  const getSession = (id) => sessions.find((s) => s.id === id) ?? null

  const value = {
    timeBlocks,
    sessions,
    sessionsByBlock,
    loading,
    error,
    getSession,
    refresh: load,
  }

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext)
  if (ctx === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider')
  }
  return ctx
}
