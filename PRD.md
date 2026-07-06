# History Camp Boston 2026 — Companion App
## Product Requirements Document

**Version:** 2.0  
**Status:** Draft  
**Prepared for:** Claude Code  
**Last Updated:** May 2026

---

## 1. Overview

### 1.1 Purpose
A Progressive Web App (PWA) for History Camp Boston 2026 attendees to use on the day of the event. The app provides a personalized, interactive experience: attendees can view the schedule, build a personal session agenda, navigate to rooms, and submit session feedback. Organizers use a separate admin interface to manage content, capture paper feedback, and monitor event activity.

### 1.2 Event Profile
- **Event Name:** History Camp Boston 2026
- **Organizing Body:** The Pursuit of History, Inc. (501(c)(3) nonprofit)
- **Main Conference Day:** Saturday, August 8, 2026
- **Venue:** Suffolk University Law School, 120 Tremont Street, Boston, MA
- **Doors Open:** 8:00 AM
- **Exhibit Hall:** 8:00 AM – 3:30 PM
- **Lunch:** 12:15 PM – 1:30 PM (catered, add-on ticket; or on your own)
- **Sessions:** 7 time blocks throughout the day; 6–8 sessions per block (~50 sessions total)
- **Attendance:** ~350 pre-registered attendees
- **Registration platform:** RegFox (attendee data imported via CSV)

### 1.3 Goals
- Give attendees a frictionless, personalized experience without requiring app store installation
- Collect structured session feedback from app users and paper form respondents in a single system
- Provide organizers with a real-time dashboard and reporting tools
- Minimize day-of operational overhead for the organizing team

---

## 2. Branding

### 2.1 Identity
- **Brand Name:** History Camp® (registered trademark of The Pursuit of History)
- **Event Name (app display):** History Camp Boston 2026
- **Logo:** Available at `https://historycamp.org/wp-content/uploads/History-Camp-LOGO-66px.png`
- **Social share image:** `https://historycamp.org/wp-content/uploads/hc-logo-social-media.png`
- **Event banner (2026):** `https://historycamp.org/wp-content/uploads/History-Camp-BOSTON-2026-R-W-SHADOW-1024x215.png`

### 2.2 Color Palette
*To be confirmed with organizers. Based on site and logo imagery, the brand uses a red, white, and dark palette consistent with American historical themes. Exact hex values TBD.*

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | TBD (likely red) | Primary actions, header |
| `--color-surface` | TBD | Cards, panels |
| `--color-background` | TBD | App background |
| `--color-text` | TBD | Body text |

### 2.3 Typography
*To be confirmed. Site uses a serif/display style consistent with historical branding. Specific font families TBD — to be selected to match or complement historycamp.org.*

### 2.4 PWA App Identity
- **App short name (manifest):** `History Camp`
- **App full name (manifest):** `History Camp Boston 2026`
- **Theme color:** TBD (match primary)
- **Icons required:** 192×192px and 512×512px PNG versions of the HC logo

### 2.5 Tone
Warm, enthusiastic, historically informed. Attendees are passionate amateur historians — write copy to match. Avoid generic event app language ("Welcome to the event!"). Prefer specific, characterful phrasing ("Your guide to a great day of history.").

---

## 3. Users & Roles

### 3.1 Attendee (Public User)
Pre-registered conference attendees. Access the app via a shared URL or QR code distributed at the event (on printed materials, welcome signs, etc.). Authenticate via magic link (no password). Identified by the email address used during RegFox registration.

### 3.2 Administrator (Internal User)
Conference organizers (small group, ~3–5 people). Access a separate `/admin` section of the same app. Authenticated via Supabase Auth with admin role flag. Capabilities include content management, data import, paper feedback entry, and dashboard access.

### 3.3 Role Enforcement
- Role stored in Supabase user metadata (`role: "admin"` or `role: "attendee"`)
- Row Level Security (RLS) policies enforce data access at the database level
- Admin routes protected by role check on the frontend and enforced server-side via RLS

---

