import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(undefined)

const ACTIVE_ATTENDEE_KEY_PREFIX = 'hc_active_attendee_'
const PREVIEW_ATTENDEE_KEY = 'hc_admin_preview_attendee'

// Everyone gets one of these on first load, silently — it's what lets
// anyone browse the schedule with zero action on their part. Claiming an
// attendee by email (see claimAttendeeByEmail) just links additional rows
// to whichever anonymous identity happens to be asking.
const ANON_SIGN_IN_ERROR_MESSAGE =
  "We're having trouble connecting right now. Please check your connection and reload."

// Mobile browsers (iOS Safari/PWA especially) can leave a dead keep-alive
// connection behind when the app is backgrounded, and the very next request
// after returning to the foreground can hang on it forever. Supabase's auth
// client also serializes operations behind an internal lock, so a hung
// claim_attendee_by_email call here can freeze other auth calls too,
// indefinitely, with no way to recover short of force-quitting the app.
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

// The claim RPC is safe to retry (idempotent — inserts are on conflict do
// nothing), so we can recover from a stale connection silently — a fresh
// request opens a new connection and almost always succeeds immediately.
// Kept short so the common case resolves fast; worst case (both attempts
// stall) still finishes comfortably inside AUTH_OUTER_TIMEOUT_MS below.
const CLAIM_RPC_TIMEOUT_MS = 8000

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

// Everyone who isn't an admin — including anonymous, not-yet-claimed
// browsers — is treated as "attendee" so schedule browsing needs no gate at
// all. Organizers running the admin console typically aren't in the RegFox
// attendee list either way, so admin status is never gated on finding an
// attendees row.
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

// Local calendar date (not UTC) — attendees are all in one place/timezone
// for the event, so "today" should match the day they're actually having,
// not flip over at 8pm Eastern the way a UTC date would.
function todayLocalDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Fire-and-forget: marks that this attendee opened the app today, for the
// admin dashboard's "signed in per day" widget. Upsert with
// ignoreDuplicates so repeat opens the same day are a cheap no-op rather
// than an error; failures here should never affect the actual app experience.
function markActivityDay(attendeeId) {
  supabase
    .from('attendee_activity_days')
    .upsert(
      { attendee_id: attendeeId, activity_date: todayLocalDate() },
      { onConflict: 'attendee_id,activity_date', ignoreDuplicates: true },
    )
    .then(() => {})
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

  // Applies attendee/role state for whatever session we're handed. For a
  // non-admin session this is purely a *read* of whatever's already linked
  // in attendee_links — claiming a new attendee by email is a separate,
  // explicit action (claimAttendeeByEmail below), not something that runs
  // automatically on every session resolve. Zero linked attendees is a
  // normal, expected state (anyone just browsing), not an error.
  const resolveSession = useCallback(async (nextSession) => {
    setSession(nextSession)

    if (!nextSession) {
      setAttendees([])
      setActiveAttendeeId(null)
      setRole(null)
      return
    }

    const nextRole = roleFromUser(nextSession.user)
    setRole(nextRole)

    if (nextRole === 'admin') {
      setAttendees([])
      setActiveAttendeeId(null)
      return
    }

    const { data, error } = await supabase.from('attendees').select('*')
    const linked = error ? [] : (data ?? [])
    setAttendees(linked)

    if (linked.length === 1) {
      setActiveAttendeeId(linked[0].id)
    } else {
      const stored = readStoredAttendeeId(nextSession.user.id)
      setActiveAttendeeId(linked.some((a) => a.id === stored) ? stored : null)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()

      let effectiveSession = initialSession
      if (!effectiveSession) {
        // First visit on this device: nobody has to type anything to browse
        // the schedule, so we establish that access silently up front.
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) {
          if (active) {
            setAuthError(ANON_SIGN_IN_ERROR_MESSAGE)
            setLoading(false)
          }
          return
        }
        effectiveSession = data.session
      }

      if (!active) return
      await resolveSession(effectiveSession)
      if (active) setLoading(false)
    }

    bootstrap()

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

  // Looks up attendees by email and links every match to whichever identity
  // (anonymous or admin-preview-adjacent) is currently asking — no code, no
  // link, no proof of ownership. Returns the same shape the old OTP-linking
  // RPC did, so the "more than one person shares this email" picker keeps
  // working unchanged.
  const claimAttendeeByEmail = useCallback(
    async (email) => {
      setAuthError(null)
      let data, error
      try {
        ;({ data, error } = await withTimeoutAndRetry(
          () => supabase.rpc('claim_attendee_by_email', { p_email: email }),
          CLAIM_RPC_TIMEOUT_MS,
        ))
      } catch (timeoutErr) {
        error = timeoutErr
      }

      if (error || !data || data.length === 0) {
        setAuthError(
          error === TIMEOUT_ERROR
            ? CONNECTION_ERROR_MESSAGE
            : error
              ? 'Something went wrong looking that up. Please try again.'
              : "We couldn't find a registration for that email. Please check your registration confirmation or visit the help desk.",
        )
        return { ok: false }
      }

      setAttendees(data)
      if (data.length === 1) {
        setActiveAttendeeId(data[0].id)
      } else {
        const stored = session ? readStoredAttendeeId(session.user.id) : null
        setActiveAttendeeId(data.some((a) => a.id === stored) ? stored : null)
      }
      return { ok: true }
    },
    [session],
  )

  // Ends whatever identity is currently active and immediately establishes a
  // fresh anonymous one — each triggers onAuthStateChange above, which does
  // the actual state resolution, same as every other auth transition here.
  // The "immediately re-anonymize" part matters on a shared/public device:
  // without it, the next person to use the browser would silently inherit
  // whatever attendee the previous person had claimed.
  const signOut = useCallback(async () => {
    sessionStorage.removeItem(PREVIEW_ATTENDEE_KEY)
    await supabase.auth.signOut()
    await supabase.auth.signInAnonymously()
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

  useEffect(() => {
    if (attendee?.id) markActivityDay(attendee.id)
  }, [attendee?.id])

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
    claimAttendeeByEmail,
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
