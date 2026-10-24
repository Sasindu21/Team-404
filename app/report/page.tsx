"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, MapPin, Send, ShieldAlert } from "lucide-react";
import { createCommunityReport, REPORT_CATEGORIES, validateReport, type CommunityReport } from "@/lib/community-reports";
import type { LatLng, Severity } from "@/lib/types";
import styles from "../secondary.module.css";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), { ssr: false, loading: () => <div className={styles.mapLoading}>Loading location map…</div> });
const STORAGE_KEY = "saferoute-community-reports";

export default function ReportPage() {
  const [category, setCategory] = useState("flood");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [description, setDescription] = useState("");
  const [eventTime, setEventTime] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16));
  const [location, setLocation] = useState<LatLng | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); if (Array.isArray(value)) setReports(value.slice(0, 20)); }
    catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const input = useMemo(() => ({ category, severity, description, eventTime, location }), [category, severity, description, eventTime, location]);
  const errors = validateReport(input);
  function chooseLocation(point: LatLng) { setLocation(point); setSubmitted(false); }
  function submit(event: React.FormEvent) {
    event.preventDefault(); setAttempted(true); setSubmitted(false);
    if (errors.length) return;
    const report = createCommunityReport(input);
    const next = [report, ...reports].slice(0, 20);
    setReports(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDescription(""); setAttempted(false); setSubmitted(true);
  }

  return <main className={styles.page}>
    <header className={styles.top}><Link href="/dashboard"><ArrowLeft size={16}/> Dashboard</Link><span>SafeRoute Sri Lanka 2.0</span></header>
    <section className={styles.hero}><div><span className={styles.kicker}><AlertTriangle size={15}/> COMMUNITY INTELLIGENCE</span><h1>Report a road hazard</h1><p>Help other travellers understand what you observed. Every submission remains community-reported and unverified until reviewed by an authorized moderator.</p></div><div className={styles.notice}><ShieldAlert size={22}/><b>Not an official warning</b><span>For immediate danger, contact official emergency services.</span></div></section>
    <div className={styles.grid}>
      <form className={styles.card} onSubmit={submit} noValidate>
        <h2>Observation details</h2>
        <div className={styles.twoCols}><label>Hazard category<select value={category} onChange={e=>setCategory(e.target.value)}>{REPORT_CATEGORIES.map(item=><option key={item} value={item}>{item.replace("-", " ")}</option>)}</select></label><label>Observed severity<select value={severity} onChange={e=>setSeverity(e.target.value as Severity)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div>
        <label>Description<textarea value={description} maxLength={500} rows={5} onChange={e=>setDescription(e.target.value)} placeholder="Describe what you saw, road access, and visible conditions…"/><small>{description.length}/500 characters</small></label>
        <label><Clock size={14}/> Event time<input type="datetime-local" value={eventTime} onChange={e=>setEventTime(e.target.value)}/></label>
        <div className={styles.locationLabel}><MapPin size={15}/><span><b>Location</b><small>{location ? `${location[0].toFixed(5)}, ${location[1].toFixed(5)}` : "Click the map to choose the observed location."}</small></span></div>
        <div className={styles.mapWrap}><LocationPickerMap value={location} onChange={chooseLocation}/></div>
        {attempted&&errors.length>0&&<div className={styles.errors} role="alert">{errors.map(error=><span key={error}>{error}</span>)}</div>}
        {submitted&&<div className={styles.success} role="status"><CheckCircle2 size={17}/> Saved locally as Community reported. It has not been verified or published as an official alert.</div>}
        <button className={styles.primary} type="submit"><Send size={16}/> Submit community report</button>
      </form>
      <aside className={styles.card}><h2>Your device-local reports</h2><p className={styles.muted}>Guest reports are stored only in this browser. They are not uploaded, publicly visible, or reviewed by an administrator in this configuration.</p>{reports.length===0?<div className={styles.empty}>No reports saved on this device.</div>:<div className={styles.reportList}>{reports.map(report=><article key={report.id}><span className={styles.status}>COMMUNITY REPORTED · UNVERIFIED</span><h3>{report.category.replace("-", " ")}</h3><p>{report.description}</p><small>{new Date(report.eventTime).toLocaleString("en-LK")} · {report.severity} severity</small></article>)}</div>}</aside>
    </div>
  </main>;
}
