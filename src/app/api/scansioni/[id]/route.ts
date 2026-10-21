import { NextResponse } from "next/server";
import { deposito } from "@/lib/scansione/deposito";
import { avanzamentoDi } from "@/lib/scansione/coda";

/** Stato di una scansione, per la pagina che la segue. */
export async function GET(_req: Request, ctx: RouteContext<"/api/scansioni/[id]">) {
  const { id } = await ctx.params;
  const s = await deposito().leggiScansione(id);
  if (!s) return NextResponse.json({ errore: "Scansione non trovata." }, { status: 404 });
  return NextResponse.json(avanzamentoDi(s), { headers: { "Cache-Control": "no-store" } });
}
