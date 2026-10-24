"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertCircle, ArrowDownUp, ArrowRight, Bell, BookOpen, CheckCircle2, ChevronRight, Clipboard, CloudLightning, Compass, Download, ExternalLink, Flag, Globe2, Heart, Info, Layers, LayoutDashboard, LoaderCircle, Map, MapPin, MessageCircle, Navigation, PanelLeftClose, PanelLeftOpen, Phone, Radio, RefreshCw, Route as RouteIcon, Send, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, X } from "lucide-react";
import { DEMO_HAZARDS, OFFICIAL_LINKS, PLACES } from "@/lib/data";
import LocationSearch from "@/components/LocationSearch";
import type { AlertsResponse, LatLng, OfficialAlert, RouteChoice, RoutePriority, RoutesResponse } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false, loading: () => <div className="map-skeleton"><LoaderCircle className="spin" size={29}/><span>Loading interactive map…</span></div> });
type Lang="en"|"si";
const labels={
  en:{ dashboard:"Overview", route:"Route explorer", warnings:"Disaster warnings", assistant:"AI safety assistant", heading:"Move forward,", headingAccent:"with awareness.", subheading:"Explore Sri Lanka with disaster information, route intelligence and clearer decisions — all in one place.", explore:"Explore routes", status:"Data transparency", planner:"Plan your journey", from:"Starting point", to:"Destination", calculate:"Find possible routes", demo:"Use offline schematic example", showHazards:"Show sample hazard zones", officialTitle:"Official weather bulletins", warningsSub:"Loaded from Sri Lanka's Department of Meteorology RSS feed.", refresh:"Refresh feed", live:"OFFICIAL FEED", unavailable:"SOURCE UNAVAILABLE", aiTitle:"SafeRoute assistant", aiSub:"Ask about route comparisons and official warning information.", message:"Type a question about route risk…", send:"Ask assistant", routeTitle:"Route analysis", routeSub:"Compare mapped route candidates against illustrative hazard areas.", noRoute:"Plan a route to see analysis here.", select:"Suggested for comparison", startMap:"Choose start on map", endMap:"Choose destination on map", choose:"Click the map to set a point", close:"Cancel", guide:"Guided mode", aiReady:"Gemini AI connected", aiOff:"AI API key not configured", demoLabel:"DEMO ONLY", truth:"Not for emergency navigation. Sample zones are fictional; verify official advisories and road conditions."},
  si:{dashboard:"සාරාංශය",route:"මාර්ග සැලසුම",warnings:"ආපදා අනතුරු ඇඟවීම්",assistant:"AI ආරක්ෂක සහායක",heading:"ගමන සැලසුම් කරන්න,",headingAccent:"දැනුවත් ලෙස.",subheading:"ශ්‍රී ලංකාවේ මාර්ග, කාලගුණ අනතුරු ඇඟවීම් සහ ආපදා දත්ත පැහැදිලිව එකම තැනකින් බලන්න.",explore:"මාර්ග බලන්න",status:"දත්ත පැහැදිලි කිරීම",planner:"ගමන සැලසුම් කරන්න",from:"ආරම්භක ස්ථානය",to:"ගමනාන්තය",calculate:"මාර්ග සොයන්න",demo:"Offline නිරූපණ මාර්ග",showHazards:"උදාහරණ අවදානම් කලාප",officialTitle:"නිල කාලගුණ නිවේදන",warningsSub:"ශ්‍රී ලංකා කාලගුණ විද්‍යා දෙපාර්තමේන්තුවේ RSS පෝෂණයෙන්.",refresh:"යාවත්කාලීන කරන්න",live:"නිල දත්ත",unavailable:"දත්ත නොමැත",aiTitle:"SafeRoute සහායක",aiSub:"මාර්ග සහ නිල අනතුරු ඇඟවීම් පිළිබඳ ප්‍රශ්න අසන්න.",message:"මාර්ග අවදානම් පිළිබඳ අසන්න…",send:"අසන්න",routeTitle:"මාර්ග විශ්ලේෂණය",routeSub:"නිරූපණ අවදානම් කලාප සමඟ මාර්ග සසඳන්න.",noRoute:"ප්‍රතිඵල බැලීමට මාර්ගයක් සොයන්න.",select:"සංසන්දනය සඳහා යෝජිතයි",startMap:"ආරම්භය සිතියමෙන්",endMap:"ගමනාන්තය සිතියමෙන්",choose:"සිතියම මත ස්ථානයක් තෝරන්න",close:"අවලංගු කරන්න",guide:"සාමාන්‍ය උපදෙස්",aiReady:"Gemini AI සම්බන්ධයි",aiOff:"AI API යතුර ලබා දී නැත",demoLabel:"උදාහරණ පමණයි",truth:"හදිසි සංචාර සඳහා නොවේ. නිරූපණ කලාප මනඃකල්පිතයි; නිල අනතුරු ඇඟවීම් හා මාර්ග තත්ත්වය තහවුරු කරන්න."}
} as const;
function prettyTime(value: string|null) { if(!value) return "Not specified"; const d=new Date(value); return Number.isNaN(d.getTime())?value:d.toLocaleString("en-LK",{dateStyle:"medium",timeStyle:"short"}); }
function compactPoint(p:LatLng):string {return `${p[0].toFixed(5)},${p[1].toFixed(5)}`;}
function placeLabel(p:LatLng) {const matching=PLACES.find(x=>Math.abs(x.point[0]-p[0])<0.000001&&Math.abs(x.point[1]-p[1])<0.000001);return matching?.name||`Custom point (${p[0].toFixed(3)}, ${p[1].toFixed(3)})`;}
const demoSafety = (question:string, language:Lang) => {
  const q=question.toLowerCase();
  if(q.includes("route") || q.includes("මාර්ග")) return language==="si"?"නිරූපණ කලාප සැබෑ ආපදා වාර්තා නොවේ. මාර්ගයේ දත්ත තහවුරු කර, නිල අනතුරු ඇඟවීම් බලන්න.":"Sample hazard overlays are fictional. Compare route candidates, then consult official warnings and independently verify current road conditions. No route is certified safe.";
  if(q.includes("flood")||q.includes("ගංවතුර")) return language==="si"?"ගංවතුර පවතින මාර්ගයකට ඇතුල් නොවන්න. නිල DMC හා කාලගුණ දත්ත බලන්න.":"Do not drive or walk into floodwater. Review official alerts and follow local authorities' instructions. The map's sample flood areas are fictional.";
  return language==="si"?"මෙය සාමාන්‍ය උපදෙස් මාදිලියයි; AI සඳහා GEMINI_API_KEY සකසන්න. නිල තොරතුරු DMC සහ කාලගුණ විද්‍යා දෙපාර්තමේන්තුවෙන් තහවුරු කරන්න.":"This is a deterministic help tip, not AI. Configure GEMINI_API_KEY for contextual Gemini responses. Verify official weather and DMC notices before making travel decisions.";
};
interface ChatItem { role:"assistant"|"user"; text:string; kind?:"ai"|"guide"|"error"; }
interface SavedJourney { id:string; origin:LatLng; destination:LatLng; name:string; }
const SAVED_JOURNEYS_KEY="saferoute-saved-journeys";
export default function DashboardPage(){
  const [lang,setLang]=useState<Lang>("en"); const t=labels[lang];
  const [origin,setOrigin]=useState<LatLng>(PLACES[0].point); const [destination,setDestination]=useState<LatLng>(PLACES[3].point);
  const [pickMode,setPickMode]=useState<"origin"|"destination"|null>(null);
  const [demoRouting,setDemoRouting]=useState(false);const [showHazards,setShowHazards]=useState(true);
  const [routePriority,setRoutePriority]=useState<RoutePriority>("balanced");const [hazardBuffer,setHazardBuffer]=useState(0);
  const [candidateLimit,setCandidateLimit]=useState(3);const [avoidDemoZones,setAvoidDemoZones]=useState(false);
  const [routes,setRoutes]=useState<RouteChoice[]>([]);const [selectedRouteId,setSelectedRouteId]=useState<string|null>(null);
  const [routeLoading,setRouteLoading]=useState(false);const [routeError,setRouteError]=useState("");const [routeMeta,setRouteMeta]=useState("");
  const [alerts,setAlerts]=useState<AlertsResponse|null>(null);const [alertLoading,setAlertLoading]=useState(true);
  const [notificationsEnabled,setNotificationsEnabled]=useState(false);const [notificationMessage,setNotificationMessage]=useState("");
  const seenAlertIds=useRef<Set<string>|null>(null);
  const [aiConfigured,setAiConfigured]=useState(false);const [orsConfigured,setOrsConfigured]=useState(false);
  const [chat,setChat]=useState<ChatItem[]>([{role:"assistant",kind:"guide",text:"Hi! I can explain route comparisons and where to check official weather warnings. Configure Gemini for live AI answers. Sample map zones are fictional."}]);
  const [message,setMessage]=useState("");const [sending,setSending]=useState(false);
  const [savedJourneys,setSavedJourneys]=useState<SavedJourney[]>([]);const [toolMessage,setToolMessage]=useState("");
  const [activeTab,setActiveTab]=useState("dashboard");
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const loadAlerts=useCallback(async(quiet=false)=>{
    if(!quiet)setAlertLoading(true);
    try {const response=await fetch("/api/alerts",{cache:"no-store"}); const data:AlertsResponse=await response.json();if(!response.ok)throw new Error(data.message||"Official feed unavailable");setAlerts(data);} catch {setAlerts({status:"unavailable",checkedAt:new Date().toISOString(),alerts:[],message:"Official feed unavailable. Please check the original source."});}
    finally {if(!quiet)setAlertLoading(false);}
  },[]);
  useEffect(()=>{void loadAlerts();void fetch("/api/status").then(r=>r.json()).then(r=>{setAiConfigured(Boolean(r.aiConfigured));setOrsConfigured(Boolean(r.orsConfigured));}).catch(()=>{});},[loadAlerts]);
  useEffect(()=>{
    if(!("Notification" in window))return;
    setNotificationsEnabled(localStorage.getItem("saferoute-alert-notifications")==="true"&&Notification.permission==="granted");
  },[]);
  useEffect(()=>{
    try {
      const parsed:unknown=JSON.parse(localStorage.getItem(SAVED_JOURNEYS_KEY)||"[]");
      if(Array.isArray(parsed))setSavedJourneys(parsed.filter((item):item is SavedJourney=>typeof item?.id==="string"&&typeof item?.name==="string"&&Array.isArray(item?.origin)&&Array.isArray(item?.destination)).slice(0,6));
    } catch { localStorage.removeItem(SAVED_JOURNEYS_KEY); }
  },[]);
  useEffect(()=>{setSidebarCollapsed(localStorage.getItem("saferoute-sidebar-collapsed")==="true");},[]);
  useEffect(()=>{
    const timer=window.setInterval(()=>{if(document.visibilityState==="visible")void loadAlerts(true);},5*60*1000);
    return()=>window.clearInterval(timer);
  },[loadAlerts]);
  useEffect(()=>{
    if(alerts?.status!=="live")return;
    const current=new Set(alerts.alerts.map(alert=>alert.id));
    if(seenAlertIds.current===null){seenAlertIds.current=current;return;}
    if(notificationsEnabled&&"Notification" in window&&Notification.permission==="granted"){
      for(const alert of alerts.alerts){
        if(!seenAlertIds.current.has(alert.id))new Notification(alert.title,{body:"New official weather bulletin. Open the original notice to verify its coverage and validity."});
      }
    }
    seenAlertIds.current=current;
  },[alerts,notificationsEnabled]);
  async function toggleNotifications(){
    if(!("Notification" in window)){setNotificationMessage("Browser notifications are not supported.");return;}
    if(notificationsEnabled){localStorage.removeItem("saferoute-alert-notifications");setNotificationsEnabled(false);setNotificationMessage("");return;}
    const permission=await Notification.requestPermission();
    if(permission==="granted"){
      seenAlertIds.current=new Set(alerts?.alerts.map(alert=>alert.id)||[]);
      localStorage.setItem("saferoute-alert-notifications","true");setNotificationsEnabled(true);setNotificationMessage("");
    }else{setNotificationMessage("Notification permission was denied.");}
  }
  const clearRoute=()=>{setRoutes([]);setSelectedRouteId(null);setRouteMeta("");setRouteError("");};
  const choosePoint=(p:LatLng)=>{
    if(p[0]<5.7||p[0]>9.9||p[1]<79.4||p[1]>82.1){setRouteError("Choose a point within Sri Lanka.");return;}
    if(pickMode==="origin")setOrigin(p);else if(pickMode==="destination")setDestination(p);else return;
    setPickMode(null);clearRoute();
  };
  const changeOrigin=(id:string)=>{const p=PLACES.find(x=>x.id===id);if(p){setOrigin(p.point);clearRoute();}};
  const changeDest=(id:string)=>{const p=PLACES.find(x=>x.id===id);if(p){setDestination(p.point);clearRoute();}};
  const swap=()=>{setOrigin(destination);setDestination(origin);clearRoute();};
  const persistJourneys=(items:SavedJourney[])=>{setSavedJourneys(items);localStorage.setItem(SAVED_JOURNEYS_KEY,JSON.stringify(items));};
  const saveJourney=()=>{
    const id=`${compactPoint(origin)}-${compactPoint(destination)}`;
    if(savedJourneys.some(item=>item.id===id)){setToolMessage("This journey is already saved.");return;}
    const item:SavedJourney={id,origin:[...origin],destination:[...destination],name:`${placeLabel(origin)} → ${placeLabel(destination)}`};
    persistJourneys([item,...savedJourneys].slice(0,6));setToolMessage("Journey saved on this device.");
  };
  const loadJourney=(journey:SavedJourney)=>{setOrigin(journey.origin);setDestination(journey.destination);clearRoute();setToolMessage(`Loaded ${journey.name}`);};
  const removeJourney=(id:string)=>{persistJourneys(savedJourneys.filter(item=>item.id!==id));setToolMessage("Saved journey removed.");};
  const useCurrentLocation=()=>{
    if(!navigator.geolocation){setRouteError("Location is not supported by this browser.");return;}
    setToolMessage("Requesting your location…");
    navigator.geolocation.getCurrentPosition(position=>{const point:LatLng=[position.coords.latitude,position.coords.longitude];if(point[0]<5.7||point[0]>9.9||point[1]<79.4||point[1]>82.1){setRouteError("Your current location is outside the supported Sri Lanka map area.");setToolMessage("");return;}setOrigin(point);clearRoute();setToolMessage("Current location selected as the starting point. It was not stored.");},()=>{setRouteError("Location permission was denied or unavailable.");setToolMessage("");},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  };
  async function planRoute(){
    setRouteLoading(true);clearRoute();
    try{
      const params=new URLSearchParams({from:compactPoint(origin),to:compactPoint(destination),demo:demoRouting?"1":"0",priority:routePriority,buffer:String(hazardBuffer),limit:String(candidateLimit),avoidDemo:avoidDemoZones?"1":"0"});
      const response=await fetch(`/api/routes?${params}`,{cache:"no-store"});const data:RoutesResponse & {error?:string}=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not find a route");
      setRoutes(data.routes);setSelectedRouteId(data.routes[0]?.id||null);setRouteMeta(data.message);if(data.source==="schematic")setDemoRouting(true);
    }catch(error){setRouteMeta("");setRouteError(error instanceof Error?error.message:"Route service unavailable");}
    finally{setRouteLoading(false);}
  }
  const selectedRoute=routes.find(r=>r.id===selectedRouteId)||routes[0];
  const selectedHazards=selectedRoute?.intersects.map(id=>DEMO_HAZARDS.find(h=>h.id===id)).filter((h):h is NonNullable<typeof h>=>Boolean(h))||[];
  const routeSummary=selectedRoute?`${placeLabel(origin)} to ${placeLabel(destination)} — ${selectedRoute.name}, ${selectedRoute.distanceKm} km, about ${selectedRoute.durationMin} min, ${selectedRoute.intersects.length} fictional demo-zone overlap(s). Not a safety certification.`:"";
  async function copyRouteSummary(){
    if(!routeSummary)return;
    try{await navigator.clipboard.writeText(routeSummary);setToolMessage("Route summary copied.");}catch{setToolMessage("Could not access the clipboard.");}
  }
  function exportGeoJson(){
    if(!selectedRoute)return;
    const data={type:"FeatureCollection",features:[{type:"Feature",properties:{name:selectedRoute.name,distanceKm:selectedRoute.distanceKm,durationMin:selectedRoute.durationMin,source:selectedRoute.source,demoOverlapIds:selectedRoute.intersects,disclaimer:"Demo only; not verified for navigation or safety."},geometry:{type:"LineString",coordinates:selectedRoute.points.map(([lat,lon])=>[lon,lat])}}]};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/geo+json"}));
    const anchor=document.createElement("a");anchor.href=url;anchor.download="saferoute-route.geojson";anchor.click();URL.revokeObjectURL(url);setToolMessage("GeoJSON route exported.");
  }
  const context=useMemo(()=>{
    const routePart=selectedRoute?`Route from ${placeLabel(origin)} to ${placeLabel(destination)}: ${selectedRoute.distanceKm} km, ~${selectedRoute.durationMin} min; hazard overlap score ${selectedRoute.score}, intersects ${selectedRoute.intersects.map(id=>DEMO_HAZARDS.find(h=>h.id===id)?.title).join(", ")||"no fictional example zones"}. Route origin ${selectedRoute.source}. These are FICTIONAL zones and not evidence of any real hazard.`:"No route selected.";
    const official=alerts?.status==="live"||alerts?.status==="stale"?`${alerts.status==="stale"?"CACHED BULLETINS MAY BE OUTDATED: ":""}${alerts.alerts.slice(0,5).map(x=>x.title).join("; ")||"Official RSS loaded; no items returned"}`:"Official weather feed unavailable (status unknown).";
    return `${routePart}\nOfficial warnings summary: ${official}`;
  },[alerts,origin,destination,selectedRoute]);
  async function askAssistant(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault(); const question=message.trim(); if(!question||sending)return;
    setChat(old=>[...old,{role:"user",text:question}]);setMessage("");setSending(true);
    if(!aiConfigured){setChat(old=>[...old,{role:"assistant",kind:"guide",text:demoSafety(question,lang)}]);setSending(false);return;}
    try {const res=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,context,language:lang})});const data=await res.json();if(!res.ok)throw new Error(data.error||"AI unavailable");setChat(old=>[...old,{role:"assistant",kind:"ai",text:data.answer}]);}
    catch(e){setChat(old=>[...old,{role:"assistant",kind:"error",text:`AI provider unavailable: ${e instanceof Error?e.message:"Please try again later"}. This is not an AI answer.`}]);}
    finally{setSending(false);}
  }
  const nav=[{id:"dashboard",text:t.dashboard,icon:LayoutDashboard},{id:"planner",text:t.route,icon:Navigation},{id:"warnings",text:t.warnings,icon:Bell},{id:"assistant",text:t.assistant,icon:MessageCircle}];
  const jump=(id:string)=>{setActiveTab(id);document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});};
  const toggleSidebar=()=>setSidebarCollapsed(value=>{const next=!value;localStorage.setItem("saferoute-sidebar-collapsed",String(next));return next;});
  return <div className={`site-shell ${sidebarCollapsed?"sidebar-collapsed":""}`}>
    <a className="skip-link" href="#dashboard">Skip to main content</a>
    <aside className="sidebar">
      <div className="brand-row"><a className="brand" href="#dashboard" onClick={()=>setActiveTab("dashboard")} aria-label="SafeRoute Sri Lanka dashboard"><span className="brand-icon"><Navigation size={22} fill="currentColor"/></span><span className="brand-text">SafeRoute<span> Sri Lanka</span><small>DISASTER INTELLIGENCE</small></span></a><button type="button" className="collapse-button" onClick={toggleSidebar} aria-expanded={!sidebarCollapsed} aria-controls="dashboard-navigation" aria-label={sidebarCollapsed?"Expand sidebar":"Collapse sidebar"}>{sidebarCollapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button></div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="sidenav" id="dashboard-navigation" aria-label="Primary navigation">{nav.map(item=><button type="button" key={item.id} className={`nav-button ${activeTab===item.id?"active":""}`} onClick={()=>jump(item.id)} aria-current={activeTab===item.id?"page":undefined} title={sidebarCollapsed?item.text:undefined}><item.icon size={18}/><span>{item.text}</span>{activeTab===item.id&&<span className="active-dot"/>}</button>)}</nav>
      <nav className="side-tools" aria-label="Safety tools"><a href="/report"><ShieldAlert size={16}/><span>Report a hazard</span></a><a href="/emergency"><Phone size={16}/><span>Emergency center</span></a><a href="/my-routes"><Heart size={16}/><span>My saved routes</span></a><a href="/settings"><SlidersHorizontal size={16}/><span>Settings</span></a></nav>
      <div className="sidebar-spacer"/>
      <div className="sidebar-help"><span className="sidebar-help-icon"><ShieldAlert size={18}/></span><strong>Safety first.</strong><p>Map hazard overlays use fictional demo scenarios. Check official advisories before travel.</p><a href="https://www.dmc.gov.lk/" target="_blank" rel="noreferrer">Official DMC website <ExternalLink size={13}/></a></div>
      <div className="sidebar-footer"><span className="avatar">SL</span><span><strong>Hack for Humanity</strong><small>Open-source prototype · 2026</small></span></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={15}/><b>Safety overview</b></div><div className="topbar-right"><span className="topbar-pill"><span className="pulse-green"/> Prototype</span><button className="lang-button" onClick={()=>setLang(lang==="en"?"si":"en")}><Globe2 size={16}/>{lang==="en"?"සිංහල":"English"}</button></div></header>
      <main className="workspace" id="dashboard" tabIndex={-1}>
        <div className="hero"><div className="hero-content"><div className="eyebrow"><Radio size={13}/> BUILT FOR RESILIENCE · SRI LANKA</div><h1>{t.heading}<br/><span>{t.headingAccent}</span></h1><p>{t.subheading}</p><div className="hero-actions"><button className="primary-btn" onClick={()=>jump("planner")}>{t.explore}<ArrowRight size={17}/></button><button className="ghost-btn" onClick={()=>jump("warnings")}><Bell size={17}/> {t.status}</button></div></div><div className="hero-art" aria-hidden="true"><div className="orb one"/><div className="orb two"/><div className="radar radar1"/><div className="radar radar2"/><div className="radar radar3"/><div className="hero-crosshair"><Navigation size={52} strokeWidth={1.6}/></div><div className="map-tick one"/><div className="map-tick two"/><div className="map-tick three"/></div></div>
        <div className="transparency-banner"><Info size={18}/><span><b>Prototype · transparency notice:</b> {t.truth}</span><span className="tag amber">NOT A SAFETY CERTIFICATION</span></div>
        <section className="metrics" aria-label="Status overview"><div className="metric"><span className="metric-icon mint"><MapPin size={19}/></span><div><div className="metric-title">Example hazard zones</div><strong>{DEMO_HAZARDS.length.toString().padStart(2,"0")}</strong><small>Fictional training data</small></div></div><div className="metric"><span className="metric-icon peach"><CloudLightning size={19}/></span><div><div className="metric-title">Official bulletins</div><strong>{alertLoading?"…":alerts?.status==="live"?String(alerts.alerts.length).padStart(2,"0"):"—"}</strong><small>{alerts?.status==="live"?"From government RSS":"Live source unverified"}</small></div></div><div className="metric"><span className="metric-icon blue"><RouteIcon size={19}/></span><div><div className="metric-title">Routes compared</div><strong>{String(routes.length).padStart(2,"0")}</strong><small>For current journey</small></div></div><div className="metric"><span className="metric-icon lavender"><Sparkles size={19}/></span><div><div className="metric-title">AI assistance</div><strong className="metric-brief">{aiConfigured?"Online":"Setup"}</strong><small>{aiConfigured?"Gemini available":"API key required"}</small></div></div></section>
        <section className="panel map-section" id="planner"><div className="panel-header"><div><div className="section-kicker"><Compass size={15}/> ROUTE INTELLIGENCE</div><h2>{t.planner}</h2><p>Explore driving routes and compare sample hazard overlays.</p></div><div className="map-header-status"><span className="tiny-badge"><Layers size={15}/> OpenStreetMap</span></div></div>
          <div className="planner-grid"><div className="planner-controls"><div className="field-title">YOUR JOURNEY</div><div className="location-stack"><div className="location-input"><span className="start-dot"/><div className="location-details"><label htmlFor="origin">{t.from}</label><select id="origin" value={PLACES.find(x=>x.point[0]===origin[0]&&x.point[1]===origin[1])?.id||"custom"} onChange={e=>changeOrigin(e.target.value)}><option value="custom" disabled>{placeLabel(origin)}</option>{PLACES.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><button type="button" className="icon-btn" title={t.startMap} aria-label={t.startMap} onClick={()=>setPickMode("origin")}><MapPin size={17}/></button></div><div className="location-rule"/><div className="location-input"><span className="end-dot"/><div className="location-details"><label htmlFor="destination">{t.to}</label><select id="destination" value={PLACES.find(x=>x.point[0]===destination[0]&&x.point[1]===destination[1])?.id||"custom"} onChange={e=>changeDest(e.target.value)}><option value="custom" disabled>{placeLabel(destination)}</option>{PLACES.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><button type="button" className="icon-btn" title={t.endMap} aria-label={t.endMap} onClick={()=>setPickMode("destination")}><MapPin size={17}/></button></div></div>
              <button type="button" className="swap-btn" onClick={swap}><ArrowDownUp size={14}/> Swap locations</button>
              <div className="search-pair"><LocationSearch label="Search a custom starting place" onChoose={point=>{setOrigin(point);clearRoute();}}/><LocationSearch label="Search a custom destination" onChoose={point=>{setDestination(point);clearRoute();}}/><button type="button" className="current-location" onClick={useCurrentLocation}><Navigation size={13}/> Use my current location</button></div>
              <div className="preferences"><div className="field-title">MAP & ROUTE OPTIONS</div><label className="switch-row"><span><Layers size={17}/> {t.showHazards}</span><input type="checkbox" checked={showHazards} onChange={e=>setShowHazards(e.target.checked)}/></label><label className="switch-row"><span><Map size={17}/> {t.demo}</span><input type="checkbox" checked={demoRouting} onChange={e=>{setDemoRouting(e.target.checked);clearRoute();}}/></label><p className="hint-text">{demoRouting?"Schematic lines are not routed on roads.":"Live route geometry needs internet and a public routing service."}</p></div>
              <details className="advanced-options"><summary><SlidersHorizontal size={15}/> Advanced options</summary><div className="advanced-fields"><label>Ranking priority<select value={routePriority} onChange={e=>{setRoutePriority(e.target.value as RoutePriority);clearRoute();}}><option value="balanced">Balanced</option><option value="lowest-overlap">Lowest demo overlap</option><option value="fastest">Fastest time</option><option value="shortest">Shortest returned candidate</option></select></label><label>Demo-zone buffer<select value={hazardBuffer} onChange={e=>{setHazardBuffer(Number(e.target.value));clearRoute();}}><option value={0}>Standard boundary</option><option value={500}>+500 metres</option><option value={1000}>+1 kilometre</option><option value={2000}>+2 kilometres</option></select></label><label>Maximum candidates<select value={candidateLimit} onChange={e=>{setCandidateLimit(Number(e.target.value));clearRoute();}}><option value={1}>1 route</option><option value={2}>2 routes</option><option value={3}>3 routes</option></select></label><label className="switch-row compact"><span>Request ORS avoidance</span><input type="checkbox" checked={avoidDemoZones} disabled={!orsConfigured||demoRouting} onChange={e=>{setAvoidDemoZones(e.target.checked);clearRoute();}}/></label><p>“Shortest” means the least distance among routes returned by the provider; it does not request a special shortest-path profile. ORS avoidance requires its API key and live routing.</p></div></details>
              <div className="journey-save"><button type="button" onClick={saveJourney}><Heart size={14}/> Save this journey</button>{savedJourneys.length>0&&<div className="saved-journeys"><span>SAVED ON THIS DEVICE</span>{savedJourneys.map(journey=><div key={journey.id}><button type="button" onClick={()=>loadJourney(journey)} title={journey.name}>{journey.name}</button><button type="button" onClick={()=>removeJourney(journey.id)} aria-label={`Remove ${journey.name}`}><Trash2 size={13}/></button></div>)}</div>}</div>
              <button type="button" className="route-submit" disabled={routeLoading} onClick={planRoute}>{routeLoading?<><LoaderCircle className="spin" size={18}/> Searching…</>:<><Navigation size={17}/> {t.calculate}<ArrowRight size={17}/></>}</button>
              {routeError&&<div className="inline-error" role="alert"><AlertCircle size={17}/><span>{routeError}</span></div>}
              {pickMode&&<div className="inline-note"><MapPin size={16}/><span>{t.choose}.</span><button type="button" onClick={()=>setPickMode(null)} aria-label={t.close}><X size={15}/></button></div>}
              <div className="provider-line"><ShieldCheck size={15}/>{orsConfigured?"Optional ORS hazard avoidance configured":"ORS avoidance optional; available with an API key"}</div>
            </div>
            <div className="map-display"><MapView origin={origin} destination={destination} routes={routes} selectedRouteId={selectedRouteId} showHazards={showHazards} pickMode={pickMode} onChoosePoint={choosePoint} onSelectRoute={setSelectedRouteId}/><div className="map-overlay-top"><span><span className="pulse-green"/> MAP ACTIVE</span><span>{demoRouting?"SCHEMATIC OPTION":"OSM ROAD NETWORK"}</span></div><div className="map-key"><span><i className="legend-point origin"/> Origin</span><span><i className="legend-point dest"/> Destination</span><span><i className="legend-point hazard"/> Fictional hazard</span></div></div></div>
        </section>
        <section className="panel route-results" aria-label="Route results"><div className="panel-header tight"><div><div className="section-kicker"><Activity size={15}/> HAZARD-AWARE ANALYSIS</div><h2>{t.routeTitle}</h2><p>{t.routeSub}</p></div>{routes.length>0&&<span className="tiny-badge">{routes.length} candidates</span>}</div>
          {!routes.length?<div className="empty-state"><RouteIcon size={30}/><strong>No route analyzed yet</strong><p>{t.noRoute}</p></div>:<><div className="route-cards">{routes.map((r,index)=><button type="button" onClick={()=>setSelectedRouteId(r.id)} className={`route-card ${r.id===selectedRouteId?"selected":""}`} key={r.id}><div className="route-card-top"><span className="route-icon"><RouteIcon size={17}/></span><span className={`risk-chip ${r.score>0?"has-risk":"no-risk"}`}>{r.intersects.length?`${r.intersects.length} sample overlap${r.intersects.length>1?"s":""}`:"No sample overlaps"}</span></div><strong>{r.name}</strong><div className="route-facts"><span>{r.distanceKm} km</span><span>~{r.durationMin} min</span><span>{r.source==="schematic"?"schematic":r.source.toUpperCase()}</span></div>{index===0&&<div className="route-recommendation"><CheckCircle2 size={14}/> Best match for selected priority</div>}</button>)}</div>{selectedRoute&&<div className="selected-route-detail"><div><span>SELECTED ROUTE</span><h3>{selectedRoute.name}</h3><p>{selectedHazards.length?selectedHazards.map(h=>h.title).join(" · "):"No fictional demo zones overlap this geometry."}</p></div><div className="route-tools"><button type="button" onClick={()=>void copyRouteSummary()}><Clipboard size={14}/> Copy summary</button><button type="button" onClick={exportGeoJson}><Download size={14}/> Export GeoJSON</button></div></div>}<div className="routes-explainer"><ShieldAlert size={18}/><div><strong>Interpret the map carefully.</strong><p>{routeMeta} A lower demo overlap score does not establish real-world safety.</p></div></div></>}
        </section>
        <section className="panel alert-section" id="warnings"><div className="panel-header"><div><div className="section-kicker"><Bell size={15}/> OFFICIAL SOURCES</div><h2>{t.officialTitle}</h2><p>{t.warningsSub}</p></div><div className="alert-actions"><button className="outline-action" onClick={()=>void toggleNotifications()}><Bell size={16}/>{notificationsEnabled?"Notifications on":"Enable notifications"}</button><button className="outline-action" onClick={()=>void loadAlerts()} disabled={alertLoading}><RefreshCw size={16} className={alertLoading?"spin":""}/>{t.refresh}</button></div></div>
          {notificationMessage&&<p className="feed-message" role="status">{notificationMessage}</p>}
          <div className="feed-top"><span className={`source-indicator ${alerts?.status==="live"?"online":alerts?.status==="stale"?"stale":"offline"}`}><span className="status-dot"/>{alertLoading?"CHECKING OFFICIAL SOURCE":alerts?.status==="live"?t.live:alerts?.status==="stale"?"STALE SNAPSHOT":t.unavailable}</span><span>Last checked: {alerts?prettyTime(alerts.checkedAt):"Checking…"}{alerts?.status==="stale"&&alerts.lastUpdatedAt?` · Data captured: ${prettyTime(alerts.lastUpdatedAt)}`:""}</span></div>
          <p className="feed-message">{alertLoading?"Connecting to public official RSS feed…":alerts?.message}</p>
          {(alerts?.status==="live"||alerts?.status==="stale")&&alerts.alerts.length>0?<div className="warning-list">{alerts.alerts.map((a:OfficialAlert)=><article className="warning-item" key={a.id}><span className="warning-item-icon"><CloudLightning size={20}/></span><div className="warning-content"><div className="warning-meta">{alerts.status==="stale"?"CACHED OFFICIAL WEATHER BULLETIN":"OFFICIAL WEATHER BULLETIN"} · {prettyTime(a.published)}</div><h3>{a.title}</h3>{a.description&&<p>{a.description}</p>}<a href={a.link} target="_blank" rel="noreferrer">View original notice <ExternalLink size={13}/></a></div></article>)}</div>:<div className="feed-empty"><Info size={20}/><p>{alerts?.status==="live"?"No bulletins were returned by this feed. That does not establish an absence of hazards.":"Official live warnings are not verified in this session. Use the links below to check directly."}</p></div>}
          <div className="official-link-list">{OFFICIAL_LINKS.map((link)=><a key={link.name} href={link.href} target="_blank" rel="noreferrer"><BookOpen size={17}/><span>{link.name}</span><ExternalLink size={14}/></a>)}</div>
          <div className="warning-footer"><Flag size={15}/> Live official notices are listed, not automatically placed on the map unless verified geographic coverage is available.</div>
        </section>
        <section className="panel assistant-section" id="assistant"><div className="panel-header"><div><div className="section-kicker"><Sparkles size={15}/> EXPLAINABLE TECHNOLOGY</div><h2>{t.aiTitle}</h2><p>{t.aiSub}</p></div><span className={`source-indicator ${aiConfigured?"online":"offline"}`}><span className="status-dot"/>{aiConfigured?t.aiReady:t.aiOff}</span></div><div className="assistant-grid"><div className="assistant-intro"><span className="assistant-big-icon"><Sparkles size={29}/></span><h3>Understand the risks.<br/>Make better decisions.</h3><p>Explore the meaning of displayed warnings, route overlap scores, and where to confirm official information.</p><div className="suggestions">{["Why was this route ranked first?","Where do live weather warnings come from?","How do I check flood advisories?"].map(q=><button type="button" key={q} onClick={()=>setMessage(q)}>{q}<ArrowRight size={14}/></button>)}</div><div className="ai-disclaimer"><Info size={15}/> {aiConfigured?"AI explanations may be inaccurate. Verify emergency information with authorities.":"Offline responses are fixed guidance, not AI. Configure GEMINI_API_KEY to enable AI."}</div></div><div className="chat-box"><div className="chat-feed" aria-live="polite">{chat.map((item,i)=><div className={`chat-bubble-wrap ${item.role}`} key={`${i}-${item.role}`}><span className="chat-role">{item.role==="user"?"YOU":item.kind==="ai"?"GEMINI AI":item.kind==="error"?"SERVICE STATUS":"GUIDANCE MODE"}</span><div className="chat-bubble">{item.text}</div></div>)}{sending&&<div className="thinking"><LoaderCircle className="spin" size={17}/> Generating response…</div>}</div><form className="chat-form" onSubmit={askAssistant}><input value={message} maxLength={900} onChange={e=>setMessage(e.target.value)} placeholder={t.message} aria-label={t.message}/><button type="submit" disabled={!message.trim()||sending} aria-label={t.send}><Send size={18}/></button></form></div></div></section>
        <section className="emergency-strip" aria-label="Emergency contacts"><div><Phone size={19}/><span><strong>Emergency quick access</strong><small>Numbers verified from the official DMC emergency contact list.</small></span></div><a href="tel:117">DMC 117</a><a href="tel:1990">Ambulance 1990</a><a href="tel:119">Police 119</a></section>
        {toolMessage&&<div className="tool-toast" role="status">{toolMessage}<button type="button" onClick={()=>setToolMessage("")} aria-label="Dismiss"><X size={14}/></button></div>}
        <div className="bottom-note"><span><ShieldCheck size={17}/> Designed for transparency, accessibility and responsible AI.</span><span>SafeRoute Sri Lanka · Open source demo · Not an emergency service</span></div>
      </main>
    </div>
  </div>;
}
