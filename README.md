# ONE — Community Services & Development Platform

ONE is a location-neutral civic service desk for the loop **Report → Track → Respond → Resolve → Measure**.

It gives residents a private workspace for concerns and document requests, and gives operations teams a role-gated workspace for review, assignment, resolution evidence, auditability, and measurable SDG outcomes.

## Current implementation

- Next.js 16 App Router, React 19, TypeScript, `next/font` Inter, Lucide React, Zod, and Framer Motion for reduced-motion-aware interface transitions.
- Resident and admin workflows are implemented as route handlers backed by an explicit in-process demo store so the complete golden demo runs without external credentials.
- `supabase/migrations/001_one_schema.sql` defines the production PostgreSQL entities, RLS foundation, role function, and ownership policies.
- Supabase packages and environment variables are included as the production integration boundary; the adapter should be enabled before deploying a multi-instance production environment.
- No reference-application logos, seals, names, or location-specific assets are used.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The local demo mode uses:

- Resident: `/login` with `resident@one.local` / `demo-resident`, or create a new resident account at `/register` using an unused email, a password of at least eight characters, and the required policy agreement.
- Admin: `/admin/login` with `admin@one.local` / `demo-admin`.

The demo store is process-local and resets when the server restarts. It is intentionally not a substitute for production persistence.

## Resident location and PWA testing

- Concern reporting includes a satellite location picker centered on Kihare, Tankulan, Manolo Fortich. It needs an internet connection for imagery; residents can still provide a landmark or use browser geolocation.
- Open `/install` to test the PWA installation experience. Chromium browsers use the native install prompt when available; iPhone and iPad receive Safari Add to Home Screen instructions.
- The minimal service worker intentionally keeps the app online-first. It enables installation without introducing unverified offline data synchronization.

## Production configuration

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_ORGANIZATION_NAME=ONE Community Services
NEXT_PUBLIC_ORGANIZATION_REGION=Your community
```

Run the migration in Supabase before wiring production persistence:

```text
supabase/migrations/001_one_schema.sql
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. The production adapter must use Supabase Auth for sessions, Storage for evidence, server-side role checks, and the RLS policies supplied in the migration.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## UI behavior

- Forms use browser constraints for common input mistakes and server-side validation remains the source of truth.
- Resident pages provide loading boundaries, visible return paths, keyboard focus states, and high-contrast input, card, and status treatments.
- Motion is intentionally restrained: page entry, metric/action-card feedback, and loading indicators honor the operating system's reduced-motion preference.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Workflows](docs/WORKFLOWS.md)
- [Security and data boundary](docs/SECURITY.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Branding and PWA assets](docs/BRANDING.md)
- [Developer handoff](docs/DEVELOPER_HANDOFF.md)
