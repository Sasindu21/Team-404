import type { LatLng, Severity } from "./types";

export const REPORT_CATEGORIES = ["flood", "landslide", "blocked-road", "accident", "fallen-tree", "other"] as const;
export type ReportCategory = typeof REPORT_CATEGORIES[number];

export interface CommunityReport {
  id: string;
  category: ReportCategory;
  description: string;
  severity: Severity;
  location: LatLng;
  eventTime: string;
  submittedAt: string;
  status: "community-reported";
}

export interface ReportInput {
  category: string;
  description: string;
  severity: string;
  location: LatLng | null;
  eventTime: string;
}

export function validateReport(input: ReportInput, now = new Date()): string[] {
  const errors: string[] = [];
  if (!REPORT_CATEGORIES.includes(input.category as ReportCategory)) errors.push("Select a valid hazard category.");
  const description = input.description.trim();
  if (description.length < 10) errors.push("Description must contain at least 10 characters.");
  if (description.length > 500) errors.push("Description cannot exceed 500 characters.");
  if (!["low", "medium", "high"].includes(input.severity)) errors.push("Select a valid severity.");
  if (!input.location || input.location[0] < 5.7 || input.location[0] > 9.9 || input.location[1] < 79.4 || input.location[1] > 82.1) errors.push("Choose a location within Sri Lanka.");
  const eventDate = new Date(input.eventTime);
  if (!input.eventTime || Number.isNaN(eventDate.getTime())) errors.push("Enter a valid event time.");
  else if (eventDate.getTime() > now.getTime() + 5 * 60_000) errors.push("Event time cannot be in the future.");
  return errors;
}

export function createCommunityReport(input: ReportInput, now = new Date()): CommunityReport {
  const errors = validateReport(input, now);
  if (errors.length || !input.location) throw new Error(errors[0] || "Invalid report.");
  return {
    id: `community-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    category: input.category as ReportCategory,
    description: input.description.trim(),
    severity: input.severity as Severity,
    location: input.location,
    eventTime: new Date(input.eventTime).toISOString(),
    submittedAt: now.toISOString(),
    status: "community-reported"
  };
}
