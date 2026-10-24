# API Integrations

## OSRM

- Purpose: road geometry, distance, duration, and provider-supplied alternatives.
- Configuration: none; current code uses the public demonstration server.
- Data sent: origin and destination coordinates.
- Failure: the UI receives explicitly labeled schematic lines.
- Limitation: the demo server is not a production SLA and may return one route.

## OpenRouteService

- Purpose: optional candidate that avoids fictional demonstration polygons.
- Configuration: `ORS_API_KEY` in `.env.local`.
- Activation: the user must enable the advanced avoidance option.
- Limits: provider quota, a distance guard, and provider availability apply. This does not avoid verified live hazards.

## Sri Lanka Department of Meteorology

- Feed: `https://was.meteo.gov.lk/cap/en/rss.xml`.
- Purpose: display official bulletin titles, descriptions, dates, and source links as text.
- Validation: XML validation, normalized text, official-host link allowlist, bounded item count.
- Cache: last successful response is retained in the current server process for up to six hours.
- Limitation: text items are not converted into street-level polygons or road safety conclusions.

## Gemini

- Purpose: concise explanation of selected route facts and official bulletin headlines.
- Configuration: `GEMINI_API_KEY`; `GEMINI_MODEL` defaults to `gemini-2.5-flash`.
- Protection: server-only request, input limits, timeout, rate limit, low temperature, safety-focused system instruction.
- Failure: a clear error is returned; the client does not disguise fixed guidance as AI.
- Limitation: responses may be wrong and are not official emergency instructions.

## OpenStreetMap

- Purpose: Leaflet basemap tiles.
- Requirement: network access and visible contributor attribution.
- Limitation: public tile usage policy applies; select a production tile provider for significant traffic.

## Planned integrations

Supabase Auth/PostgreSQL/Storage, a production routing service, geocoding, verified geospatial warnings, and durable notification delivery are not configured or implemented. Before adding a source, confirm its documented API, license, permissible caching, attribution, availability, and geographic precision. Restricted pages must not be scraped.

## Environment example

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
ORS_API_KEY=
```
