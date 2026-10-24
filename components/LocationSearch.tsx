"use client";
import { useEffect, useId, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import type { LatLng } from "@/lib/types";

interface Result { name:string; point:LatLng; type:string; }
interface Props { label:string; onChoose:(point:LatLng)=>void; }

export default function LocationSearch({label,onChoose}:Props){
  const id=useId();const [query,setQuery]=useState("");const [results,setResults]=useState<Result[]>([]);const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  useEffect(()=>{
    if(query.trim().length<3){setResults([]);setError("");return;}
    const controller=new AbortController();
    const timer=window.setTimeout(async()=>{setLoading(true);setError("");try{const response=await fetch(`/api/geocode?q=${encodeURIComponent(query)}`,{signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||"Search failed");setResults(data.results||[]);}catch(e){if((e as Error).name!=="AbortError")setError(e instanceof Error?e.message:"Search failed");}finally{if(!controller.signal.aborted)setLoading(false);}},450);
    return()=>{window.clearTimeout(timer);controller.abort();};
  },[query]);
  return <div className="location-search"><label htmlFor={id}>{label}</label><div className="location-search-input"><Search size={14}/><input id={id} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Sri Lankan places…" autoComplete="off"/>{loading?<LoaderCircle className="spin" size={14}/>:query&&<button type="button" onClick={()=>{setQuery("");setResults([]);}} aria-label="Clear search"><X size={13}/></button>}</div>{(results.length>0||error)&&<div className="location-results">{error?<p>{error}</p>:results.map(result=><button type="button" key={`${result.point[0]}-${result.point[1]}`} onClick={()=>{onChoose(result.point);setQuery(result.name.split(",")[0]);setResults([]);}}><strong>{result.name.split(",")[0]}</strong><span>{result.name}</span></button>)}</div>}</div>;
}
