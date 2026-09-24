# Architecture

## Application layers

```text
App Router pages
  ├─ public landing, sign-in, registration, verification
  ├─ resident workspace (`/app/*`)
  └─ operations workspace (`/admin/*`)

Route handlers (`src/app/api/*`)
  ├─ authentication and session cookie
  ├─ concern and document mutations
  ├─ content and emergency resources
  └─ impact and audit reads

Domain layer (`src/lib/*`)
  ├─ typed entities and category / SDG mappings
  ├─ Zod request validation
  ├─ demo repository with workflow invariants
  └─ Supabase migration / RLS contract
```

The user interface is mobile-first for residents and responsive for operations. Shared visual primitives live in `src/components/ui.tsx`; the shell, forms, detail timeline, and operations tools are separate components so workflow rules stay in route handlers rather than click-only UI.

## Domain model

The production migration defines:

- `organizations` and `profiles`
- `concerns`, `concern_updates`, and `concern_attachments`
- `document_types`, `document_requests`, and `document_updates`
- `announcements` and `emergency_contacts`
- `sdg_goals`, `sdg_mappings`, and `impact_records`
- `audit_logs`

The local demo store mirrors these conceptual entities in memory. It records each concern transition, creates audit entries for admin mutations, and creates one impact record per mapped SDG only when a concern is resolved with documented action.

## Route map

| Route | Purpose |
| --- | --- |
| `/` | Public product overview |
| `/login`, `/register` | Resident authentication |
| `/admin/login` | Admin authentication |
| `/app` | Resident home |
| `/app/report` | Multi-step concern form |
| `/app/activity`, `/app/concerns/[reference]` | Resident activity and tracking |
| `/app/documents` | Document request and tracking |
| `/app/announcements`, `/app/emergency` | Resident information surfaces |
| `/admin` | Operations overview |
| `/admin/concerns`, `/admin/concerns/[reference]` | Queue and resolution workflow |
| `/admin/documents` | Document processing workflow |
| `/admin/impact` | Community and SDG metrics |
| `/admin/content` | Announcements and emergency contacts |
| `/verify/[reference]` | Safe public document verification |

## Design decisions

- Inter is loaded through `next/font/google` with `display: swap`.
- Deep navy, neutral surfaces, teal interaction color, and restrained borders/shadows create a civic-operations tone without reference branding.
- Motion is limited to press feedback, focus states, and small hover lifts. Reduced-motion CSS removes movement-heavy transitions.
- The browser Geolocation API is optional; manual location text remains available.
- Evidence is constrained to images and 5 MB per file in the demo handler. Production must map the same validation to a private Supabase Storage bucket.
- `src/lib/supabase/server.ts` and `src/lib/supabase/browser.ts` provide the cookie-aware Supabase client boundary for the production adapter; they fail closed when the required public URL/key are absent.
