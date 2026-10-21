import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { utenteCorrente } from "@/lib/supabase/server";

/**
 * Mette in coda una scansione fuori calendario per un'attività.
 * TODO: inserire nella tabella `scansioni` e far partire il worker.
 */
export async function POST(req: Request) {
  let body: { attivitaId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errore: "Richiesta non valida." }, { status: 400 });
  }
  if (!body.attivitaId) return NextResponse.json({ errore: "Attività mancante." }, { status: 400 });

  if (config.supabase) {
    const utente = await utenteCorrente();
    if (!utente) return NextResponse.json({ errore: "Devi prima accedere." }, { status: 401 });
  }

  const id = `scan-${Date.now().toString(36)}`;
  return NextResponse.json({ id, stato: "in coda", minuti: 3 });
}
