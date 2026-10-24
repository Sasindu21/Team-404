import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../app/api/routes/route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/routes", () => {
  it("applies advanced ranking and candidate-limit options", async () => {
    const request = new NextRequest(
      "http://localhost/api/routes?from=6.9344%2C79.8428&to=6.8649%2C79.8997&demo=1&priority=fastest&limit=1&buffer=500",
      { headers: { "x-real-ip": "192.0.2.144" } }
    );
    const response = await GET(request);
    const body = await response.json();
    expect(body.routes).toHaveLength(1);
    expect(body.routes[0].name).toBe("Direct schematic");
    expect(body.message).toContain("fastest");
    expect(body.message).toContain("500 m");
  });

  it("returns clearly labeled schematic routes when the live provider fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("routing offline")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const request = new NextRequest(
      "http://localhost/api/routes?from=6.9344%2C79.8428&to=6.8649%2C79.8997",
      { headers: { "x-real-ip": "192.0.2.143" } }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("schematic");
    expect(body.routes.length).toBeGreaterThan(0);
    expect(body.routes.every((route: { source: string }) => route.source === "schematic")).toBe(true);
    expect(body.message).toContain("not roads");
    expect(body.message).toContain("must not be used for navigation");
  });

  it("ranks the shortest provider-returned candidate by distance", async () => {
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify({code:"Ok",routes:[
      {distance:12000,duration:900,geometry:{coordinates:[[79.8428,6.9344],[79.8997,6.8649]]}},
      {distance:9000,duration:1100,geometry:{coordinates:[[79.8428,6.9344],[79.86,6.88],[79.8997,6.8649]]}}
    ]}),{status:200})));
    const request=new NextRequest("http://localhost/api/routes?from=6.9344%2C79.8428&to=6.8649%2C79.8997&priority=shortest&limit=1",{headers:{"x-real-ip":"192.0.2.145"}});
    const response=await GET(request),body=await response.json();
    expect(response.status).toBe(200);expect(body.routes).toHaveLength(1);expect(body.routes[0].distanceKm).toBe(9);expect(body.message).toContain("shortest");
  });
});
