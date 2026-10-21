import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Il link magico torna qui con un codice: lo scambiamo con la sessione. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const codice = url.searchParams.get("code");
  const prossima = url.searchParams.get("prossima") ?? "/area";
  const destinazione = prossima.startsWith("/") ? prossima : "/area";

  if (codice) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(codice);
    if (!error) return NextResponse.redirect(new URL(destinazione, url.origin));
  }
  return NextResponse.redirect(new URL("/accedi?errore=link", url.origin));
}
