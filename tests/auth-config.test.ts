import {describe,expect,it} from "vitest";
import {safeRedirect} from "../lib/supabase/config";
describe("authentication redirect safety",()=>{
  it("accepts internal paths",()=>expect(safeRedirect("/profile?tab=routes")).toBe("/profile?tab=routes"));
  it("rejects external and malformed destinations",()=>{expect(safeRedirect("//evil.example")).toBe("/dashboard");expect(safeRedirect("https://evil.example")).toBe("/dashboard");expect(safeRedirect("/\\evil.example")).toBe("/dashboard");});
});
