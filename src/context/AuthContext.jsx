import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(undefined)

// Organizers running the admin console typically aren't in the RegFox
// attendee list at all, so an admin login must never be gated on finding an
// attendees row — only attendee logins go through link_attendee_to_current_user().
function roleFromUser(user) {
  return user?.app_metadata?.role === 'admin' ? 'admin' : 'attendee'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [attendee, setAttendee] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const resolveSession = useCallback(async (nextSession) => {
    setSession(nextSession)

    if (!nextSession) {
      setAttendee(null)
      setRole(null)
      return
    }

    const nextRole = roleFromUser(nextSession.user)

    if (nextRole === 'admin') {
      setRole('admin')
      setAttendee(null)
      return
    }

    const { data, error } = await supabase.rpc('link_attendee_to_current_user')

    if (error) {
      if (error.message?.includes('no_matching_attendee')) {
        setAuthError(
          "We couldn't find a registration for that email. Please check your registration confirmation or visit the help desk.",
        )
      } else {
        setAuthError('Something went wrong signing you in. Please try again.')
      }
      await supabase.auth.signOut()
      setSession(null)
      setAttendee(null)
      setRole(null)
      return
    }

    setRole('attendee')
    setAttendee(data)
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!active) return
      await resolveSession(initialSession)
      if (active) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return
      setLoading(true)
      await resolveSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [resolveSession])

  const signInWithEmail = useCallback(async (email) => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setAuthError('We could not send a sign-in link to that address. Please try again.')
      return { ok: false }
    }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const value = {
    session,
    user: session?.user ?? null,
    attendee,
    role,
    loading,
    authError,
    signInWithEmail,
    signOut,
    clearAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
