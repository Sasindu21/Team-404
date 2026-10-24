# Testing

## Commands

Run from the nested application directory:

```powershell
cd C:\Users\sasin\Downloads\saferoute-srilanka-full-source\saferoute-srilanka
npm install
npm run lint
npm test
npm run build
```

`npm run lint` currently executes `tsc --noEmit`. The project does not currently include ESLint or Playwright, so do not report those checks as passing.

## Current automated coverage

- Geometry: Haversine distance, circle intersection, identifiers, sensitivity buffer, schematic candidates.
- Routing endpoint: provider failure fallback and advanced route options.
- Alerts: RSS transformation, source handling, and failure states.
- Rate limiting: window reset, per-client separation, proxy chains.

External provider requests are mocked in tests where needed. Tests must never depend on an actual API key or live provider response.

## Manual checks

1. Confirm the stylesheet request under `/_next/static/css/` returns HTTP 200.
2. Check desktop and narrow mobile widths.
3. Select both endpoints from lists and the map.
4. Test live routing and explicit schematic mode separately.
5. Verify every demonstration label remains visible.
6. Select each advanced ranking/buffer option and verify old results clear.
7. Test official feed live, stale, empty, unavailable, and rate-limited messages.
8. Test Gemini configured and unconfigured states without exposing the key.
9. Verify keyboard focus and external-link behavior.

## Required future coverage

- Playwright navigation, responsive, theme, language, and accessibility flows.
- Community report validation, ownership, upload restrictions, moderation, and expiry.
- Authentication recovery and protected-route tests.
- Database row-level security tests for guest/user/admin roles.
- Notification deduplication and preference tests.
- AI prompt-injection and structured-context tests.

## Next.js cache note

Do not run `next build` against the same `.next` directory while `next dev` is running. Stop the development process first, build, then restart it. Mixing them can leave a running server referencing CSS assets that no longer exist.
