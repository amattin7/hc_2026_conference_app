import Papa from 'papaparse'

// RegFox's exact export headers are unconfirmed (PRD 12 #2), so match on
// common variants rather than one fixed name per field.
const HEADER_ALIASES = {
  email: ['email', 'email address', 'e-mail', 'e-mail address'],
  first_name: ['first name', 'firstname', 'first', 'name (first name)'],
  last_name: ['last name', 'lastname', 'last', 'name (last name)'],
  lunch: ['lunch', 'lunch add-on', 'lunch addon', 'lunch ticket'],
  tshirt_size: [
    't-shirt size',
    'tshirt size',
    'shirt size',
    't-shirt',
    'tshirt',
    'history camp boston 2026 t shirt',
  ],
  friend_of_history_camp: [
    'friends of history camp',
    'friend of history camp',
    '2026 friends of history camp',
  ],
  registration_type: ['registration type'],
  registrant_id: ['registrant id', 'registrant_id'],
  registrant_status: ['registrant status', 'status'],
}

// Real exports can have a mis-decoded BOM glued to the first header (e.g.
// "ï»¿Registration type") — strip any leading non-word junk before matching.
function normalizeHeader(header) {
  return header
    .replace(/^[^\w]+/, '')
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
}

function buildHeaderMap(headers) {
  const map = {}
  const used = new Set()
  const ignored = new Set()

  // RegFox pairs several columns with a "($ Amount)" twin — we only want
  // the underlying value (lunch, shirt size, etc.), never dollar amounts.
  for (const header of headers) {
    if (normalizeHeader(header).includes('amount')) {
      ignored.add(header)
    }
  }

  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const match = headers.find(
      (h) => !used.has(h) && !ignored.has(h) && aliases.includes(normalizeHeader(h)),
    )
    if (match) {
      map[field] = match
      used.add(match)
    }
  }

  const unmapped = headers.filter((h) => !used.has(h) && !ignored.has(h))
  return { map, unmapped }
}

function isTruthy(value) {
  if (value == null) return false
  const v = String(value).trim().toLowerCase()
  return v !== '' && v !== 'no' && v !== 'false' && v !== '0' && v !== 'n'
}

// RegFox sizes come as "1 Medium", "2 XL", etc. (quantity-prefixed). Strip
// the quantity for the normal single-item case; a rare multi-item cell
// (someone ordered two shirts) is left as-is for manual admin cleanup
// rather than guessed at.
function normalizeTshirtSize(raw) {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.includes(',') || trimmed.includes('$')) return trimmed
  return trimmed.replace(/^\d+\s+/, '')
}

// Parses a RegFox CSV export into attendees rows ready for upsert. Any
// column not recognized as one of the fields above is folded into notes
// so nothing from the export is silently dropped, except dollar-amount
// columns (never wanted) and Registrant ID/Status (used structurally, not
// worth repeating in notes).
export function parseAttendeeCsv(fileText) {
  const { data, meta, errors: parseErrors } = Papa.parse(fileText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parseErrors.length > 0) {
    return {
      rows: [],
      errors: parseErrors.map((e) => `Row ${e.row}: ${e.message}`),
      unmapped: [],
      hasRegistrantId: false,
    }
  }

  const { map, unmapped } = buildHeaderMap(meta.fields ?? [])
  const rows = []
  const errors = []

  data.forEach((record, idx) => {
    const rowNumber = idx + 2 // +1 for header row, +1 for 1-indexing
    const email = map.email ? record[map.email]?.trim() : ''
    const firstName = map.first_name ? record[map.first_name]?.trim() : ''
    const lastName = map.last_name ? record[map.last_name]?.trim() : ''

    if (!email || !firstName || !lastName) {
      const missing = !email ? 'email' : !firstName ? 'first name' : 'last name'
      errors.push(`Row ${rowNumber}: missing ${missing}`)
      return
    }

    const status = map.registrant_status ? record[map.registrant_status]?.trim().toLowerCase() : ''
    if (status === 'canceled' || status === 'cancelled') {
      errors.push(`Row ${rowNumber}: registration canceled, not imported`)
      return
    }

    const registrationType = map.registration_type ? record[map.registration_type] ?? '' : ''
    const lunch = map.lunch ? isTruthy(record[map.lunch]) : /with lunch/i.test(registrationType)

    const extraFields = unmapped
      .map((h) => (record[h]?.trim() ? `${h}: ${record[h].trim()}` : null))
      .filter(Boolean)

    // Kept in notes (unlike Registrant ID/Status) since it's useful
    // operational context, e.g. distinguishing exhibitor/author registrants.
    if (registrationType.trim()) {
      extraFields.unshift(`Registration type: ${registrationType.trim()}`)
    }

    rows.push({
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      lunch,
      tshirt_size: normalizeTshirtSize(map.tshirt_size ? record[map.tshirt_size] : ''),
      friend_of_history_camp: map.friend_of_history_camp
        ? isTruthy(record[map.friend_of_history_camp])
        : false,
      regfox_registrant_id: map.registrant_id ? record[map.registrant_id]?.trim() || null : null,
      notes: extraFields.length > 0 ? extraFields.join('; ') : null,
    })
  })

  return { rows, errors, unmapped, hasRegistrantId: Boolean(map.registrant_id) }
}