## 4. Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React (PWA) |
| Styling | Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth — Magic Link |
| Hosting | Vercel |
| Email Notifications | Supabase transactional email or Resend |
| Maps | SVG floor plan with React overlay |
| CI/CD | GitHub → Vercel (auto-deploy on push to `main`) |

### 4.1 PWA Requirements
- `manifest.json` with: name, short_name, icons (192px and 512px), theme_color, background_color, display: `standalone`
- Service worker for offline caching of schedule, session data, map SVG, and static content
- App must function acceptably on degraded conference WiFi once data is cached on login
- "Add to Home Screen" prompt encouraged on first login

### 4.2 Domain & Hosting

**The app will be hosted on Vercel and accessed via a subdomain of historycamp.org** (e.g., `app.historycamp.org`).

**How this works:**
1. Deploy the app to Vercel — Vercel assigns a default URL (e.g., `history-camp-app.vercel.app`)
2. In Vercel project settings, add custom domain: `app.historycamp.org`
3. In historycamp.org's DNS settings (managed by their hosting provider/registrar), add a CNAME record:
   - **Name:** `app`
   - **Value:** `cname.vercel-dns.com` (Vercel provides the exact target)
4. Vercel automatically provisions and renews a free SSL certificate (HTTPS) for the subdomain
5. The app is live at `https://app.historycamp.org`

**No changes are needed to the main historycamp.org site or its WordPress installation.** The subdomain is fully independent. The organizers just need the ability to add a DNS record — any registrar (GoDaddy, Namecheap, Cloudflare, etc.) supports this.

**If a subdomain isn't possible:** The app can run at its default Vercel URL (`*.vercel.app`), which works fine — it just won't be on the historycamp.org domain. For the event, a short URL or QR code pointing to the Vercel URL works equally well.

---

## 5. Data Model

### 5.1 `attendees`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| email | text | Unique; matches RegFox registration email |
| first_name | text | |
| last_name | text | |
| lunch | boolean | From RegFox CSV |
| tshirt_size | text | e.g., "M", "L", "XL"; null if not ordered |
| tshirt_claimed | boolean | Admin marks when shirt distributed at event |
| lunch_claimed | boolean | Admin marks when lunch ticket collected |
| checked_in | boolean | Admin marks on day-of arrival (optional) |
| checked_in_at | timestamptz | Timestamp of check-in (optional) |
| notes | text | Additional RegFox fields or admin notes |
| user_id | uuid | FK → auth.users; linked on first login |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> **On adding columns later:** Adding new columns to a Supabase (PostgreSQL) table is easy and non-destructive — it does not affect existing data or break the app. New columns default to `null` for all existing rows. This is a routine `ALTER TABLE` operation. Design the schema to be useful now, but don't over-engineer; add columns as needs emerge.

> **Feedback tracking at the attendee level:** Rather than storing `has_provided_feedback` as a column (which would require constant updates), derive feedback status from the `session_feedback` table via a database view or query: `SELECT COUNT(*) FROM session_feedback WHERE attendee_id = ?`. The admin dashboard should use this derived approach. No stored column needed.

### 5.2 `sessions`
Based on the 2025 History Camp session format, each session has two distinct text blocks: a speaker bio and a session description. These are separate fields.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | Session title (e.g., "1775: The Year the War Began") |
| presenter_name | text | Full name with credentials (e.g., "Robert J. Allison, PhD") |
| presenter_credentials | text | Short credential string for display (e.g., "PhD, Suffolk University") |
| presenter_bio | text | Full paragraph bio of the speaker; may include affiliations, publications, prior History Camps |
| presenter_website | text | Optional URL (e.g., robertallisonhistory.com) |
| presenter_email | text | Optional contact email |
| session_description | text | Paragraph describing the talk content |
| co_presenters | jsonb | Array of `{name, credentials, bio}` objects for sessions with multiple speakers |
| time_block_id | uuid | FK → time_blocks |
| room_id | uuid | FK → rooms |
| status | text | `active`, `canceled`, `modified` |
| status_note | text | Plain-language explanation shown to users (e.g., "Room changed to 204") |
| sort_order | integer | Within a time block, if ordering matters |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.3 `time_blocks`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| label | text | Display label (e.g., "Block 1 — 9:00–10:00 AM") |
| start_time | timestamptz | Used for feedback early-submission detection |
| end_time | timestamptz | |
| sort_order | integer | For display ordering |

