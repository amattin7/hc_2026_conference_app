import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const emptyForm = { name: '', floor: '', building: '', map_svg_id: '', notes: '' }

export default function RoomsPanel({ rooms, onChange }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(room) {
    setEditingId(room.id)
    setForm({
      name: room.name,
      floor: room.floor ?? '',
      building: room.building ?? '',
      map_svg_id: room.map_svg_id ?? '',
      notes: room.notes ?? '',
    })
    setFormError(null)
    setFormOpen(true)
  }

  async function submitForm(e) {
    e.preventDefault()

    const payload = {
      name: form.name.trim(),
      floor: form.floor.trim() || null,
      building: form.building.trim() || null,
      map_svg_id: form.map_svg_id.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (!payload.name) {
      setFormError('Room name is required.')
      return
    }

    const { error } = editingId
      ? await supabase.from('rooms').update(payload).eq('id', editingId)
      : await supabase.from('rooms').insert(payload)

    if (error) {
      setFormError(error.message)
      return
    }

    setFormOpen(false)
    onChange()
  }

  async function handleDelete(room) {
    if (!window.confirm(`Delete "${room.name}"? Sessions in this room will be left without a room.`)) {
      return
    }
    const { error } = await supabase.from('rooms').delete().eq('id', room.id)
    if (!error) onChange()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rooms</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-parchment"
        >
          + Add room
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-ink/60">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Building</th>
              <th className="px-3 py-2">Floor</th>
              <th className="px-3 py-2">Map ID</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">{room.name}</td>
                <td className="px-3 py-2">{room.building ?? '—'}</td>
                <td className="px-3 py-2">{room.floor ?? '—'}</td>
                <td className="px-3 py-2">{room.map_svg_id ?? '—'}</td>
                <td className="flex gap-3 px-3 py-2">
                  <button type="button" onClick={() => openEdit(room)} className="text-primary underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(room)}
                    className="text-primary-dark underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-ink/50">
                  No rooms yet.
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
            <h2 className="text-lg font-medium">{editingId ? 'Edit room' : 'Add room'}</h2>
            {formError && <p className="text-sm text-primary-dark">{formError}</p>}

            <label className="text-sm font-medium">
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Room 204"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Building
              <input
                value={form.building}
                onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Floor
              <input
                value={form.floor}
                onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                placeholder="e.g. 2nd Floor"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Map SVG element ID
              <input
                value={form.map_svg_id}
                onChange={(e) => setForm((f) => ({ ...f, map_svg_id: e.target.value }))}
                placeholder="Matches the id attribute in the floor plan SVG"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <label className="text-sm font-medium">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="e.g. Turn left at elevators"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-base"
              />
            </label>

            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-3 text-base font-medium text-parchment"
              >
                {editingId ? 'Save changes' : 'Add room'}
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
