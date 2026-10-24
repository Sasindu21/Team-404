import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../app/api/alerts/route";

const validFeed = (item: string) => `
  <rss version="2.0">
    <channel>
      <title>Weather warnings</title>
      ${item}
    </channel>
  </rss>
`;
const alertRequest = () => new NextRequest("http://localhost/api/alerts", { headers: { "x-real-ip": "192.0.2.42" } });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("GET /api/alerts", () => {
  it("returns parsed notices and only links to official HTTPS hosts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(validFeed(`
      <item>
        <title>Heavy rain</title>
        <description><![CDATA[Rain expected <b>today</b>]]></description>
        <link>https://was.meteo.gov.lk/warnings/1</link>
        <guid>warning-1</guid>
        <pubDate>Sat, 24 Oct 2026 08:00:00 GMT</pubDate>
      </item>
      <item>
        <title>Unsafe link</title>
        <link>https://evilmeteo.gov.lk/fake</link>
      </item>
    `), { status: 200 })));

    const response = await GET(alertRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("live");
    expect(body.alerts).toHaveLength(2);
    expect(body.alerts[0].description).toBe("Rain expected today");
    expect(body.alerts[0].link).toBe("https://was.meteo.gov.lk/warnings/1");
    expect(body.alerts[1].link).toBe("https://was.meteo.gov.lk/");
  });

  it("serves a clearly marked stale snapshot when malformed XML follows a successful fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<rss><channel></rss>", { status: 200 })));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET(alertRequest());
    const body = await response.json();

    expect(body.status).toBe("stale");
    expect(body.alerts).toHaveLength(2);
    expect(body.message).toContain("may be outdated");
    expect(console.error).toHaveBeenCalledOnce();
  });

  it("skips irregular non-object feed items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(validFeed(`
      <item>unexpected text entry</item>
      <item><title>Coastal advisory</title><link>http://meteo.gov.lk/warning</link></item>
    `), { status: 200 })));

    const response = await GET(alertRequest());
    const body = await response.json();

    expect(body.status).toBe("live");
    expect(body.alerts).toHaveLength(1);
    expect(body.alerts[0].title).toBe("Coastal advisory");
    expect(body.alerts[0].link).toBe("https://was.meteo.gov.lk/");
  });
});
