import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import StatusBadge from '../StatusBadge'

const emptyForm = {
  title: '',
  presenter_name: '',
  presenter_credentials: '',
  presenter_bio: '',
  presenter_website: '',
  presenter_email: '',
  session_description: '',
  time_block_id: '',
  room_id: '',
  status: 'active',
  status_note: '',
  sort_order: 0,
}

const emptyCoPresenter = { name: '', credentials: '', bio: '' }

export default function SessionsPanel({ sessions, timeBlocks, rooms, onChange }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [coPresenters, setCoPresenters] = useState([])
  const [coPresenterDraft, setCoPresenterDraft] = useState(emptyCoPresenter)
  const [formError, setFormError] = useState(null)
  const [notifyPrompt, setNotifyPrompt] = useState(null) // { sessionId, title }
  const [notifying, setNotifying] = useState(false)
  const [notifyResult, setNotifyResult] = useState(null)

  const timeBlockById = new Map(timeBlocks.map((b) => [b.id, b]))
  const roomById = new Map(rooms.map((r) => [r.id, r]))

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, sort_order: sessions.length })
    setCoPresenters([])
    setCoPresenterDraft(emptyCoPresenter)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(session) {
    setEditingId(session.id)
    setForm({
      title: session.title,
      presenter_name: session.presenter_name,
      presenter_credentials: session.presenter_credentials ?? '',
      presenter_bio: session.presenter_bio ?? '',
      presenter_website: session.presenter_website ?? '',
      presenter_email: session.presenter_email ?? '',
      session_description: session.session_description ?? '',
      time_block_id: session.time_block_id ?? '',
      room_id: session.room_id ?? '',
      status: session.status,
      status_note: session.status_note ?? '',
      sort_order: session.sort_order,
    })
    setCoPresenters(Array.isArray(session.co_presenters) ? session.co_presenters : [])
    setCoPresenterDraft(emptyCoPresenter)
    setFormError(null)
    setFormOpen(true)
  }

  function addCoPresenter() {
    if (!coPresenterDraft.name.trim()) return
    setCoPresenters((prev) => [...prev, coPresenterDraft])
    setCoPresenterDraft(emptyCoPresenter)
  }

  function removeCoPresenter(idx) {
    setCoPresenters((prev) => prev.filter((_, i) => i !== idx))
  }

  async function submitForm(e) {
    e.preventDefault()

    const payload = {
      title: form.title.trim(),
      presenter_name: form.presenter_name.trim(),
      presenter_credentials: form.presenter_credentials.trim() || null,
      presenter_bio: form.presenter_bio.trim() || null,
      presenter_website: form.presenter_website.trim() || null,
      presenter_email: form.presenter_email.trim() || null,
      session_description: form.session_description.trim() || null,
      co_presenters: coPresenters,
      time_block_id: form.time_block_id || null,
      room_id: form.room_id || null,
      status: form.status,
      status_note: form.status_note.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    }

    if (!payload.title || !payload.presenter_name) {
      setFormError('Title and presenter name are required.')
      return
    }
    if (payload.status !== 'active' && !payload.status_note) {
      setFormError('A status note is required when canceling or marking a session modified.')
      return
    }

    const { error } = editingId
      ? await supabase.from('sessions').update(payload).eq('id', editingId)
      : await supabase.from('sessions').insert(payload)

    if (error) {
      setFormError(error.message)
      return
    }

    setFormOpen(false)
    onChange()

    // PRD 7.2: prompt to notify favorited attendees whenever a session is
    // saved as canceled/modified. Only meaningful on an edit — a
    // brand-new session can't have any favorites yet.
    if (editingId && payload.status !== 'active') {
      setNotifyResult(null)
      setNotifyPrompt({ sessionId: editingId, title: payload.title })
    }
  }

  async function handleSendNotification() {
    if (!notifyPrompt) return
    setNotifying(true)
    const { data, error } = await supabase.functions.invoke('send-session-notification', {
      body: { sessionId: notifyPrompt.sessionId },
    })
    setNotifying(false)

    if (error) {
      setNotifyResult(`Failed to send: ${error.message}`)
      return
    }

    setNotifyResult(
      `Sent to ${data.recipientsCount} attendee${data.recipientsCount === 1 ? '' : 's'}.`,
    )
    setTimeout(() => setNotifyPrompt(null), 2500)
  }

  async function handleDelete(session) {
    if (
      !window.confirm(
        `Delete "${session.title}"? This also deletes any attendee favorites and feedback tied to it.`,
      )
    ) {
      return
    }
    const { error } = await supabase.from('sessions').delete().eq('id', session.id)
    if (!error) onChange()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sessions</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-parchment"
        >
          + Add session
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-ink/60">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Presenter</th>
              <th className="px-3 py-2">Time block</th>
              <th className="px-3 py-2">Room</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">{session.title}</td>
                <td className="px-3 py-2">{session.presenter_name}</td>
                <td className="px-3 py-2">{timeBlockById.get(session.time_block_id)?.label ?? '—'}</td>
                <td className="px-3 py-2">{roomById.get(session.room_id)?.name ?? '—'}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={session.status} /> {session.status === 'active' && 'Active'}
                </td>
                <td className="flex gap-3 px-3 py-2">
                  <button type="button" onClick={() => openEdit(session)} className="text-primary underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(session)}
                    className="text-primary-dark underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-ink/50">
                  No sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink/40 p-4">
          <form
            onSubmit={submitForm}
            className="flex max-h-[90vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-lg bg-surface p-5"
          >
            <h2 className="text-lg font-medium">{editingId ? 'Edit session' : 'Add session'}</h2>
            {formError && <p className="text-sm text-primary-dark">{formError}</p>}

            <label className="text-sm font-medium">
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                Time block
                <select
                  value={form.time_block_id}
                  onChange={(e) => setForm((f) => ({ ...f, time_block_id: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
                >
                  <option value="">— None —</option>
                  {timeBlocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Room
                <select
                  value={form.room_id}
                  onChange={(e) => setForm((f) => ({ ...f, room_id: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
                >
                  <option value="">— None —</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="text-sm font-medium">
              Session description
              <textarea
                value={form.session_description}
                onChange={(e) => setForm((f) => ({ ...f, session_description: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <div className="mt-2 border-t border-border pt-3">
              <p className="text-sm font-semibold">Presenter</p>
            </div>

            <label className="text-sm font-medium">
              Name
              <input
                required
                value={form.presenter_name}
                onChange={(e) => setForm((f) => ({ ...f, presenter_name: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Credentials
              <input
                value={form.presenter_credentials}
                onChange={(e) => setForm((f) => ({ ...f, presenter_credentials: e.target.value }))}
                placeholder="e.g. PhD, Suffolk University"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Bio
              <textarea
                value={form.presenter_bio}
                onChange={(e) => setForm((f) => ({ ...f, presenter_bio: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                Website
                <input
                  value={form.presenter_website}
                  onChange={(e) => setForm((f) => ({ ...f, presenter_website: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
                />
              </label>
              <label className="text-sm font-medium">
                Email
                <input
                  type="email"
                  value={form.presenter_email}
                  onChange={(e) => setForm((f) => ({ ...f, presenter_email: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
                />
              </label>
            </div>

            <div className="mt-2 border-t border-border pt-3">
              <p className="text-sm font-semibold">Co-presenters</p>
            </div>

            {coPresenters.map((cp, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 rounded-md bg-parchment px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {cp.name}
                    {cp.credentials ? `, ${cp.credentials}` : ''}
                  </p>
                  {cp.bio && <p className="mt-1 text-ink/70">{cp.bio}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeCoPresenter(idx)}
                  className="shrink-0 text-primary-dark underline"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-3">
              <input
                value={coPresenterDraft.name}
                onChange={(e) => setCoPresenterDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Co-presenter name"
                className="w-full rounded-md border border-border px-3 py-2 text-base"
              />
              <input
                value={coPresenterDraft.credentials}
                onChange={(e) => setCoPresenterDraft((d) => ({ ...d, credentials: e.target.value }))}
                placeholder="Credentials"
                className="w-full rounded-md border border-border px-3 py-2 text-base"
              />
              <textarea
                value={coPresenterDraft.bio}
                onChange={(e) => setCoPresenterDraft((d) => ({ ...d, bio: e.target.value }))}
                placeholder="Bio"
                rows={2}
                className="w-full rounded-md border border-border px-3 py-2 text-base"
              />
              <button
                type="button"
                onClick={addCoPresenter}
                disabled={!coPresenterDraft.name.trim()}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                + Add co-presenter
              </button>
            </div>

            <div className="mt-2 border-t border-border pt-3">
              <p className="text-sm font-semibold">Status</p>
            </div>

            <label className="text-sm font-medium">
              Status
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              >
                <option value="active">Active</option>
                <option value="canceled">Canceled</option>
                <option value="modified">Modified</option>
              </select>
            </label>

            {form.status !== 'active' && (
              <label className="text-sm font-medium">
                Status note (shown to attendees)
                <input
                  value={form.status_note}
                  onChange={(e) => setForm((f) => ({ ...f, status_note: e.target.value }))}
                  placeholder="e.g. Room changed to 204"
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
                />
              </label>
            )}

            <label className="text-sm font-medium">
              Sort order
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <div className="sticky bottom-0 mt-2 flex gap-2 bg-surface pt-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment"
              >
                {editingId ? 'Save changes' : 'Add session'}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 rounded-md border border-border px-4 py-3 text-base font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {notifyPrompt && (
        <div className="fixed inset-x-4 bottom-4 z-20 rounded-lg border border-border bg-surface p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:w-96">
          <p className="text-sm font-medium">
            Send email notification to attendees who favorited "{notifyPrompt.title}"?
          </p>
          {notifyResult && <p className="mt-2 text-sm text-ink/70">{notifyResult}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSendNotification}
              disabled={notifying}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-parchment disabled:opacity-50"
            >
              {notifying ? 'Sending…' : 'Send'}
            </button>
            <button
              type="button"
              onClick={() => setNotifyPrompt(null)}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
