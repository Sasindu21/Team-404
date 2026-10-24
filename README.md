# SafeRoute Sri Lanka 🇱🇰

> SafeRoute Sri Lanka 2.0 is being implemented incrementally. See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for the verified progress checklist, [`ARCHITECTURE.md`](ARCHITECTURE.md) for system boundaries, and [`DEMO_GUIDE.md`](DEMO_GUIDE.md) for an honest demonstration flow.

**Disaster-aware route intelligence · AI-assisted interpretation · transparent demo hazards**

Open-source Hack for Humanity demonstration web application. Users can compare driving routes, explore clearly labeled **fictional** hazard circles, read weather bulletin titles from an **official government RSS feed**, and get AI-assisted explanations when a personal Gemini API key is configured.

> ⚠️ **Important:** This is a hackathon prototype, **not** an emergency/navigation service. The four map hazard zones are **invented test data**, not official active warnings. Do not decide whether to travel using this demo. The official RSS bulletins are shown **as text only**, not turned into verified street-level risk predictions. A route with no demo overlaps **is not necessarily safe**.

## Features

- Responsive, professional English/Sinhala dashboard
- Interactive OpenStreetMap/Leaflet map with clickable start/destination location selection
- 12 built-in Sri Lanka places; swap origin/destination
- Real driving route alternatives via public OSRM *demo* service (internet needed, best-effort service)
- Explicit **schematic mode** for an offline, non-navigable route illustration
- Transparent geometry-based sample hazard/route overlap scoring (custom original logic)
- Advanced route controls for balanced/fastest/lowest-overlap ranking, configurable demo-zone buffers, candidate limits, and opt-in ORS avoidance
- Optional openrouteservice route that tries to avoid **fictional** sample hazard polygons (`ORS_API_KEY`)
- Official Department of Meteorology RSS feed displayed as text with timestamps and source links
- Clearly marked cached snapshot when the live bulletin feed is temporarily unavailable
- Opt-in browser notifications for newly published bulletins while the dashboard remains open
- Clearly labeled schematic fallback when live routing is unavailable
- Best-effort per-process rate limits on alerts, routes and assistant APIs
- Distinguishes missing official warning data from a true empty RSS feed
- Real Gemini AI route/warning assistant *when configured* (`GEMINI_API_KEY`)
- Clear fallback guidance mode (rule-based, **not** labelled AI) if no API key
- Public resource links, testing, TypeScript checks and deployable Next.js app

## Required runtime

- Node.js 20.9+ (Node 22 LTS recommended)
- npm
- Internet connection for OSM tiles, real routing, government warning feed, Gemini
- **No keys required** to explore dashboard and schematic examples; **a Gemini API key is required** to demonstrate the mandatory hackathon AI feature.

## Local quick start — Windows PowerShell

```powershell
cd saferoute-srilanka
npm install
Copy-Item .env.example .env.local
notepad .env.local
npm run dev
```

Open **http://localhost:3000**.

For Mac/Linux: `cp .env.example .env.local`.

Add your own Gemini key to `.env.local`:

```env
GEMINI_API_KEY=YOUR_PERSONAL_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
ORS_API_KEY=
```

- Create an API key through Google AI Studio: https://aistudio.google.com/apikey
- Add ORS key only if you want optional avoidance: https://openrouteservice.org/
- Never share `.env.local` or commit secrets to GitHub.
- Restart `npm run dev` after updating environment variables.
- External services have quotas, terms and availability limits. Gemini model selection may change; set `GEMINI_MODEL` to an enabled model if necessary.

## Demonstration flow

1. Open the dashboard. **Notice that all colored map hazard zones say DEMO.**
2. Choose Colombo Fort → Nugegoda, then click **Find possible routes**.
3. With internet: OSRM road alternatives are returned, if the service offers them. Without internet, switch on **Use offline schematic example** and try again. Schematic paths are straight-ish illustrative line segments **not drivable routes**.
4. Click a route card; the selected path is highlighted. Read overlap count and its fictional nature.
5. Check **Official weather bulletins**; if the feed is unreachable, the app explains this instead of claiming there is no risk.
6. With a Gemini API key configured, ask the AI why a route was ranked first. AI knows the route facts and official RSS headlines, and is instructed not to invent hazards.
7. Show architecture/logic, test results, source attribution and open-source license to judges.

## Architecture