### 5.4 `rooms`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Display name (e.g., "Room 204", "Main Hall") |
| map_svg_id | text | ID of the SVG element to highlight (matches `id` attr in SVG file) |
| floor | text | Optional (e.g., "2nd Floor") |
| building | text | Optional; for multi-building venues |
| notes | text | Optional wayfinding note (e.g., "Turn left at elevators") |

### 5.5 `attendee_sessions` (Favorites)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| attendee_id | uuid | FK → attendees |
| session_id | uuid | FK → sessions |
| created_at | timestamptz | |
| UNIQUE | (attendee_id, session_id) | Prevent duplicates |

### 5.6 `session_feedback`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → sessions |
| attendee_id | uuid | FK → attendees; null if paper/anonymous |
| rating | integer | 1–5 |
| comment | text | Optional free text |
| source | text | `app` or `paper` |
| submitted_at | timestamptz | Actual submission timestamp |
| flagged_early | boolean | Auto-set true if submitted before session start_time |
| entered_by_admin_id | uuid | FK → auth.users; set when source = `paper` |
| UNIQUE | (attendee_id, session_id) | One app submission per attendee per session (paper exempt) |

### 5.7 `programs`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | |
| description | text | Rich text / markdown |
| url | text | Optional external link |
| image_url | text | Optional |
| sort_order | integer | |
| active | boolean | |

### 5.8 `notifications_log`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → sessions |
| trigger_event | text | `session_canceled`, `session_modified` |
| recipients_count | integer | |
| sent_at | timestamptz | |
| sent_by_admin_id | uuid | |

---

## 6. Attendee-Facing Features

### 6.1 Authentication — Magic Link Login

**Flow:**
1. Attendee visits `https://app.historycamp.org` (from QR code or printed URL)
2. Presented with a single email input field
3. Enters the email used during RegFox registration
4. Supabase sends a magic link email; attendee taps link → authenticated session established
5. On first login, `auth.users.id` is linked to matching `attendees` record by email
6. If email not found: *"We couldn't find a registration for that email. Please check your registration confirmation or visit the help desk."*

**UX Notes:**
- No password ever created or required
- Session persists for the full day — do not expire mid-event
- On login success, redirect to Home screen
- Show a dismissible "Add to Home Screen" banner on first login

---

### 6.2 Home Screen
- Personalized greeting: *"Good morning, [First Name]"*
- Current/upcoming time block prominently shown ("Up Next: Block 3 — 11:00 AM")
- Quick navigation: My Schedule | Full Schedule | Map | Programs
- Notification banner area: displays session-change alerts for any favorited sessions (dismissible per alert)

---

### 6.3 Registration Summary
Accessible from profile/account area. Read-only. Displays:
- Full name
- Lunch: Yes / No (+ claimed status if admin has marked it)
- T-Shirt: Size / "Not ordered"
- Any additional fields surfaced from RegFox import

---

### 6.4 Schedule — Full Browse View

**Layout:**
- Organized by time block (sorted by start time)
- Each time block is a collapsible section showing all sessions in that block
- Session card shows: title, presenter name, room name, brief description excerpt
- Canceled sessions shown with strikethrough badge (not hidden)
- Modified sessions shown with "Updated" badge

**Search / Filter:**
- Search by session title or presenter name
- Filter by time block (nice-to-have)

---

### 6.5 Session Detail View
Each session displays:
- **Title**
- **Presenter name and credentials**
- **Time block** (label + times)
- **Room** → tappable link to Map view with that room highlighted
- **Presenter bio** (full paragraph)
- **Session description** (full paragraph)
- **Co-presenter(s)** if applicable (same bio/description structure)
- **Favorite toggle** ("I'm Interested" / bookmarked)
- **Feedback section** (see 6.7)
- **Status banner** if canceled or modified (with status_note displayed)

