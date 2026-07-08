import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatTime, toDatetimeLocalInput, fromDatetimeLocalInput } from '../../lib/format'

const emptyForm = { label: '', start_time: '', end_time: '', sort_order: 0 }

export default function TimeBlocksPanel({ timeBlocks, onChange }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, sort_order: timeBlocks.length })
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(block) {
    setEditingId(block.id)
    setForm({
      label: block.label,
      start_time: toDatetimeLocalInput(block.start_time),
      end_time: toDatetimeLocalInput(block.end_time),
      sort_order: block.sort_order,
    })
    setFormError(null)
    setFormOpen(true)
  }

  async function submitForm(e) {
    e.preventDefault()

    const payload = {
      label: form.label.trim(),
      start_time: fromDatetimeLocalInput(form.start_time),
      end_time: fromDatetimeLocalInput(form.end_time),
      sort_order: Number(form.sort_order) || 0,
    }

    if (!payload.label || !payload.start_time || !payload.end_time) {
      setFormError('Label, start time, and end time are required.')
      return
    }
    if (payload.end_time <= payload.start_time) {
      setFormError('End time must be after start time.')
      return
    }

    const { error } = editingId
      ? await supabase.from('time_blocks').update(payload).eq('id', editingId)
      : await supabase.from('time_blocks').insert(payload)

    if (error) {
      setFormError(error.message)
      return
    }

    setFormOpen(false)
    onChange()
  }

  async function handleDelete(block) {
    if (!window.confirm(`Delete "${block.label}"? Sessions in this block will be unscheduled, not deleted.`)) {
      return
    }
    const { error } = await supabase.from('time_blocks').delete().eq('id', block.id)
    if (!error) onChange()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Time Blocks</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-parchment"
        >
          + Add time block
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-ink/60">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Start</th>
              <th className="px-3 py-2">End</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {timeBlocks.map((block) => (
              <tr key={block.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">{block.sort_order}</td>
                <td className="px-3 py-2">{block.label}</td>
                <td className="px-3 py-2">{formatTime(block.start_time)}</td>
                <td className="px-3 py-2">{formatTime(block.end_time)}</td>
                <td className="flex gap-3 px-3 py-2">
                  <button type="button" onClick={() => openEdit(block)} className="text-primary underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(block)}
                    className="text-primary-dark underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {timeBlocks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-ink/50">
                  No time blocks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-10 flex items-end justify-center bg-ink/40 sm:items-center">
          <form
            onSubmit={submitForm}
            className="flex w-full max-w-md flex-col gap-3 rounded-t-lg bg-surface p-5 sm:rounded-lg"
          >
            <h2 className="text-lg font-medium">
              {editingId ? 'Edit time block' : 'Add time block'}
            </h2>
            {formError && <p className="text-sm text-primary-dark">{formError}</p>}

            <label className="text-sm font-medium">
              Label
              <input
                required
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Block 1"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Start time
              <input
                type="datetime-local"
                required
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              End time
              <input
                type="datetime-local"
                required
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Sort order
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment"
              >
                {editingId ? 'Save changes' : 'Add time block'}
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
