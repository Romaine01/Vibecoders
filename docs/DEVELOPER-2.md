# Developer 2 — Community Information, Documents & Responsiveness

Scope delivered: Resident Services, Document Services, Community Information,
Responsive/PWA, Accessibility. All work is additive on top of Developer 1's
in-memory demo store and API routes. No git history was rewritten.

## What was added

### Document services
- `src/lib/document-catalog.ts` — requirements, description, and processing
  text per document type; status transition helpers (`nextDocumentStatuses`,
  `activeDocumentStatuses`, `completedDocumentStatuses`).
- `src/components/document-center.tsx` — rewritten 4-step flow:
  Select → Purpose → Review → Submitted (stepper, requirements display,
  applicant/address prefilled from `/api/auth/me`, success banner with
  `DOC-YYYY-XXXX` reference).
- `src/components/document-detail.tsx` + `src/app/app/documents/[reference]/page.tsx`
  — resident detail view: status badge, purpose, requirements, status-history
  timeline, loading/error states, and a QR code (generated locally with the
  `qrcode` package) linking to `/verify/[reference]` once released.
- `src/components/activity-feed.tsx` + rewritten `src/app/app/activity/page.tsx` —
  unified concerns + documents feed with All / Concerns / Documents / Active /
  Completed filters.
- `src/components/admin-documents.tsx` — rewritten admin console: search
  (reference, resident, type, purpose), status filter chips, request list,
  detail panel with status timeline, custom note field, transition buttons
  (`submitted → under_review → processing → ready → released`, plus
  `rejected` from active states), matching the existing
  `POST /api/documents/[reference]/actions` API.

### Resident profile
- `src/lib/validation.ts` — additive `profileSchema` (fullName, phone, address).
- `src/app/api/profile/route.ts` — GET/PUT for the signed-in resident's profile
  via `store.profiles` (no edit to `demo-store.ts`).
- `src/components/profile-panel.tsx` + `src/app/app/profile/page.tsx` — account
  details and editable contact fields.

### Community information
- `src/lib/types.ts` — additive: `AnnouncementType`
  (`announcement|advisory|emergency|service_notice`), `AnnouncementStatus`
  (`draft|published|archived`), optional `Announcement.type/status`,
  `EmergencyCategory` (`medical|police|fire|disaster|other`), optional
  `EmergencyContact.category`, `Profile.phone/address`.
- `src/app/app/announcements/page.tsx` — type legend; emergency-priority rows
  emphasized.
- `src/app/app/emergency/page.tsx` — contacts grouped by category with icons
  and a "call first" notice; tel: links preserved.
- `src/components/content-manager.tsx` — admin selects for type/priority/
  category and announcement lifecycle (publish/archive) via new
  `PATCH /api/announcements/[id]`.
- `src/app/api/announcements/route.ts` — accepts optional `type`/`status`
  (defaults preserve old behavior: `announcement`/`published`).
- `src/app/api/emergency/route.ts` — accepts optional `category`
  (defaults to `other`).

### App shell, responsive, PWA, accessibility
- `src/components/app-shell.tsx` — skip-to-content link, `aria-current="page"`
  on active nav, Profile link, `#main-content` landmark wrapper.
- `public/sw.js` — network-first navigations with cache fallback, stale-while-
  revalidate for static assets, never caches `/api/`.
- `src/components/service-worker-register.tsx` — registers the SW outside
  localhost; mounted in `src/app/layout.tsx`.
- `src/app/globals.css` — additive only: document status badge colors, filter
  chips, search box, selected rows, type tags, emergency announcement styling,
  QR/verify mini panel, category sections, skip link, `:focus-visible` outline.
- `manifest.webmanifest` already existed; shortcuts left intact.

## Verification
- `npm run check` (lint + typecheck + build) is the gate. Run it before commit.
- Supabase connectivity audit (2026-09-24, see `docs/PROMPT_LOG.md` prompt 5):
  - Project **online**: REST 443 reachable; GoTrue health HTTP 200; PostgREST answering.
  - Schema **empty**: all tables missing (`PGRST205`) — migrations `001` + `002`
    not applied; storage buckets `[]`.
  - Direct DB **unreachable** from this machine (IPv6-only host, no local IPv6
    route, no `psql`, no Supabase CLI) — apply both migrations in the
    Supabase Dashboard SQL editor, in order.
  - App **not wired**: every route uses the in-memory demo store;
    `src/lib/supabase/*` clients are defined but unused. Local `.env` now also
    defines `NEXT_PUBLIC_SUPABASE_ANON_KEY` (alias of the publishable key) so
    `supabaseConfigured` can become true once wiring starts.

## Blocked / remaining (not attempted)
- Full Supabase wiring of the demo store (Phase 14 approval gate): touches
  Developer 1's shared auth and API routes and cannot be verified here.
- Applying migrations requires dashboard access (no access token available).

## Conflict rules observed
- `src/lib/auth.ts`, `src/lib/demo-store.ts`, concern/impact admin pages, and
  existing API contracts were not modified (only additive route behavior).
- No `git reset` / `clean` / force push; no `.env*` committed.
