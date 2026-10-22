import { NextResponse, after } from "next/server";
import { config } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { deposito } from "@/lib/scansione/deposito";
import { avanzamentoDi, segnaPagata } from "@/lib/scansione/coda";
import { avviaAvanzamento } from "@/lib/scansione/innesco";

/**
 * Stato di una scansione, per la pagina che la segue.
 * Con `?sessione=` (il ritorno da Stripe) verifica la sessione di pagamento:
 * se è pagata e il webhook non è ancora arrivato, fa partire la scansione.
 */
export async function GET(req: Request, ctx: RouteContext<"/api/scansioni/[id]">) {
  const { id } = await ctx.params;
  let s = await deposito().leggiScansione(id);
  if (!s) return NextResponse.json({ errore: "Scansione non trovata." }, { status: 404 });

  const sessioneId = new URL(req.url).searchParams.get("sessione");
  if (s.stato === "in attesa di pagamento" && sessioneId && config.stripe) {
    try {
      const sessione = await stripe().checkout.sessions.retrieve(sessioneId);
      if (sessione.metadata?.scansioneId === id && sessione.payment_status === "paid") {
        const pagata = await segnaPagata(id, sessioneId);
        if (pagata) {
          s = pagata;
          if (!s.simulata && s.stato === "in corso") after(() => avviaAvanzamento(id));
        }
      }
    } catch (e) {
      console.error("verifica sessione", e);
    }
  }

  return NextResponse.json(avanzamentoDi(s), { headers: { "Cache-Control": "no-store" } });
}
