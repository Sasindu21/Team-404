export type LatLng = [number, number]; // [latitude, longitude]
export type LonLat = [number, number]; // GeoJSON [longitude, latitude]
export type Severity = "high" | "medium" | "low";
export type HazardKind = "flood" | "landslide" | "storm" | "road";
export type RoutePriority = "balanced" | "lowest-overlap" | "fastest" | "shortest";
export interface Place { id: string; name: string; district: string; point: LatLng; }
export interface DemoHazard { id: string; title: string; type: HazardKind; severity: Severity; center: LatLng; radiusM: number; description: string; }
export interface RouteChoice { id: string; name: string; points: LatLng[]; distanceKm: number; durationMin: number; source: "osrm" | "ors" | "schematic"; intersects: string[]; score: number; }
export interface OfficialAlert { id: string; title: string; description: string; link: string; published: string | null; source: string; }
export interface AlertsResponse { status: "live" | "stale" | "unavailable"; checkedAt: string; alerts: OfficialAlert[]; lastUpdatedAt?: string; message?: string; }
export interface RoutesResponse { routes: RouteChoice[]; source: "osrm" | "schematic"; message: string; avoidanceAttempted: boolean; }
