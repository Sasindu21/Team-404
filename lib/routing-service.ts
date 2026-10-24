import { DEMO_HAZARDS } from "./data";
import { circlePolygon, distanceToSegmentMeters, haversineMeters } from "./geometry";
import type { LatLng } from "./types";

export type RoutingProviderId="osrm"|"ors";
export interface ProviderRoute { provider:RoutingProviderId; points:LatLng[]; distanceKm:number; durationMin:number; }
export interface RoutingProvider { readonly id:RoutingProviderId; getRoutes(start:LatLng,end:LatLng):Promise<ProviderRoute[]>; }
function isCoordinate(value:unknown):value is [number,number]{return Array.isArray(value)&&value.length>=2&&typeof value[0]==="number"&&typeof value[1]==="number"&&Number.isFinite(value[0])&&Number.isFinite(value[1]);}

export const osrmProvider:RoutingProvider={id:"osrm",async getRoutes(start,end){
  const coords=`${start[1]},${start[0]};${end[1]},${end[0]}`;
  const response=await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?alternatives=true&steps=false&overview=full&geometries=geojson`,{headers:{Accept:"application/json","User-Agent":"SafeRouteSL-HackathonDemo/2.0 (educational)"},signal:AbortSignal.timeout(12000),cache:"no-store"});
  if(!response.ok)throw new Error("Routing provider unavailable");const json=await response.json();
  if(json.code!=="Ok"||!Array.isArray(json.routes)||!json.routes.length)throw new Error("No drivable route found");
  return json.routes.slice(0,3).map((route:{geometry?:{coordinates?:unknown[]};distance?:number;duration?:number})=>{const points=(Array.isArray(route.geometry?.coordinates)?route.geometry.coordinates:[]).filter(isCoordinate).map((point):LatLng=>[point[1],point[0]]);if(points.length<2)throw new Error("Routing provider returned invalid geometry");return {provider:"osrm" as const,points,distanceKm:(route.distance??0)/1000,durationMin:(route.duration??0)/60};});
}};

export async function getOrsAvoidanceRoute(start:LatLng,end:LatLng,bufferM:number):Promise<ProviderRoute|null>{
  const key=process.env.ORS_API_KEY;if(!key||haversineMeters(start,end)>140000)return null;
  const relevant=DEMO_HAZARDS.filter(hazard=>distanceToSegmentMeters(hazard.center,start,end)<9000).slice(0,4);if(!relevant.length)return null;
  const polygon={type:"MultiPolygon",coordinates:relevant.map(hazard=>[circlePolygon(hazard.center,hazard.radiusM+bufferM)])};
  const response=await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson",{method:"POST",headers:{Authorization:key,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({coordinates:[[start[1],start[0]],[end[1],end[0]]],instructions:false,options:{avoid_polygons:polygon}}),cache:"no-store",signal:AbortSignal.timeout(12000)});if(!response.ok)return null;
  const json=await response.json(),feature=json?.features?.[0],coordinates=feature?.geometry?.coordinates;if(!Array.isArray(coordinates))return null;
  const points=coordinates.filter(isCoordinate).map((point):LatLng=>[point[1],point[0]]);if(points.length<2)return null;
  return {provider:"ors",points,distanceKm:(feature?.properties?.summary?.distance??0)/1000,durationMin:(feature?.properties?.summary?.duration??0)/60};
}
