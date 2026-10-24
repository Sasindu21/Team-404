import type { DemoHazard, Place } from "./types";

export const PLACES: Place[] = [
  { id: "fort", name: "Colombo Fort", district: "Colombo", point: [6.9344, 79.8428] },
  { id: "pettah", name: "Pettah", district: "Colombo", point: [6.9370, 79.8535] },
  { id: "borella", name: "Borella", district: "Colombo", point: [6.9144, 79.8771] },
  { id: "nugegoda", name: "Nugegoda", district: "Colombo", point: [6.8649, 79.8997] },
  { id: "dehiwala", name: "Dehiwala", district: "Colombo", point: [6.8512, 79.8656] },
  { id: "negombo", name: "Negombo", district: "Gampaha", point: [7.2083, 79.8358] },
  { id: "gampaha", name: "Gampaha", district: "Gampaha", point: [7.0897, 79.9936] },
  { id: "kandy", name: "Kandy", district: "Kandy", point: [7.2906, 80.6337] },
  { id: "ratnapura", name: "Ratnapura", district: "Ratnapura", point: [6.6828, 80.3992] },
  { id: "galle", name: "Galle", district: "Galle", point: [6.0535, 80.2210] },
  { id: "matara", name: "Matara", district: "Matara", point: [5.9549, 80.5550] },
  { id: "kurunegala", name: "Kurunegala", district: "Kurunegala", point: [7.4863, 80.3623] }
];

/** Invented examples for demo and geometry testing. NOT operational warnings. */
export const DEMO_HAZARDS: DemoHazard[] = [
  { id: "demo-flood-01", title: "Illustrative flood zone", type: "flood", severity: "high", center: [6.9013, 79.8721], radiusM: 1050, description: "Fictional area for demonstrating affected-route detection. Not a real flood warning." },
  { id: "demo-road-02", title: "Illustrative road disruption", type: "road", severity: "medium", center: [6.9232, 79.8642], radiusM: 420, description: "Fictional road disruption. Do not use for actual driving decisions." },
  { id: "demo-landslide-03", title: "Illustrative landslide area", type: "landslide", severity: "high", center: [7.2792, 80.6114], radiusM: 1000, description: "Fictional landslide zone near Kandy used only in demonstrations." },
  { id: "demo-storm-04", title: "Illustrative severe-weather area", type: "storm", severity: "low", center: [7.1641, 79.8932], radiusM: 1600, description: "Fictional severe-weather zone used only for demo visualisation." }
];

export const OFFICIAL_LINKS = [
  { name: "Department of Meteorology — Warnings", href: "https://was.meteo.gov.lk/" },
  { name: "Disaster Management Centre (DMC)", href: "https://www.dmc.gov.lk/" },
  { name: "DMC — Emergency hotline 117", href: "https://www.dmc.gov.lk/" }
];
