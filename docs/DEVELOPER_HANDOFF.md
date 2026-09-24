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

## UI conventions

- Keep control text and placeholder text readable against white card surfaces; preserve the shared input focus, invalid, and disabled states in `src/app/globals.css`.
- Use the existing `PageReveal` component for a route-level entrance only when it improves orientation. Do not add motion that obscures submissions, error messages, or navigation; the component respects reduced-motion settings.
- Resident sections include route loading boundaries. Keep mutations visibly pending and always return the control to an enabled state when a network request fails.

## Route ownership

| Area | Routes |
| --- | --- |
| Public | `/`, `/login`, `/register`, `/install`, `/admin/login`, `/verify/[reference]` |
| Resident | `/app`, `/app/report`, `/app/activity`, `/app/concerns/[reference]`, `/app/documents`, `/app/documents/[reference]`, `/app/announcements`, `/app/emergency` |
| Admin | `/admin`, `/admin/concerns`, `/admin/concerns/[reference]`, `/admin/documents`, `/admin/impact`, `/admin/content`, `/admin/settings` |
| API | `/api/auth/*`, `/api/concerns/*`, `/api/documents/*`, `/api/announcements`, `/api/emergency`, `/api/impact` |

Resident and admin layouts enforce their role boundaries. Put a public route outside those protected layout trees; `/admin/login` is intentionally hosted through the `(public)` route group.

## Before production

- Supabase Auth is wired behind `supabaseConfigured`; set the public URL/key and apply the profile trigger migration to use real sessions and profile creation. The concern/document data adapter remains process-local until the supplied server-side Supabase queries are enabled.
- If a serverless demo deployment must use the fallback accounts, set `ONE_SESSION_SECRET`; fallback sessions are signed so navigation continues across instances, but the demo store still resets and is not production persistence.
- A fallback registration also sets `one_demo_account`, a signed HttpOnly cookie with a salted password hash. It allows that browser to sign in again for seven days even when another serverless instance handles the request. Do not present this as a durable account or a substitute for Supabase Auth.
- Apply `supabase/migrations/` in timestamp order, validate RLS with resident/admin fixtures, and configure private Storage.
- Add production credentials only through deployment environment variables; never commit `.env.local`.
- Test the installed PWA on real iOS and Android hardware, especially the safe-area header, input keyboard behavior, install icon, and theme color.
- The Tankulan satellite tiles are supplied by Esri at runtime. Confirm pan, zoom, pin placement, imagery availability, and browser geolocation permission on a real phone before deployment.
