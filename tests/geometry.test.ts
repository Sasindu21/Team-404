import { describe, expect, it } from "vitest";
import { analyzeRoute, haversineMeters, routeCrossesCircle, schematicRoutes } from "../lib/geometry";
import { DEMO_HAZARDS, PLACES } from "../lib/data";
describe("hazard geometry and sample routing", () => {
  it("calculates zero metres at same point", () => expect(haversineMeters([6.9,79.9],[6.9,79.9])).toBe(0));
  it("detects route crossing a fictional circular hazard", () => expect(routeCrossesCircle([[6.89,79.8721],[6.91,79.8721]],[6.9013,79.8721],1050)).toBe(true));
  it("does not falsely intersect remote area", () => expect(routeCrossesCircle([[6.93,79.84],[6.94,79.85]],[7.29,80.6],500)).toBe(false));
  it("returns explicit hazard identifiers", () => expect(analyzeRoute([[6.89,79.8721],[6.91,79.8721]],DEMO_HAZARDS).intersects).toContain("demo-flood-01"));
  it("supports a bounded sensitivity buffer around demo zones", () => {
    const route = [[6.913,79.85],[6.913,79.86]] as [number,number][];
    expect(analyzeRoute(route,DEMO_HAZARDS).intersects).not.toContain("demo-road-02");
    expect(analyzeRoute(route,DEMO_HAZARDS,1500).intersects).toContain("demo-road-02");
  });
  it("creates two nonempty schematic candidates", () => expect(schematicRoutes(PLACES[0].point, PLACES[3].point)).toHaveLength(2));
});
