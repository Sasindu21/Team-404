"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/types";

function Picker({ value, onChange }: { value: LatLng | null; onChange: (point: LatLng) => void }) {
  useMapEvents({ click(event) { onChange([event.latlng.lat, event.latlng.lng]); } });
  return value ? <CircleMarker center={value} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#0fa587", fillOpacity: 1 }}><Tooltip permanent>Report location</Tooltip></CircleMarker> : null;
}

export default function LocationPickerMap({ value, onChange }: { value: LatLng | null; onChange: (point: LatLng) => void }) {
  return <MapContainer center={[7.6, 80.7]} zoom={7} scrollWheelZoom className="picker-map">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Picker value={value} onChange={onChange} />
  </MapContainer>;
}
