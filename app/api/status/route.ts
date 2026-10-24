import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/supabase/config";
export async function GET() {
  return NextResponse.json({ aiConfigured: Boolean(process.env.GEMINI_API_KEY), orsConfigured: Boolean(process.env.ORS_API_KEY), authConfigured: isAuthConfigured() }, { headers: { "Cache-Control": "no-store" } });
}
