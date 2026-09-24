# Developer handoff

## Start locally

```bash
npm install
npm run dev
```

Use `http://localhost:3000`. The local demo adapter resets whenever the server restarts. Use `resident@one.local` / `demo-resident` for resident testing or `admin@one.local` / `demo-admin` for operations testing. New resident registration requires Terms and Privacy acceptance.

## Required pre-commit check

```bash
npm run check
```

This runs ESLint, generates Next route types, performs TypeScript checking, and builds the production route graph.

## Route ownership

| Area | Routes |
| --- | --- |
| Public | `/`, `/login`, `/register`, `/install`, `/admin/login`, `/verify/[reference]` |
| Resident | `/app`, `/app/report`, `/app/activity`, `/app/concerns/[reference]`, `/app/documents`, `/app/documents/[reference]`, `/app/announcements`, `/app/emergency` |
| Admin | `/admin`, `/admin/concerns`, `/admin/concerns/[reference]`, `/admin/documents`, `/admin/impact`, `/admin/content`, `/admin/settings` |
| API | `/api/auth/*`, `/api/concerns/*`, `/api/documents/*`, `/api/announcements`, `/api/emergency`, `/api/impact` |

Resident and admin layouts enforce their role boundaries. Put a public route outside those protected layout trees; `/admin/login` is intentionally hosted through the `(public)` route group.

## Before production

- Replace the explicit in-memory demo adapter with the supplied Supabase server/browser clients.
- Apply `supabase/migrations/001_one_schema.sql`, validate RLS with resident/admin fixtures, and configure private Storage.
- Add production credentials only through deployment environment variables; never commit `.env.local`.
- Test the installed PWA on real iOS and Android hardware, especially the safe-area header, input keyboard behavior, install icon, and theme color.
- The Tankulan satellite tiles are supplied by Esri at runtime. Confirm pan, zoom, pin placement, imagery availability, and browser geolocation permission on a real phone before deployment.
