import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { parseAttendeeCsv } from '../../lib/attendeeImport'

const emptyForm = {
  email: '',
  first_name: '',
  last_name: '',
  lunch: false,
  tshirt_size: '',
  friend_of_history_camp: false,
  notes: '',
}

export default function AdminAttendees() {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')

  const [importPreview, setImportPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importSummary, setImportSummary] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('attendees').select('*').order('last_name')
    if (error) setLoadError(error)
    else {
      setLoadError(null)
      setAttendees(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const text = await file.text()
    const { rows, errors, hasRegistrantId } = parseAttendeeCsv(text)

    // RegFox registrants can share an email (e.g. a couple registered
    // together), so de-dup/upsert on the per-registration Registrant ID
    // when the file has one — email is only a fallback for CSVs that don't
    // (e.g. a hand-built list of late additions).
    const conflictKey = hasRegistrantId ? 'regfox_registrant_id' : 'email'
    const existingKeys = new Set(
      attendees
        .map((a) => (hasRegistrantId ? a.regfox_registrant_id : a.email.toLowerCase()))
        .filter(Boolean),
    )
    const newCount = rows.filter(
      (r) => !existingKeys.has(hasRegistrantId ? r.regfox_registrant_id : r.email),
    ).length

    setImportSummary(null)
    setImportPreview({ rows, errors, newCount, updateCount: rows.length - newCount, conflictKey })
  }

  async function confirmImport() {
    if (!importPreview || importPreview.rows.length === 0) return
    setImporting(true)
    const { error } = await supabase
      .from('attendees')
      .upsert(importPreview.rows, { onConflict: importPreview.conflictKey })
    setImporting(false)

    if (error) {
      setImportSummary({ ok: false, message: error.message })
      return
    }

    setImportSummary({
      ok: true,
      added: importPreview.newCount,
      updated: importPreview.updateCount,
      skipped: importPreview.errors.length,
    })
    setImportPreview(null)
    load()
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(attendee) {
    setEditingId(attendee.id)
    setForm({
      email: attendee.email,
      first_name: attendee.first_name,
      last_name: attendee.last_name,
      lunch: attendee.lunch,
      tshirt_size: attendee.tshirt_size ?? '',
      friend_of_history_camp: attendee.friend_of_history_camp,
      notes: attendee.notes ?? '',
    })
    setFormError(null)
    setFormOpen(true)
  }

  async function submitForm(e) {
    e.preventDefault()

    const payload = {
      email: form.email.trim().toLowerCase(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      lunch: form.lunch,
      tshirt_size: form.tshirt_size.trim() || null,
      friend_of_history_camp: form.friend_of_history_camp,
      notes: form.notes.trim() || null,
    }

    if (!payload.email || !payload.first_name || !payload.last_name) {
      setFormError('Email, first name, and last name are required.')
      return
    }

    const { error } = editingId
      ? await supabase.from('attendees').update(payload).eq('id', editingId)
      : await supabase.from('attendees').insert(payload)

    if (error) {
      setFormError(error.message)
      return
    }

    setFormOpen(false)
    load()
  }

  async function toggleFlag(attendee, field) {
    const value = !attendee[field]
    const patch =
      field === 'checked_in'
        ? { checked_in: value, checked_in_at: value ? new Date().toISOString() : null }
        : { [field]: value }

    setAttendees((prev) => prev.map((a) => (a.id === attendee.id ? { ...a, ...patch } : a)))
    const { error } = await supabase.from('attendees').update(patch).eq('id', attendee.id)
    if (error) load()
  }

  const filtered = attendees.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.email.toLowerCase().includes(q) ||
      a.first_name.toLowerCase().includes(q) ||
      a.last_name.toLowerCase().includes(q)
    )
  })

  if (loading) return <p className="text-base text-ink/60">Loading attendees…</p>

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Attendees</h1>
        <p className="mt-1 text-sm text-ink/60">{attendees.length} registered</p>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">Import RegFox CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} className="text-sm" />

        {importPreview && (
          <div className="flex flex-col gap-2 rounded-md bg-parchment p-3 text-sm">
            <p>
              {importPreview.rows.length} valid row{importPreview.rows.length === 1 ? '' : 's'} —{' '}
              {importPreview.newCount} new, {importPreview.updateCount} update
              {importPreview.updateCount === 1 ? '' : 's'}.
              {importPreview.errors.length > 0 &&
                ` ${importPreview.errors.length} row${importPreview.errors.length === 1 ? '' : 's'} skipped.`}
            </p>
            {importPreview.errors.length > 0 && (
              <ul className="list-disc pl-5 text-primary-dark">
                {importPreview.errors.slice(0, 10).map((e) => (
                  <li key={e}>{e}</li>
                ))}
                {importPreview.errors.length > 10 && (
                  <li>…and {importPreview.errors.length - 10} more</li>
                )}
              </ul>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmImport}
                disabled={importing || importPreview.rows.length === 0}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-parchment disabled:opacity-50"
              >
                {importing ? 'Importing…' : `Import ${importPreview.rows.length} rows`}
              </button>
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {importSummary && (
          <p className={`text-sm ${importSummary.ok ? 'text-ink/70' : 'text-primary-dark'}`}>
            {importSummary.ok
              ? `Import complete: ${importSummary.added} added, ${importSummary.updated} updated${
                  importSummary.skipped ? `, ${importSummary.skipped} skipped` : ''
                }.`
              : `Import failed: ${importSummary.message}`}
          </p>
        )}
      </section>

      <section className="flex items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="flex-1 rounded-md border border-border bg-surface px-4 py-3 text-base"
        />
        <button
          type="button"
          onClick={openAdd}
          className="whitespace-nowrap rounded-md bg-primary px-4 py-3 text-sm font-medium text-parchment"
        >
          + Add attendee
        </button>
      </section>

      {loadError && (
        <p className="text-sm text-primary-dark">Couldn't load attendees: {loadError.message}</p>
      )}

      <section className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-ink/60">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Lunch</th>
              <th className="px-3 py-2">Shirt</th>
              <th className="px-3 py-2">Friend</th>
              <th className="px-3 py-2">Checked in</th>
              <th className="px-3 py-2">Shirt claimed</th>
              <th className="px-3 py-2">Lunch claimed</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">
                  {a.first_name} {a.last_name}
                </td>
                <td className="px-3 py-2">{a.email}</td>
                <td className="px-3 py-2">{a.lunch ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2">{a.tshirt_size ?? '—'}</td>
                <td className="px-3 py-2">{a.friend_of_history_camp ? '★' : '—'}</td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={a.checked_in}
                    onChange={() => toggleFlag(a, 'checked_in')}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={a.tshirt_claimed}
                    onChange={() => toggleFlag(a, 'tshirt_claimed')}
                    disabled={!a.tshirt_size}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={a.lunch_claimed}
                    onChange={() => toggleFlag(a, 'lunch_claimed')}
                    disabled={!a.lunch}
                  />
                </td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => openEdit(a)} className="text-primary underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-ink/50">
                  No attendees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-10 flex items-end justify-center bg-ink/40 sm:items-center">
          <form
            onSubmit={submitForm}
            className="flex w-full max-w-md flex-col gap-3 rounded-t-lg bg-surface p-5 sm:rounded-lg"
          >
            <h2 className="text-lg font-medium">{editingId ? 'Edit attendee' : 'Add attendee'}</h2>
            {formError && <p className="text-sm text-primary-dark">{formError}</p>}

            <label className="text-sm font-medium">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              First name
              <input
                required
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Last name
              <input
                required
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.lunch}
                onChange={(e) => setForm((f) => ({ ...f, lunch: e.target.checked }))}
              />
              Lunch add-on
            </label>

            <label className="text-sm font-medium">
              T-shirt size
              <input
                value={form.tshirt_size}
                onChange={(e) => setForm((f) => ({ ...f, tshirt_size: e.target.value }))}
                placeholder="Leave blank if not ordered"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.friend_of_history_camp}
                onChange={(e) =>
                  setForm((f) => ({ ...f, friend_of_history_camp: e.target.checked }))
                }
              />
              Friend of History Camp
            </label>

            <label className="text-sm font-medium">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment"
              >
                {editingId ? 'Save changes' : 'Add attendee'}
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
    </div>
  )
}
