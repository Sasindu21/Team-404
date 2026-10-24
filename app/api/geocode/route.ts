import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import type { LatLng } from "@/lib/types";

export const dynamic = "force-dynamic";

interface NominatimResult { display_name?: unknown; lat?: unknown; lon?: unknown; type?: unknown; }
export interface GeocodeResult { name:string; point:LatLng; type:string; }

export async function GET(request:NextRequest) {
  const rate=checkRateLimit(request,"geocode",20,60_000);
  if(!rate.allowed)return NextResponse.json({error:"Too many location searches. Try again shortly."},{status:429,headers:{...rateLimitHeaders(rate),"Cache-Control":"no-store"}});
  const query=new URL(request.url).searchParams.get("q")?.trim().slice(0,120)||"";
  if(query.length<3)return NextResponse.json({results:[]},{headers:rateLimitHeaders(rate)});
  const url=new URL("https://nominatim.openstreetmap.org/search");
  url.search=new URLSearchParams({q:query,format:"jsonv2",countrycodes:"lk",limit:"6",addressdetails:"1",viewbox:"79.4,9.9,82.1,5.7",bounded:"1"}).toString();
  try{
    const response=await fetch(url,{headers:{Accept:"application/json","User-Agent":"SafeRouteSriLanka/2.0 (educational route planner)"},signal:AbortSignal.timeout(8000),next:{revalidate:3600}});
    if(!response.ok)throw new Error(`Provider returned ${response.status}`);
    const raw:unknown=await response.json();
    const results:GeocodeResult[]=Array.isArray(raw)?raw.flatMap((item:NominatimResult)=>{
      const lat=Number(item.lat),lon=Number(item.lon);
      return typeof item.display_name==="string"&&Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=5.7&&lat<=9.9&&lon>=79.4&&lon<=82.1
        ? [{name:item.display_name.slice(0,180),point:[lat,lon] as LatLng,type:typeof item.type==="string"?item.type:"place"}]:[];
    }):[];
    return NextResponse.json({results},{headers:{...rateLimitHeaders(rate),"Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}});
  }catch{
    return NextResponse.json({error:"Location search is temporarily unavailable.",results:[]},{status:502,headers:{...rateLimitHeaders(rate),"Cache-Control":"no-store"}});
  }
}
