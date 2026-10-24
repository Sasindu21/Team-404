import { describe, expect, it } from "vitest";
import { createCommunityReport, validateReport } from "../lib/community-reports";

const valid = { category:"flood", severity:"medium", description:"Water covers one lane near the bridge.", location:[6.93,79.86] as [number,number], eventTime:"2026-10-24T10:00" };

describe("community report validation", () => {
  it("accepts a valid Sri Lankan observation and keeps it unverified", () => {
    const report=createCommunityReport(valid,new Date("2026-10-24T12:00:00Z"));
    expect(report.status).toBe("community-reported");
    expect(report.description).toBe(valid.description);
  });
  it("rejects short descriptions, future events, and out-of-country locations", () => {
    const errors=validateReport({...valid,description:"Flood",location:[12,90],eventTime:"2026-10-25T10:00"},new Date("2026-10-24T12:00:00Z"));
    expect(errors.length).toBe(3);
  });
});
