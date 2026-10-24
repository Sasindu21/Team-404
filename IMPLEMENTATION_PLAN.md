# SafeRoute Sri Lanka 2.0 — Implementation Plan

Last reviewed: 24 October 2026

This document is a living engineering plan. A checked item means working code exists in this repository; it does not imply that an external provider is available or that the prototype is suitable for emergency use.

## Current project assessment

The application root is this `saferoute-srilanka` directory. It is a Next.js 15 App Router project using React 19, TypeScript, Leaflet, Vitest, and server-side API handlers. A dedicated public landing page leads to the responsive `/dashboard` workspace and shared secondary-page shell. The application separates official bulletin text, public routing results, community-reported observations, and fictional demonstration hazards.

There is currently no database, authentication provider, role system, file storage, service worker, admin authorization layer, or production notification service. Those features must not be represented as complete until their infrastructure and permission checks exist.

## Existing features

- [x] Responsive route and warning dashboard
- [x] Leaflet/OpenStreetMap map with map-point selection
- [x] OSRM driving routes and explicit schematic fallback
- [x] Optional ORS request around fictional demonstration polygons
- [x] Route overlap geometry and configurable demonstration buffer
- [x] Route ranking and candidate-count controls
- [x] Device-local saved journeys and GeoJSON export
- [x] Department of Meteorology RSS adapter with validation and six-hour process-local stale cache
- [x] Gemini assistant endpoint with server-only secret, timeout, input bounds, and rate limiting
- [x] Clearly identified deterministic guidance when Gemini is not configured
- [x] Browser-session bulletin notifications with explicit permission
- [x] Sri Lanka-bounded location autocomplete and consent-based current location
- [x] Guest community-report form with validation, map selection, and explicit unverified status
- [x] Emergency center with official DMC contact attribution and private location tools
- [x] Device-local settings, saved-route management, and in-app notification history
- [x] Installable web-app manifest and honest offline-information page
- [x] Credential-ready Supabase SSR authentication flows, profile page, middleware session refresh, and RLS migration
- [x] TypeScript checks, Vitest coverage, production build, security headers

## Missing or incomplete features

- [x] Separate public landing page and shared multi-page application shell
- [ ] Complete English, Sinhala, and Tamil translation dictionaries
- [ ] Verified geospatial warning polygons and road-closure providers
- [ ] Server-side community report persistence, image storage, moderation, and expiration
- [x] Supabase profile schema migration and row-level security policies
- [x] Email/password registration, login, verification callback, recovery, profile and logout implementation (external verification requires configured Supabase)
- [x] Server-enforced profile protection and administrator role check
- [ ] Saved-route/report database migrations, PostGIS, backup policy, and configured staging verification
- [ ] Admin pages backed by authorized database queries
- [ ] Server-persistent notification inbox and deduplicated event processor
- [ ] Service worker and cached offline application shell
- [ ] Playwright browser and accessibility test suite

## Bugs and technical debt

- `app/page.tsx` is large and should be decomposed into domain components.
- Rate limiting and warning cache are process-local and unsuitable for multi-instance enforcement.
- Saved journeys are browser-local, have no account sync, and should not be treated as durable storage.
- OSRM's public demonstration server has no availability commitment.
- Official RSS items are textual; they are not safe inputs for street-level geospatial inference.
- The current language switch covers only key labels and is not full internationalization.
- No runtime environment-schema validation is installed; configuration is checked at point of use.

## Proposed architecture

1. Keep Next.js App Router as the web and API boundary.
2. Extract `services/routing`, `services/warnings`, and `services/ai` provider interfaces.
3. Add reusable shell and domain components before splitting routes.
4. Use Supabase Auth and PostgreSQL/PostGIS only after project credentials exist.
5. Enforce roles and ownership in server code and database row-level security.
6. Store images in restricted object storage with validated MIME type, size, randomized name, and moderation status.
7. Use a shared rate-limit/cache store for production deployments.
8. Preserve the explicit `official`, `community`, `demo`, `historical`, and `unavailable` trust states in every data model.

See `ARCHITECTURE.md` for boundaries and data flow.

## Implementation phases and progress

### Phase 1 — Foundation

- [x] Identify application root and audit existing code
- [x] Repair route-state, map-selection, dependency, and CSS-cache issues
- [x] Add baseline HTTP security headers and reproducible lockfile
- [x] Extract reusable dashboard component and shared secondary-page shell
- [ ] Consolidate remaining dashboard CSS into shared design tokens

### Phase 2 — Professional frontend

- [x] Responsive dashboard and functional navigation within the page
- [x] Loading, empty, unavailable, and toast states
- [x] Dedicated landing and dashboard routes
- [x] Persistent light/dark/system theme foundation
- [x] Persistent collapsible desktop dashboard navigation
- [x] Skip navigation, visible focus indicators, semantic current-page state, and labelled navigation controls
- [ ] Complete keyboard and screen-reader audit with browser automation

### Phase 3 — Mapping and routing

- [x] Map selection, alternatives, selection, ranking, saved journeys, export
- [x] Rate-limited Sri Lanka geocoding adapter and consent-based current location
- [x] Reusable typed OSRM/ORS routing service boundary
- [x] Shortest-distance ranking among provider-returned alternatives, with an explicit provider limitation label

### Phase 4 — Hazard intelligence

- [x] Transparent fictional circle-intersection algorithm
- [x] Official text bulletin adapter
- [ ] Verified geospatial source adapters, filters, clustering, freshness model, evidence-based scoring

### Phase 5 — Gemini AI

- [x] Contextual non-streaming assistant with safe system instructions
- [ ] Streaming, authenticated history, structured source citations, expanded injection tests

### Phases 6–8 — Community, accounts, admin

- [x] Supabase SSR auth clients, middleware refresh, validated auth actions, profile RLS, and secure admin provisioning procedure
- [ ] Apply migration and verify email/OAuth flows against a configured Supabase staging project
- [ ] Persist saved routes/reports and implement authorized moderation/admin interfaces

### Phase 9 — Product completion

- [x] Theme persistence and installable web-app manifest
- [ ] Full i18n, service-worker offline shell, accessibility and performance audit

### Phase 10 — Verification

- [x] Unit/integration tests, TypeScript checks, production build
- [ ] Browser automation, mobile device matrix, configured-provider staging tests

## Testing requirements

Every phase must keep these commands green:

```bash
npm run lint
npm test
npm run build
```

Provider tests must mock network requests. Database work must add authorization, ownership, validation, and migration tests. Browser-facing phases should add Playwright coverage before being marked complete. See `TESTING.md`.

## External services and configuration

| Service | Purpose | Required now | Configuration |
|---|---|---:|---|
| OpenStreetMap tiles | Basemap | Yes, network | No key; attribution required |
| OSRM demo | Best-effort routes | No | No key; not production infrastructure |
| OpenRouteService | Optional demo-polygon avoidance | No | `ORS_API_KEY` |
| Department of Meteorology | Official RSS bulletin text | No | Public feed availability |
| Gemini | AI explanation | No | `GEMINI_API_KEY`, optional `GEMINI_MODEL` |
| Supabase | Auth, profiles, future database/storage | No | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`; migration and provider setup required |

No external service should be shown as connected solely because an environment variable exists; successful responses and freshness must also be reported.
