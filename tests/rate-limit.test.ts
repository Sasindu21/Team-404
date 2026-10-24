import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { checkRateLimit } from "../lib/rate-limit";

describe("API rate limiting", () => {
  it("limits requests per client and resets after the time window", () => {
    const request = (ip: string) => new NextRequest("http://localhost/api/test", {
      headers: { "x-real-ip": ip }
    });

    expect(checkRateLimit(request("192.0.2.100"), "test-window", 1, 1000, 5000)).toMatchObject({
      allowed: true,
      remaining: 0
    });
    expect(checkRateLimit(request("192.0.2.100"), "test-window", 1, 1000, 5500)).toMatchObject({
      allowed: false,
      retryAfterSeconds: 1
    });
    expect(checkRateLimit(request("192.0.2.100"), "test-window", 1, 1000, 6000)).toMatchObject({
      allowed: true,
      remaining: 0
    });
    expect(checkRateLimit(request("192.0.2.101"), "test-window", 1, 1000, 5500).allowed).toBe(true);
  });

  it("separates originating clients that share a reverse proxy", () => {
    const request = (chain: string) => new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": chain }
    });
    expect(checkRateLimit(request("198.51.100.10, 10.0.0.1"), "proxy-test", 1, 60_000, 5000).allowed).toBe(true);
    expect(checkRateLimit(request("198.51.100.11, 10.0.0.1"), "proxy-test", 1, 60_000, 5000).allowed).toBe(true);
  });
});
