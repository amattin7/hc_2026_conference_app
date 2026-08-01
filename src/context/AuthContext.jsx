import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(undefined)

const ACTIVE_ATTENDEE_KEY_PREFIX = 'hc_active_attendee_'
const PREVIEW_ATTENDEE_KEY = 'hc_admin_preview_attendee'

// Mobile browsers (iOS Safari/PWA especially) can leave a dead keep-alive
// connection behind when the app is backgrounded — e.g. switching to Mail to
// read a sign-in code — and the very next request after returning to the
// foreground can hang on it forever. Supabase's auth client also serializes
// operations behind an internal lock, so a hung link_attendee_to_current_user
// call here can freeze the verifyOtp caller too, indefinitely, with no way
// to recover short of force-quitting the app.
const TIMEOUT_ERROR = new Error('timeout')

function withTimeout(promiseFactory, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(TIMEOUT_ERROR), ms)
    promiseFactory().then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

// The linking RPC is safe to retry (idempotent, no single-use token), so we
// can recover from a stale connection silently — a fresh request opens a new
// connection and almost always succeeds immediately. Kept short so the
// common case resolves fast; worst case (both attempts stall) still finishes
// comfortably inside AUTH_OUTER_TIMEOUT_MS below.
const LINK_RPC_TIMEOUT_MS = 8000

async function withTimeoutAndRetry(promiseFactory, ms) {
  try {
    return await withTimeout(promiseFactory, ms)
  } catch (err) {
    if (err !== TIMEOUT_ERROR) throw err
    return await withTimeout(promiseFactory, ms)
  }
}

// signInWithOtp/verifyOtp are NOT retried automatically: verifyOtp's token is
// single-use, so replaying it after a client-side timeout could show a false
// "invalid code" error if the original request actually succeeded server-side
// (the outcome we saw in testing). Timeout is generous — comfortably longer
// than the linking RPC's worst case above — so it only fires for a genuinely
// dead connection, not while the RPC retry is still working things out.
const AUTH_OUTER_TIMEOUT_MS = 20000

const CONNECTION_ERROR_MESSAGE =
  "That's taking longer than expected. Please check your connection and try again."

// Organizers running the admin console typically aren't in the RegFox
// attendee list at all, so an admin login must never be gated on finding an
// attendees row — only attendee logins go through link_attendee_to_current_user().
function roleFromUser(user) {
  return user?.app_metadata?.role === 'admin' ? 'admin' : 'attendee'
}

function readStoredAttendeeId(userId) {
  try {
    return localStorage.getItem(ACTIVE_ATTENDEE_KEY_PREFIX + userId)
  } catch {
    return null
  }
}