---

### 6.6 My Schedule (Favorites)
- Chronological list of all favorited sessions
- Each item shows: time block, room, room link to map
- **Conflict detection:** when a session is favorited in a time block where the attendee already has a favorite, show inline alert: *"You already have [Session Title] at this time — you can only attend one."* Informational only; not a hard block
- Canceled sessions remain visible with badge and prompt: *"This session was canceled. You may want to choose another for this time slot."*

---

### 6.7 Session Feedback

**Availability:**
- Feedback form available on session detail at all times
- If submitted before `time_blocks.start_time`, `flagged_early` auto-set to `true` — no user-facing restriction
- One app submission per attendee per session

**Form:**
- Star rating 1–5 (required)
- Comment: free text (optional)

**Post-submit:**
- Confirmation: *"Thank you for your feedback!"*
- Form replaced with read-only submitted view

---

### 6.8 Interactive Map

**Behavior:**
- Accessed from Session Detail or My Schedule via "Find this room" link
- Opens full-screen SVG floor plan
- Target room highlighted (distinct fill color) when opened from a session link
- Tapping a room shows tooltip: room name and any sessions scheduled there
- Accessible as standalone map page for general browsing

**Implementation:**
- SVG provided by organizer; room elements have `id` attributes matching `rooms.map_svg_id`
- React component renders SVG inline, applies dynamic highlight styles by element ID

---

### 6.9 Programs
- Browsable list of The Pursuit of History's other programs and events
- Each entry: title, description, optional image, optional external link
- Read-only for attendees; managed by admin

---

## 7. Admin-Facing Features

Accessible at `/admin`. Protected by role check (client-side + RLS).

### 7.1 Attendee Management

**CSV Import:**
- Upload RegFox CSV export
- Column mapping: `email`, `first_name`, `last_name`, `lunch`, `tshirt_size`, plus any additional columns from the export mapped to `notes`
- Upsert on email (duplicate emails update existing records)
- Import summary: records added / updated / errors

**Manual Add / Edit:**
- Add single attendee (for last-minute registrations)
- Edit any attendee record

**Day-of Logistics (optional admin view):**
- Mark attendee as `checked_in`
- Mark `tshirt_claimed`, `lunch_claimed`
- Useful for staffing the welcome table

### 7.2 Session & Schedule Management
- **Full CRUD** for sessions: create, edit, delete
- Fields match the `sessions` data model above: title, presenter name, credentials, bio, website, email, session description, co-presenters, time block, room, status, status_note
- Rich text editor for bio and description fields (or markdown)
- **Status change + notification trigger:** when status set to `canceled` or `modified`, prompt admin: *"Send email notification to attendees who favorited this session?"* — manual confirmation before send

### 7.3 Room & Map Management
- Create/edit rooms: name, floor, building, map_svg_id, notes
- Upload/replace floor plan SVG asset

### 7.4 Paper Feedback Entry
- Select session from dropdown
- Fill in: rating (1–5), optional comment, optional attendee name (stored as text note, not linked to record)
- `source` set to `paper`, `entered_by_admin_id` recorded
- Keyboard-friendly, auto-reset form for rapid entry of multiple paper forms

### 7.5 Admin Dashboard

**Session Interest Panel:**
- Table: session title, time block, room, # interested
- Sortable by interest count

**Feedback Panel:**
- Per-session: # submissions (app vs. paper), average rating
- Aggregate stats: total submissions, overall average, # early-flagged
- Filter by time block

**Attendee Feedback Summary (derived, not stored):**
- For each attendee: how many sessions they submitted feedback for (computed from `session_feedback` table)
- Useful for reporting: "What % of attendees provided at least one piece of feedback?"

**Notification Log:**
- Session, trigger event, recipient count, sent at, sent by

**Export:**
- CSV export: all feedback (session, time block, rating, comment, source, submitted_at, flagged_early)

---

## 8. Notifications

