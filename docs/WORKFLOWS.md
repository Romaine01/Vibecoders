# Workflows

## Resident concern

1. Register or sign in.
2. Choose a category: infrastructure, waste, water/sanitation, environment, public safety, health/sanitation, disaster/emergency, or other.
3. Add a title, description, urgency, landmark, and optional browser coordinates.
4. Attach up to three image files under 5 MB each.
5. Review and submit.
6. The service generates `CON-YYYY-XXXX` and creates a `submitted` timeline entry.

## Admin concern lifecycle

The route handler validates each transition, not just the interface:

```text
submitted → received → assigned → in_progress → resolved
```

Each transition creates a `concern_update` equivalent and an `audit_log`. Assignment requires a responsible team/person. Resolution requires both `action_taken` and `resolution_notes`; optional completion evidence is image-validated.

On resolution, the category mapping creates impact records for the applicable SDGs. A submitted concern alone never contributes to impact.

## Documents

Residents submit one of the configured document types and receive `DOC-YYYY-XXXX`.

```text
submitted → under_review → processing → ready → released
```

The public `/verify/[reference]` route only exposes validity, reference, document type, issue date, and issuing organization. It does not expose resident name, email, or purpose.

## Golden demo

The full runnable path is:

1. Register a resident.
2. Report a waste concern titled “Garbage accumulating near a drainage canal”.
3. Sign in at `/admin/login`.
4. Receive, assign, start work, and resolve the concern with action and notes.
5. Open `/admin/impact` to see the resolution rate, waste outcome, SDG 11 + SDG 12 impact records, and audit entries.
6. Return to the resident activity detail to see the resolved timeline.

The route-handler checks used for this workflow use real HTTP calls against the production build, not mocked UI events.
