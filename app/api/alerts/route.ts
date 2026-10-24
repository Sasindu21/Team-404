import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { AlertsResponse, OfficialAlert } from "@/lib/types";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const FEED="https://was.meteo.gov.lk/cap/en/rss.xml";
const STALE_TTL_MS = 6 * 60 * 60 * 1000;
let lastGoodFeed: { alerts: OfficialAlert[]; fetchedAt: string; storedAt: number } | null = null;
function clean(input: unknown): string {
  const value = typeof input === "object" && input !== null && "#text" in input
    ? input["#text"]
    : input;
  const str=typeof value==="string" ? value : typeof value==="number" ? String(value) : "";
  return str.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,1200);
}
function officialLink(input: unknown): string {
  if (typeof input !== "string") return "https://was.meteo.gov.lk/";
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase();
    const isOfficialHost = hostname === "meteo.gov.lk" || hostname.endsWith(".meteo.gov.lk");
    return url.protocol === "https:" && !url.username && !url.password && !url.port && isOfficialHost
      ? url.href
      : "https://was.meteo.gov.lk/";
  } catch {
    return "https://was.meteo.gov.lk/";
  }
}
function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
export async function GET(request: NextRequest) {
  const checkedAt=new Date().toISOString();
  const rate = checkRateLimit(request, "alerts", 30, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ status: "unavailable", checkedAt, alerts: [], message: "Too many alert requests. Try again shortly." }, {
      status: 429,
      headers: { ...rateLimitHeaders(rate), "Cache-Control": "no-store" }
    });
  }
  try {
    const response=await fetch(FEED,{headers:{Accept:"application/rss+xml, application/xml, text/xml"},signal:AbortSignal.timeout(8500),next:{revalidate:60}});
    if(!response.ok) throw new Error(`Weather feed responded ${response.status}`);
    const xml=await response.text();
    if (XMLValidator.validate(xml) !== true) throw new Error("Official feed returned invalid XML");
    const doc=new XMLParser({ignoreAttributes:false,trimValues:true}).parse(xml);
    const channel=doc?.rss?.channel;
    if(!channel) throw new Error("Unrecognized official feed format");
    const raw=channel.item ? (Array.isArray(channel.item)?channel.item:[channel.item]) : [];
    const alerts:OfficialAlert[]=raw.filter(isRecord).slice(0,25).map((entry:Record<string,unknown>)=>({
      id:`official-${createHash("sha256").update(clean(entry.guid ?? entry.title).toLowerCase()).digest("hex").slice(0,24)}`,
      title:clean(entry.title)||"Untitled weather advisory",
      description:clean(entry.description),
      link:officialLink(entry.link),
      published:clean(entry.pubDate)||null,
      source:"Department of Meteorology (official RSS)"
    }));
    const result:AlertsResponse={status:"live",checkedAt,alerts,message:alerts.length?"Official RSS feed loaded. Check original notices for precise coverage and validity.":"Official feed loaded with no items. This does NOT certify that travel is safe."};
    lastGoodFeed = { alerts, fetchedAt: checkedAt, storedAt: Date.now() };
    return NextResponse.json(result,{headers:{...rateLimitHeaders(rate),"Cache-Control":"no-store"}});
  } catch (error) {
    console.error("Failed to load official weather alerts feed", error);
    if (lastGoodFeed && Date.now() - lastGoodFeed.storedAt < STALE_TTL_MS) {
      const result:AlertsResponse={
        status:"stale",
        checkedAt,
        lastUpdatedAt:lastGoodFeed.fetchedAt,
        alerts:lastGoodFeed.alerts,
        message:"The official feed is currently unavailable. Showing a cached snapshot that may be outdated; verify each notice at its source."
      };
      return NextResponse.json(result,{headers:{...rateLimitHeaders(rate),"Cache-Control":"no-store"}});
    }
    const result:AlertsResponse={status:"unavailable",checkedAt,alerts:[],message:"Official warning feed cannot be reached right now. Do not interpret missing data as no danger; consult the official source."};
    return NextResponse.json(result,{headers:{...rateLimitHeaders(rate),"Cache-Control":"no-store"}});
  }
}
