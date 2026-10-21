import { NextResponse, after } from "next/server";
import { avanza } from "@/lib/scansione/coda";
import { avviaAvanzamento, innescoAutorizzato } from "@/lib/scansione/innesco";

/**
 * Esegue un lotto di celle scadute di una scansione. Se ne restano, si richiama
 * dopo aver risposto. Chiamata dalla creazione, dal passaggio giornaliero e da sé stessa.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/scansioni/[id]/avanza">) {
  if (!innescoAutorizzato(req)) return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  const { id } = await ctx.params;
  const esito = await avanza(id);
  if (!esito) return NextResponse.json({ errore: "Scansione non trovata." }, { status: 404 });
  if (esito.restano > 0) after(() => avviaAvanzamento(id));
  return NextResponse.json(esito);
}
