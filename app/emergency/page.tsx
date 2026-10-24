"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Clipboard, ExternalLink, LocateFixed, MapPin, Phone, Share2, ShieldAlert } from "lucide-react";
import type { LatLng } from "@/lib/types";
import styles from "../secondary.module.css";

export default function EmergencyPage() {
  const [location,setLocation]=useState<LatLng|null>(null);
  const [status,setStatus]=useState("");
  function requestLocation(){
    if(!navigator.geolocation){setStatus("Location is not supported by this browser.");return;}
    setStatus("Requesting your permission…");
    navigator.geolocation.getCurrentPosition(pos=>{setLocation([pos.coords.latitude,pos.coords.longitude]);setStatus("Location captured on this device. It has not been uploaded.");},()=>setStatus("Location permission was denied or unavailable."),{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
  }
  const locationText=location?`${location[0].toFixed(6)}, ${location[1].toFixed(6)}`:"";
  async function copyLocation(){if(!location)return;try{await navigator.clipboard.writeText(locationText);setStatus("Coordinates copied.");}catch{setStatus("Clipboard access is unavailable.");}}
  async function shareLocation(){if(!location)return;const url=`https://www.openstreetmap.org/?mlat=${location[0]}&mlon=${location[1]}#map=16/${location[0]}/${location[1]}`;if(navigator.share){try{await navigator.share({title:"My location",text:`My current coordinates: ${locationText}`,url});setStatus("Location share sheet opened.");}catch{setStatus("Location sharing was cancelled.");}}else{try{await navigator.clipboard.writeText(url);setStatus("Shareable OpenStreetMap link copied.");}catch{setStatus("Sharing is unavailable.");}}}
  return <main className={styles.page}>
    <header className={styles.top}><Link href="/dashboard"><ArrowLeft size={16}/> Dashboard</Link><span>SafeRoute Sri Lanka 2.0</span></header>
    <section className={styles.hero}><div><span className={styles.kicker}><ShieldAlert size={15}/> EMERGENCY INFORMATION</span><h1>Emergency assistance center</h1><p>Quick access to official contact information and privacy-conscious location tools. SafeRoute is not an emergency dispatch service.</p></div></section>
    <div className={styles.grid}>
      <section className={styles.card}><h2>Official emergency contact</h2><div className={styles.contact}><Phone size={25}/><div><span>Disaster Management Centre</span><strong>117</strong><small>National emergency hotline listed by Sri Lanka DMC</small></div><a href="tel:117">Call 117</a></div><a className={styles.sourceLink} href="https://www.dmc.gov.lk/" target="_blank" rel="noreferrer">Verify on official DMC website <ExternalLink size={14}/></a><div className={styles.warningBox}><ShieldAlert size={17}/><p>Nearby hospitals and shelters are not displayed because no configured authoritative location feed is available. Do not rely on invented or outdated emergency locations.</p></div></section>
      <section className={styles.card}><h2>Your current location</h2><p className={styles.muted}>Location is requested only when you press the button and remains in this page’s memory. SafeRoute does not upload it.</p><button className={styles.primary} type="button" onClick={requestLocation}><LocateFixed size={16}/> Use my current location</button>{location&&<div className={styles.coordinate}><MapPin size={19}/><div><small>COORDINATES</small><strong>{locationText}</strong></div></div>}<div className={styles.actionRow}><button type="button" disabled={!location} onClick={()=>void copyLocation()}><Clipboard size={15}/> Copy</button><button type="button" disabled={!location} onClick={()=>void shareLocation()}><Share2 size={15}/> Share link</button></div>{status&&<p className={styles.statusMessage} role="status">{status}</p>}</section>
    </div>
    <section className={styles.card}><h2>Before travelling during severe weather</h2><div className={styles.guidance}><div><b>1</b><span>Read the complete official warning, including its affected area, issue time, and validity.</span></div><div><b>2</b><span>Confirm current road access with authorities. Missing data never proves that a road is safe.</span></div><div><b>3</b><span>Never enter floodwater or ignore closures and instructions from emergency personnel.</span></div></div></section>
  </main>;
}
