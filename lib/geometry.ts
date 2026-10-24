import type { DemoHazard, LatLng } from "./types";
const RAD = Math.PI / 180;
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = (b[0] - a[0]) * RAD, dLon = (b[1] - a[1]) * RAD;
  const h = Math.sin(dLat/2)**2 + Math.cos(a[0]*RAD)*Math.cos(b[0]*RAD)*Math.sin(dLon/2)**2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1-h)));
}
// Local equirectangular projection gives a short-distance segment check in metres.
export function distanceToSegmentMeters(point: LatLng, a: LatLng, b: LatLng): number {
  const originLat = point[0] * RAD;
  const scaleX = 111320 * Math.cos(originLat), scaleY = 110574;
  const ax = (a[1]-point[1])*scaleX, ay = (a[0]-point[0])*scaleY;
  const bx = (b[1]-point[1])*scaleX, by = (b[0]-point[0])*scaleY;
  const dx = bx-ax, dy = by-ay, denom = dx*dx + dy*dy;
  const t = denom === 0 ? 0 : Math.min(1, Math.max(0, -(ax*dx+ay*dy)/denom));
  return Math.hypot(ax+t*dx, ay+t*dy);
}
export function routeCrossesCircle(points: LatLng[], center: LatLng, radiusM: number): boolean {
  if (!points.length) return false;
  if (points.length === 1) return haversineMeters(points[0], center) <= radiusM;
  for (let i=1;i<points.length;i++) if (distanceToSegmentMeters(center, points[i-1], points[i]) <= radiusM) return true;
  return false;
}
export function analyzeRoute(points: LatLng[], hazards: DemoHazard[], bufferM = 0): { intersects: string[]; score: number } {
  const safeBuffer = Number.isFinite(bufferM) ? Math.max(0, Math.min(3000, bufferM)) : 0;
  const encountered = hazards.filter(h => routeCrossesCircle(points, h.center, h.radiusM + safeBuffer));
  return { intersects: encountered.map(h => h.id), score: encountered.reduce((n,h) => n + (h.severity === "high" ? 55 : h.severity === "medium" ? 30 : 15), 0) };
}
export function pathLengthKm(points: LatLng[]): number {
  return points.slice(1).reduce((sum, point, i) => sum + haversineMeters(points[i],point),0)/1000;
}
export function schematicRoutes(start: LatLng, end: LatLng): LatLng[][] {
  const mid: LatLng = [(start[0]+end[0])/2,(start[1]+end[1])/2];
  const y=end[0]-start[0], x=end[1]-start[1], k=Math.hypot(x,y);
  if(k<0.00001) return [[start,end]];
  const offset=Math.min(0.035,Math.max(.014,k*.3));
  const orthogonal: LatLng = [x/k*offset,-y/k*offset];
  return [
    [start,[(start[0]*3+end[0])/4,(start[1]*3+end[1])/4],mid,[(start[0]+end[0]*3)/4,(start[1]+end[1]*3)/4],end],
    [start,[(start[0]*3+end[0])/4+orthogonal[0],(start[1]*3+end[1])/4+orthogonal[1]],[mid[0]+orthogonal[0],mid[1]+orthogonal[1]],[(start[0]+end[0]*3)/4+orthogonal[0],(start[1]+end[1]*3)/4+orthogonal[1]],end]
  ];
}
/** Approximate polygon to demonstrate hazard-avoidance; never feed unverified polygons as real alerts. */
export function circlePolygon(center: LatLng, radiusM: number): number[][] {
  const latDelta = radiusM/110574, lonDelta = radiusM/(111320*Math.cos(center[0]*RAD));
  return Array.from({length:17},(_,i) => { const angle = 2*Math.PI*i/16; return [center[1]+lonDelta*Math.cos(angle),center[0]+latDelta*Math.sin(angle)]; });
}
