// Sends the session-canceled/session-modified notification email (PRD 8.1)
// to every attendee who favorited the session, and logs the send to
// notifications_log. Triggered by an admin from SessionsPanel.jsx after
// saving a session with a non-active status.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function emailHtml(session, firstName) {
  if (session.status === 'canceled') {
    return `<p>Hi ${firstName},</p><p><strong>${session.title}</strong> has been canceled. You had this session saved — you may want to browse other sessions in this time block.</p>`
  }
  return `<p>Hi ${firstName},</p><p>There's been a change to <strong>${session.title}</strong>: ${
    session.status_note ?? ''
  }</p>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const {
      data: { user },
    } = await supabaseUser.auth.getUser()

    if (!user || user.app_metadata?.role !== 'admin') {
      return jsonResponse({ error: 'Forbidden' }, 403)
    }

    if (!RESEND_API_KEY) {
      return jsonResponse({ error: 'RESEND_API_KEY is not configured for this project yet.' }, 500)
    }

    const { sessionId } = await req.json()
    if (!sessionId) {
      return jsonResponse({ error: 'sessionId is required' }, 400)
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('id, title, status, status_note')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return jsonResponse({ error: 'Session not found' }, 404)
    }

    if (session.status === 'active') {
      return jsonResponse({ error: 'Session is active — nothing to notify about' }, 400)
    }

    const { data: favorites, error: favoritesError } = await supabaseAdmin
      .from('attendee_sessions')
      .select('attendee:attendees(email, first_name)')
      .eq('session_id', sessionId)

    if (favoritesError) {
      return jsonResponse({ error: favoritesError.message }, 500)
    }

    const recipients = (favorites ?? []).map((f) => f.attendee).filter((a) => a?.email)

    await Promise.all(
      recipients.map((r) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: r.email,
            subject: 'Session Update — History Camp Boston 2026',
            html: emailHtml(session, r.first_name),
          }),
        }),
      ),
    )

    await supabaseAdmin.from('notifications_log').insert({
      session_id: sessionId,
      trigger_event: session.status === 'canceled' ? 'session_canceled' : 'session_modified',
      recipients_count: recipients.length,
      sent_by_admin_id: user.id,
      sent_by_email: user.email,
    })

    return jsonResponse({ ok: true, recipientsCount: recipients.length })
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
