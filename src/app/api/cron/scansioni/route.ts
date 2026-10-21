import { NextResponse, after } from "next/server";
import { scansioniDaAvanzare } from "@/lib/scansione/coda";
import { avviaAvanzamento, innescoAutorizzato } from "@/lib/scansione/innesco";

/**
 * Passaggio giornaliero (Vercel Cron): fa partire le ripetizioni dei giorni
 * successivi e riprende le scansioni rimaste a metà.
 */
export async function GET(req: Request) {
  if (!innescoAutorizzato(req)) return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  const ids = (await scansioniDaAvanzare()).slice(0, 50);
  after(async () => {
    for (const id of ids) await avviaAvanzamento(id);
  });
  return NextResponse.json({ avviate: ids.length });
}
