# SafeRoute Sri Lanka — Hackathon submission notes

**Tagline:** Stay alert. Plan smarter. Travel safer.

## Problem

During severe weather or natural disasters, people need accurate official warnings and clear explanations to help plan travel. Generic routing and disaster-warning information are often viewed separately.

## Solution

A responsive web prototype which compares route alternatives, fetches official Sri Lankan government weather bulletins, and explains sample route hazard intersections. Its AI assistant responds to route/warning context when configured with Gemini API credentials. The prototype uses explicitly fictional hazard locations and is not a live emergency safety system.

## Main technologies

Next.js, React, TypeScript, Leaflet, OpenStreetMap, OSRM, optional OpenRouteService, Gemini REST API, fast-xml-parser.

## Judges' 90-second live demo

1. Show map and multiple Sri Lankan places (15 sec).
2. Select Colombo Fort → Nugegoda and calculate actual OSRM alternatives (20 sec). If unavailable, use schematic mode **and openly explain it is illustrative**.
3. Point at the sample hazard circles and route overlap results (20 sec).
4. Open official government warning feed, explain source links and timestamps (15 sec).
5. Ask Gemini to explain route context and its limitations (20 sec).

## Limitations

All hazard circles are invented for demos. Government weather warnings are shown only as sourced bulletin text, not projected onto streets. No claim of safety, real-time rescue guidance, or production-grade routing is made.

## Ethical contribution statement

Declare any AI code generation, verify third-party licenses and demonstrate your team's code comprehension and modifications. Develop the competing project's core functionality inside the official hackathon period as required.
