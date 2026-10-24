"use client";
import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { DEMO_HAZARDS } from "@/lib/data";
import type { LatLng, RouteChoice } from "@/lib/types";

interface Props {
  origin: LatLng; destination: LatLng; routes: RouteChoice[]; selectedRouteId: string | null;
  showHazards: boolean; pickMode: "origin" | "destination" | null;
  onChoosePoint: (point: LatLng) => void;
  onSelectRoute: (id:string) => void;
}
function MapActions({origin,destination,routes,selectedRouteId,pickMode,onChoosePoint}: Pick<Props,"origin"|"destination"|"routes"|"selectedRouteId"|"pickMode"|"onChoosePoint">) {
  const map=useMap();
  useMapEvents({click(event){ if(pickMode) onChoosePoint([event.latlng.lat,event.latlng.lng]); }});
  useEffect(() => {
    const points=routes.find(route=>route.id===selectedRouteId)?.points ?? (routes.length ? routes[0].points : [origin,destination]);
    if(points.length) map.fitBounds(points.map(p => [p[0],p[1]] as LatLng), {padding:[36,36],maxZoom:13,animate:true});
  }, [map,origin[0],origin[1],destination[0],destination[1],routes,selectedRouteId]);
  useEffect(() => { const resize=()=>map.invalidateSize(); const timeout=setTimeout(resize,170); window.addEventListener("resize",resize); return ()=>{clearTimeout(timeout);window.removeEventListener("resize",resize);}; },[map]);
  return null;
}
export default function MapView(props:Props) {
  const selected=props.routes.find(r=>r.id===props.selectedRouteId);
  return <MapContainer center={[6.91,79.88]} zoom={12} scrollWheelZoom zoomControl attributionControl className={props.pickMode?"route-map picking":"route-map"}>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19}/>
    {props.showHazards && DEMO_HAZARDS.map(h => <Circle key={h.id} center={h.center} radius={h.radiusM} pathOptions={{color:h.severity==="high"?"#f36560":"#f2aa4c",fillColor:h.severity==="high"?"#fa7670":"#eaa84e",fillOpacity:0.24,weight:1.8,dashArray:"6 4"}}><Popup><div className="map-popup"><b>{h.title}</b><p>{h.description}</p><strong>FICTIONAL DEMO DATA</strong></div></Popup></Circle>)}
    {props.routes.filter(r=>r.id!==props.selectedRouteId).map(r=><Polyline key={r.id} positions={r.points} pathOptions={{color:"#7688a3",weight:5,opacity:.75,dashArray:r.source==="schematic"?"6 9":undefined}} eventHandlers={{click:()=>props.onSelectRoute(r.id)}}><Tooltip>{r.name} · {r.score} demo points</Tooltip></Polyline>)}
    {selected && <Polyline key={selected.id} positions={selected.points} pathOptions={{color:selected.score>0?"#fb785f":"#23cba8",weight:7,opacity:.96,dashArray:selected.source==="schematic"?"7 8":undefined}}><Tooltip permanent={false}>{selected.name}</Tooltip></Polyline>}
    <CircleMarker center={props.origin} radius={10} pathOptions={{color:"#fff",weight:3,fillColor:"#12b899",fillOpacity:1}}><Tooltip direction="top">Start point</Tooltip></CircleMarker>
    <CircleMarker center={props.destination} radius={10} pathOptions={{color:"#fff",weight:3,fillColor:"#333b56",fillOpacity:1}}><Tooltip direction="top">Destination</Tooltip></CircleMarker>
    <MapActions origin={props.origin} destination={props.destination} routes={props.routes} selectedRouteId={props.selectedRouteId} pickMode={props.pickMode} onChoosePoint={props.onChoosePoint}/>
  </MapContainer>;
}
