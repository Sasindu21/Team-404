import { NextRequest, NextResponse } from "next/server";
import { analyzeRoute, haversineMeters, pathLengthKm, schematicRoutes } from "@/lib/geometry";
import { DEMO_HAZARDS } from "@/lib/data";
import type { LatLng, RouteChoice, RoutePriority, RoutesResponse } from "@/lib/types";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getOrsAvoidanceRoute, osrmProvider } from "@/lib/routing-service";

export const dynamic = "force-dynamic";
function parsePoint(raw: string | null): LatLng | null {
  const numbers = raw?.split(",").map(Number);
  if (!numbers || numbers.length !== 2 || numbers.some(v => !Number.isFinite(v))) return null;
  const [lat,lon] = numbers;
  return lat>=5.7 && lat<=9.9 && lon>=79.4 && lon<=82.1 ? [lat,lon] : null;
}
function makeChoice(id: string, name: string, points: LatLng[], distanceKm: number, durationMin: number, source: RouteChoice["source"], bufferM = 0): RouteChoice {
  return { id, name, points, distanceKm: Math.round(distanceKm*10)/10, durationMin: Math.ceil(durationMin), source, ...analyzeRoute(points,DEMO_HAZARDS,bufferM) };
}
function rankRoutes(routes: RouteChoice[], priority: RoutePriority): RouteChoice[] {
  return routes.sort((a,b)=>priority==="fastest"
    ? a.durationMin-b.durationMin || a.score-b.score
    : priority==="shortest"
      ? a.distanceKm-b.distanceKm || a.durationMin-b.durationMin
    : priority==="lowest-overlap"
      ? a.score-b.score || a.durationMin-b.durationMin
      : (a.score*2+a.durationMin)-(b.score*2+b.durationMin));
}
async function fetchOSRM(start: LatLng, end: LatLng, bufferM: number): Promise<RouteChoice[]> {
  const routes=await osrmProvider.getRoutes(start,end);
  return routes.map((route,index)=>makeChoice(`osrm-${index}`,index===0?"Fastest available route":`Alternative route ${index+1}`,route.points,route.distanceKm,route.durationMin,"osrm",bufferM));
}
async function fetchAvoidance(start: LatLng, end: LatLng, bufferM: number): Promise<RouteChoice | null> {
  const route=await getOrsAvoidanceRoute(start,end,bufferM);
  return route?makeChoice("ors-avoid","Hazard-avoiding candidate",route.points,route.distanceKm,route.durationMin,"ors",bufferM):null;
}
export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request, "routes", 12, 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many route requests. Try again shortly." }, {
      status: 429,
      headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" }
    });
  }
  const {searchParams}=new URL(request.url), start=parsePoint(searchParams.get("from")),end=parsePoint(searchParams.get("to"));
  if(!start || !end) return NextResponse.json({error:"Choose valid Sri Lankan coordinates for both points."},{status:400,headers:rateLimitHeaders(rate)});
  if(haversineMeters(start,end)<100) return NextResponse.json({error:"Start and destination should be at least 100 m apart."},{status:400,headers:rateLimitHeaders(rate)});
  const demo=searchParams.get("demo")==="1";
  const priority:RoutePriority=["balanced","lowest-overlap","fastest","shortest"].includes(searchParams.get("priority")||"") ? searchParams.get("priority") as RoutePriority : "balanced";
  const bufferM=Math.min(3000,Math.max(0,Number(searchParams.get("buffer"))||0));
  const candidateLimit=Math.min(3,Math.max(1,Math.trunc(Number(searchParams.get("limit"))||3)));
  const avoidDemo=searchParams.get("avoidDemo")==="1";
  if(demo) {
    const routes=schematicRoutes(start,end).map((points,i)=>{
      const km=pathLengthKm(points);
      return makeChoice(`demo-${i}`,i===0?"Direct schematic":"Alternative schematic",points,km,km/35*60,"schematic",bufferM);
    });
    const payload: RoutesResponse={ routes:rankRoutes(routes,priority).slice(0,candidateLimit),source:"schematic",avoidanceAttempted:false,message:`FICTIONAL SCHEMATIC ROUTES — not real roads, not suitable for navigation. Ranking: ${priority}; demo-zone buffer: ${bufferM} m.` };
    return NextResponse.json(payload,{headers:rateLimitHeaders(rate)});
  }
  try {
    const base=await fetchOSRM(start,end,bufferM);
    let avoidanceAttempted=false;
    let avoidanceMessage="";
    if(process.env.ORS_API_KEY && avoidDemo) {
      avoidanceAttempted=true;
      try {
        const safer=await fetchAvoidance(start,end,bufferM);
        if(safer) base.push(safer);
        else avoidanceMessage=" Optional ORS candidate was unavailable; only OSRM routes are shown.";
      } catch(error) {
        console.error("Optional ORS route avoidance failed", error);
        avoidanceMessage=" Optional ORS request failed; only OSRM routes are shown.";
      }
    }
    const unique=base.filter((r,i,all)=>all.findIndex(a=>a.source===r.source && a.id===r.id)===i);
    const payload:RoutesResponse={routes:rankRoutes(unique,priority).slice(0,candidateLimit),source:"osrm",avoidanceAttempted,message:`Road geometries from OSRM${avoidanceAttempted?" and optional ORS":""}. Ranking: ${priority}; demo-zone buffer: ${bufferM} m. Hazard scores use FICTIONAL DEMO zones only. Unverified for real travel.${avoidanceMessage}`};
    return NextResponse.json(payload,{headers:rateLimitHeaders(rate)});
  } catch(error) {
    console.error("Live routing provider failed; returning schematic fallback", error);
    const routes=schematicRoutes(start,end).map((points,i)=>{
      const km=pathLengthKm(points);
      return makeChoice(`fallback-${i}`,i===0?"Schematic fallback":"Alternative schematic fallback",points,km,km/35*60,"schematic",bufferM);
    });
    const payload:RoutesResponse={
      routes:rankRoutes(routes,priority).slice(0,candidateLimit),
      source:"schematic",
      avoidanceAttempted:false,
      message:"LIVE ROUTING IS UNAVAILABLE. Showing fictional schematic lines only; these are not roads and must not be used for navigation."
    };
    return NextResponse.json(payload,{headers:rateLimitHeaders(rate)});
  }
}
