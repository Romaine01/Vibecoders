# Security and data boundary

## Enforced in the current demo path

- Resident and admin roles are distinct; public registration always creates a resident.
- Admin mutations require an admin session in the route handler.
- Resident concern and document reads are filtered by resident ownership.
- Concern transitions are validated against the current status.
- Resolution requires an action and resolution notes.
- Evidence accepts images only and rejects files over 5 MB.
- Public verification returns safe document metadata only.
- Service-role credentials are not referenced in client components.

## Production requirements before deployment

The local demo store is process-local and should not be deployed as production persistence. Before production rollout:

- Replace demo sessions with Supabase Auth cookies.
- Replace in-process reads/writes with Supabase server-side queries.
- Run the migration and verify RLS policies in a non-production project.
- Put resident and completion evidence in a private Storage bucket with owner/admin policies.
- Apply the migration's `concern-evidence` bucket policies and keep object paths rooted by resident id.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and use it only for carefully scoped service operations.
- Add rate limiting, content moderation / abuse handling, and structured error monitoring at the deployment edge.
- Validate the admin bootstrap process; there is no public admin registration.

The migration includes ownership policies for profiles, concerns, concern updates, documents, audit logs, and impact records. Treat the migration as the source of truth for production authorization and test it with resident and admin fixtures before enabling external access.