### 8.1 Session Change Email
**Trigger:** Admin marks session as `canceled` or `modified` and confirms send  
**Recipients:** Attendees who favorited that session (via `attendee_sessions`)  
**Channel:** Email (Supabase transactional or Resend)

**Canceled:**
> Subject: Session Update — History Camp Boston 2026
>
> Hi [First Name], **[Session Title]** has been canceled. You had this session saved — you may want to browse other sessions in this time block. [Open App]

**Modified:**
> Subject: Session Update — History Camp Boston 2026
>
> Hi [First Name], there's been a change to **[Session Title]**: [status_note]. [Open App]

### 8.2 In-App Alert Banner
- On app load, query for favorited sessions with `status != 'active'`
- Show dismissible banner per affected session on Home screen
- Dismissed state stored in `localStorage` (transient, not in DB)

### 8.3 Out of Scope (v1)
- Native push notifications (unreliable on iOS PWA)
- SMS notifications

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Service worker caches schedule and session data on login
- Usable with degraded or absent WiFi once cached
- Target: initial load under 3 seconds on 4G

### 9.2 Accessibility
- Touch targets minimum 44px (mobile-first)
- WCAG AA color contrast
- Minimum 16px body text
- Audience skews older — prioritize clarity, legibility, and large tap targets over visual density

### 9.3 Security
- All Supabase tables protected by RLS
- Admin routes enforced at both frontend and database level
- Magic links expire in 1 hour (standard Supabase); session token persists post-auth for the full day
- No sensitive PII beyond name and email stored

### 9.4 Scale
- ~350 concurrent users; Supabase and Vercel free tiers are sufficient

---

## 10. Environment & Deployment

### 10.1 Environments
| Environment | Purpose | URL |
|---|---|---|
| Production | Live event app | `https://app.historycamp.org` |
| Preview | Vercel branch previews | Auto-generated per PR |
| Local | Development | `localhost:3000` |

### 10.2 Environment Variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-side / admin only
RESEND_API_KEY=                # if using Resend for email
VITE_APP_NAME="History Camp Boston 2026"
VITE_CONFERENCE_DATE="2026-08-08"
VITE_VENUE_NAME="Suffolk University Law School"
VITE_VENUE_ADDRESS="120 Tremont Street, Boston, MA"
```

### 10.3 CI/CD
- GitHub repository connected to Vercel
- `main` branch → auto-deploys to production
- Feature branches → Vercel preview deployments
- No manual deploy steps after initial setup

---

## 11. Out of Scope (v1)

- Native iOS / Android app
- Live session streaming or video
- Attendee-to-attendee networking or messaging
- Speaker-facing portal
- RegFox live API integration (CSV import only)
- Payment processing
- Multi-day event support (Friday reception, Sunday tours are out of scope)
- Native push notifications

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | **Exact brand colors and fonts** — hex values and font names from historycamp.org design (site by mnd.nyc) | Organizer | Open |
| 2 | **RegFox CSV column headers** — exact field names from the RegFox export to map correctly on import | Organizer | Open |
| 3 | **Floor plan SVG asset** — building/room layout for Suffolk University Law School; room `id` attributes needed for map integration | Organizer / Dev | Open |
| 4 | **Email sending domain** — what domain/address will magic links and notifications send from? Needs SPF/DKIM setup if using custom domain | Organizer / Dev | Open |
| 5 | **DNS access** — confirm organizers can add a CNAME record to `historycamp.org` DNS for the `app` subdomain | Organizer | Open |
| 6 | **Additional RegFox fields** — beyond lunch and t-shirt, what other registration data should be displayed in the app? | Organizer | Open |
| 7 | **Programs content** — list of programs / other events to display in the Programs section; confirm admin-editable vs. static | Organizer | Open |
| 8 | **Co-presenter handling** — some 2025 sessions had two presenters with separate bios; confirm this is expected for 2026 | Organizer | Open |
| 9 | **Feedback question structure** — confirm star rating + open comment is sufficient, or are specific rating dimensions desired (e.g., "content," "presenter," "overall")? | Organizer | Open |

---

*End of Document — v2.0*