function storeAttendeeId(userId, attendeeId) {
  try {
    localStorage.setItem(ACTIVE_ATTENDEE_KEY_PREFIX + userId, attendeeId)
  } catch {
    // Worst case the picker is shown again next load — not worth failing over.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // A login can resolve to more than one attendees row when two people
  // share a RegFox registration email (e.g. a couple) — attendees holds
  // every row linked to this session; activeAttendeeId is which one this
  // browser/device is currently acting as.
  const [attendees, setAttendees] = useState([])
  const [activeAttendeeId, setActiveAttendeeId] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  // Lets an admin click into the attendee-facing app without a real
  // attendees row (admins usually aren't RegFox registrants) — sessionStorage
  // so it doesn't leak into a shared/public machine's next session.
  const [previewAttendee, setPreviewAttendee] = useState(
    () => sessionStorage.getItem(PREVIEW_ATTENDEE_KEY) === '1',
  )

  const resolveSession = useCallback(async (nextSession) => {
    setSession(nextSession)

    if (!nextSession) {
      setAttendees([])
      setActiveAttendeeId(null)
      setRole(null)
      return
    }

    const nextRole = roleFromUser(nextSession.user)

    if (nextRole === 'admin') {
      setRole('admin')
      setAttendees([])
      setActiveAttendeeId(null)
      return
    }

    let data, error
    try {
      ;({ data, error } = await withTimeoutAndRetry(
        () => supabase.rpc('link_attendee_to_current_user'),
        LINK_RPC_TIMEOUT_MS,
      ))
    } catch (timeoutErr) {
      error = timeoutErr
    }

    if (error || !data || data.length === 0) {
      setAuthError(
        error === TIMEOUT_ERROR
          ? CONNECTION_ERROR_MESSAGE
          : error
            ? 'Something went wrong signing you in. Please try again.'
            : "We couldn't find a registration for that email. Please check your registration confirmation or visit the help desk.",
      )
      await supabase.auth.signOut()
      setSession(null)
      setAttendees([])
      setActiveAttendeeId(null)
      setRole(null)
      return
    }

    setRole('attendee')
    setAttendees(data)

    if (data.length === 1) {
      setActiveAttendeeId(data[0].id)
    } else {
      const stored = readStoredAttendeeId(nextSession.user.id)
      setActiveAttendeeId(data.some((a) => a.id === stored) ? stored : null)
    }
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

  // Requests a 6-digit sign-in code (primary path) — Supabase's email also
  // includes a clickable link as a fallback, handled transparently by
  // detectSessionInUrl in lib/supabase.js, but the app UI is built around
  // typing the code, not the link.
  const signInWithEmail = useCallback(async (email) => {
    setAuthError(null)
    let error
    try {
      ;({ error } = await withTimeout(
        () =>
          supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
          }),
        AUTH_OUTER_TIMEOUT_MS,
      ))
    } catch (timeoutErr) {
      error = timeoutErr
    }
    if (error) {
      setAuthError(
        error === TIMEOUT_ERROR
          ? CONNECTION_ERROR_MESSAGE
          : 'We could not send a code to that address. Please try again.',
      )
      return { ok: false }
    }
    return { ok: true }
  }, [])

  // On success this sets the session internally, which fires
  // onAuthStateChange above and runs the normal resolveSession flow —
  // nothing else to do here.
  const verifyCode = useCallback(async (email, token) => {
    setAuthError(null)
    let error
    try {
      ;({ error } = await withTimeout(
        () => supabase.auth.verifyOtp({ email, token, type: 'email' }),
        AUTH_OUTER_TIMEOUT_MS,
      ))
    } catch (timeoutErr) {
      error = timeoutErr
    }
    if (error) {
      setAuthError(
        error === TIMEOUT_ERROR
          ? CONNECTION_ERROR_MESSAGE
          : "That code didn't work or has expired. Request a new one.",
      )
      return { ok: false }
    }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(PREVIEW_ATTENDEE_KEY)
    await supabase.auth.signOut()
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const togglePreviewAttendee = useCallback(() => {
    setPreviewAttendee((prev) => {
      const next = !prev
      sessionStorage.setItem(PREVIEW_ATTENDEE_KEY, next ? '1' : '0')
      return next
    })
  }, [])

  const selectAttendee = useCallback(
    (attendeeId) => {
      if (!session?.user) return
      if (!attendees.some((a) => a.id === attendeeId)) return
      storeAttendeeId(session.user.id, attendeeId)
      setActiveAttendeeId(attendeeId)
    },
    [session, attendees],
  )

  const attendee = attendees.find((a) => a.id === activeAttendeeId) ?? null
  const needsAttendeeSelection = role === 'attendee' && attendees.length > 1 && !attendee
  const effectiveRole = role === 'admin' && previewAttendee ? 'attendee' : role

  const value = {
    session,
    user: session?.user ?? null,
    attendee,
    attendees,
    needsAttendeeSelection,
    selectAttendee,
    role,
    effectiveRole,
    previewAttendee: role === 'admin' && previewAttendee,
    togglePreviewAttendee,
    loading,
    authError,
    signInWithEmail,
    verifyCode,
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
