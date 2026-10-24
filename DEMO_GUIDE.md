# Hackathon Demo Guide

## Preparation

```powershell
cd C:\Users\sasin\Downloads\saferoute-srilanka-full-source\saferoute-srilanka
npm install
Copy-Item .env.example .env.local
npm run dev
```

Add a personal `GEMINI_API_KEY` only if the AI portion will be demonstrated. Keep a second browser tab open to the official Department of Meteorology or DMC site. Test external services shortly before presenting.

## Recommended 3-minute walkthrough

1. Start with the transparency banner: this is a prototype, and colored hazard circles are fictional.
2. Choose Colombo Fort to Nugegoda and request routes.
3. Compare candidates and demonstrate balanced, fastest, and lowest-demo-overlap ranking.
4. Change the demo-zone buffer and explain that this is geometry testing, not verified risk prediction.
5. Save the journey locally, copy its summary, or export GeoJSON.
6. Open official bulletins and show source links, checked time, and live/stale/unavailable status.
7. If Gemini is configured, ask why the first candidate was ranked first. Point out that the response separates fictional map zones from official bulletin text.
8. Finish with official emergency links and the product limitations.

## Offline/provider-failure path

Enable **Use offline schematic example**. State clearly that these lines are illustrative, not road directions. If the warning feed is unavailable, show the unavailable message and official links; do not say there are no warnings.

## Claims to avoid

- “This is the safest route.”
- “There are no hazards.”
- “The map shows live flooding.”
- “Notifications work in the background.”
- “Community reports are verified.”
- “The application has user accounts or an admin backend.”

## Judge questions

- **What is original?** The transparent demonstration-risk geometry, provider orchestration, failure-state design, and safe AI context handling.
- **What is live?** OSRM/ORS responses when available, official RSS text, and Gemini only when configured.
- **What is fictional?** The colored hazard circles and schematic routes.
- **What is next?** Verified geospatial adapters, authenticated database-backed reporting, moderation, notification inbox, full i18n, and PWA support.

## Resetting the demo

Refresh the page to reset transient route/chat state. Saved journeys use browser local storage and can be removed using their trash buttons. Restarting the Next.js process clears its in-memory rate-limit and stale-feed caches.
