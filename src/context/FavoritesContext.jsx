import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext(undefined)

export function FavoritesProvider({ children }) {
  const { attendee } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!attendee) {
      setFavorites([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('attendee_sessions')
      .select('id, session_id')
      .eq('attendee_id', attendee.id)
    if (!error) setFavorites(data ?? [])
    setLoading(false)
  }, [attendee])

  useEffect(() => {
    load()
  }, [load])

  const isFavorite = (sessionId) => favorites.some((f) => f.session_id === sessionId)

  const addFavorite = async (sessionId) => {
    if (!attendee) return
    const { data, error } = await supabase
      .from('attendee_sessions')
      .insert({ attendee_id: attendee.id, session_id: sessionId })
      .select('id, session_id')
      .single()
    if (!error) setFavorites((prev) => [...prev, data])
  }

  const removeFavorite = async (sessionId) => {
    const existing = favorites.find((f) => f.session_id === sessionId)
    if (!existing) return
    const { error } = await supabase.from('attendee_sessions').delete().eq('id', existing.id)
    if (!error) setFavorites((prev) => prev.filter((f) => f.id !== existing.id))
  }

  const toggleFavorite = (sessionId) =>
    isFavorite(sessionId) ? removeFavorite(sessionId) : addFavorite(sessionId)

  const value = {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refresh: load,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (ctx === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return ctx
}
