import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../app/api/geocode/route";

afterEach(()=>vi.unstubAllGlobals());

describe("GET /api/geocode",()=>{
  it("rejects short searches without calling the provider",async()=>{
    const fetchMock=vi.fn();vi.stubGlobal("fetch",fetchMock);
    const response=await GET(new NextRequest("http://localhost/api/geocode?q=ab",{headers:{"x-real-ip":"192.0.2.70"}}));
    expect((await response.json()).results).toEqual([]);expect(fetchMock).not.toHaveBeenCalled();
  });
  it("keeps only valid Sri Lankan provider results",async()=>{
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify([
      {display_name:"Kandy, Sri Lanka",lat:"7.2906",lon:"80.6337",type:"city"},
      {display_name:"Outside",lat:"20",lon:"80",type:"city"}
    ]),{status:200})));
    const response=await GET(new NextRequest("http://localhost/api/geocode?q=Kandy",{headers:{"x-real-ip":"192.0.2.71"}}));
    const body=await response.json();expect(body.results).toHaveLength(1);expect(body.results[0].point).toEqual([7.2906,80.6337]);
  });
});
