import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (config.supabase) {
    const sb = await supabaseServer();
    await sb.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", new URL(req.url).origin), { status: 303 });
}