```text
browser / Next.js dashboard
    ├── Leaflet map + local fictional hazard data
    ├── GET /api/routes ── OSRM demo route service
    │                └──── optional ORS avoid_polygons request
    ├── GET /api/alerts ── Department of Meteorology RSS XML
    ├── GET /api/status ── configuration flag only (never keys)
    └── POST /api/assistant ── server-only Gemini API
```

Custom route-risk algorithm `lib/geometry.ts` calculates distance from a route line segment to a fictional circular zone (local equirectangular approximation). A score is used only to rank **illustrative overlap**, not to predict real danger. No personal location or messages are persisted in a database; locations are sent to routing services for lookup.

## API endpoints

- `GET /api/status`: `{ aiConfigured, orsConfigured }` (booleans only)
- `GET /api/alerts`: `{ status: 'live'|'stale'|'unavailable', checkedAt, lastUpdatedAt?, alerts, message }`
- `GET /api/routes?from=6.9344,79.8428&to=6.8649,79.8997&demo=0`
- `GET /api/routes?...&demo=1`: clearly labeled non-road schematic
- Route options: `priority=balanced|lowest-overlap|fastest|shortest`, `buffer=0..3000` metres, `limit=1..3`, and `avoidDemo=0|1`. `shortest` ranks only alternatives returned by the provider; it does not request a dedicated shortest-path profile.
- `POST /api/assistant`: `{ question, context, language: 'en'|'si' }` (requires Gemini key)

## Test, typecheck and build

```bash
npm run test
npm run lint
npm run build
```

## Deploy to Vercel

1. Create a **public GitHub repository** and push only project files (never node_modules, `.next`, `.env.local`).
2. In Vercel, import the GitHub repository as a Next.js project.
3. Add `GEMINI_API_KEY`, `GEMINI_MODEL` and optionally `ORS_API_KEY` in Vercel **Environment Variables**.
4. Deploy and test `/api/status`, `/api/alerts`, route search and AI chat on the live URL.
5. Submit the public GitHub URL and working demo URL through official MLH submission process.

## Responsible-AI / project limitations

- No verified machine-readable Sri Lankan road-closure or geospatial hazard dataset is configured. The app therefore does not map RSS warnings onto routes or claim route-specific official danger; check bulletin coverage and road information directly with authorities.
- The sample zone positions and radii are fictional, locally seeded and clearly tagged. Browser notifications are opt-in and require the page to remain open; they are not background push or an emergency alert service.
- The in-memory rate limiter is best-effort per server process and resets on restart or scale-out. Configure a platform WAF or shared rate-limit store before public production use.
- Cached RSS snapshots are labeled stale and shown for at most six hours after a successful fetch. Verify the original bulletin's current validity.
- Official RSS notices might not include machine-readable geographic boundaries or precise validity details. Read the source document for those facts.
- OSRM public demo is a shared service and can be unavailable or rate-limited; use responsibly. It may return only one route. ORS avoids sample polygons only when a key and a valid response exist.
- AI outputs can contain errors. Do not use this to decide whether to enter floodwater, damaged roads or restricted areas.
- Never upload API keys, sensitive personal information, copyrighted data without permission, or identifying coordinates of vulnerable persons.
- This software is for education/research/demo only and has no service-level commitment.

## Source attribution

- Sri Lanka Department of Meteorology, public warning feed and documentation: https://was.meteo.gov.lk/api-docs
- Sri Lanka Disaster Management Centre (DMC): https://www.dmc.gov.lk/
- OpenStreetMap contributors and tile attribution: https://www.openstreetmap.org/copyright
- Leaflet: https://leafletjs.com/
- OSRM routing engine / demo service: https://project-osrm.org/ and https://router.project-osrm.org/
- Optional ORS directions engine: https://openrouteservice.org/
- Gemini API: https://ai.google.dev/gemini-api/docs

## Original contribution & AI disclosure

Hackathon team should understand, customise and test all generated code before submitting. AI-assisted code generation was used in project scaffolding and initial implementation; disclose its use transparently to organisers. **Check the event's build-period restrictions**: core functionality must be developed during the officially authorized hacking window, not submitted as a previously completed project.

## Security notes

All API calls containing secrets run on the Next.js server. No credentials are intentionally shipped to browsers or tracked in Git. Best-effort process-local rate limits are enabled; use a shared store or platform WAF for production abuse protection. Do not use public OSRM/Nominatim demonstration infrastructure for sustained production traffic.

## License

MIT (see `LICENSE`).
