# Architecture

## Current runtime

```text
Browser
  ├─ Next.js client dashboard
  │   ├─ dynamically loaded React-Leaflet map
  │   ├─ device-local saved journeys
  │   └─ permission-based, foreground bulletin notifications
  └─ Next.js route handlers
      ├─ GET /api/routes ── OSRM; optional ORS; explicit schematic fallback
      ├─ GET /api/alerts ── official Department of Meteorology RSS
      ├─ POST /api/assistant ── Gemini when configured
      └─ GET /api/status ── configuration booleans only
```

Secrets stay in server route handlers. No database or authentication layer currently exists.

## Trust model

SafeRoute must preserve these distinct states:

| State | Meaning | Current example |
|---|---|---|
| Official/verified source | Directly received from an identified authority | Meteorology RSS text |
| Community reported | User claim, not official | Guest reports are validated and stored only on the submitting device; no public ingestion or moderation backend is configured |
| Historical | Past observation retained for context | Planned, not implemented |
| Demonstration | Fictional hackathon data | Four map circles and schematic routes |
| Unavailable | No reliable current result | Feed/provider failure state |

An absence of evidence must never be converted into a “safe” status.

## Current modules

- `app/page.tsx`: dashboard orchestration and browser state.
- `components/MapView.tsx`: client-only Leaflet map.
- `app/api/*`: public server endpoints and provider calls.
- `lib/geometry.ts`: deterministic distance, intersection, route length, and demo polygon logic.
- `lib/rate-limit.ts`: process-local fixed-window protection.
- `lib/data.ts`: built-in places, fictional hazards, and official links.
- `lib/types.ts`: shared transport/domain types.

## Target boundaries

Future implementation should introduce:

```text
app routes and shared UI
        │
domain services (routing, hazards, reports, notifications)
        │
provider adapters (OSRM, ORS, official feeds, Gemini)
        │
repositories (PostgreSQL/PostGIS and object storage)
        │
authentication + authorization + audit logging
```

Provider payloads should be converted into internal typed models at the adapter boundary. UI components should not interpret raw provider objects.

## Proposed database domains

When Supabase is configured, migrations should add profiles/preferences, saved routes/history, hazard sources/warnings, community reports/evidence, emergency locations, notifications/subscriptions, AI conversations, moderation actions, and audit logs. Spatial records should use PostGIS geometry with appropriate GiST indexes. Row-level security must deny access by default and explicitly grant owner/admin operations.

No database migrations currently exist. Adding schema files alone does not make authentication, moderation, or persistence functional.

## Security boundaries

- API keys: environment variables read only on the server.
- API input: bounded and validated before provider calls.
- Untrusted bulletin/report content: plain text; never executable instructions for AI.
- Location: selected coordinates are sent to routing providers, not currently persisted server-side.
- Rate limits/cache: current in-memory implementation is best-effort only.
- Admin operations: must not be added without server-side session and role checks.

## Deployment

The app can deploy to a Node-compatible Next.js host. Production deployment must replace public demo routing and process-local rate limits where service reliability or abuse prevention matters. External quotas, privacy terms, retention, monitoring, backups, and incident response remain deployment-owner responsibilities.
