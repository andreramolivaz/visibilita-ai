import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { PIANI, type Periodo, type PianoId } from "@/lib/prezzi";

/**
 * Crea una sessione Stripe Checkout in abbonamento.
 * I prezzi arrivano da src/lib/prezzi.ts (price_data): niente ID da
 * configurare su Stripe, basta la chiave segreta.
 */
export async function POST(req: Request) {
  if (!config.stripe) {
    return NextResponse.json(
      { errore: "I pagamenti non sono ancora attivi su questo ambiente." },
      { status: 503 },
    );
  }

  let body: { piano?: PianoId; periodo?: Periodo; email?: string; reportId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errore: "Richiesta non valida." }, { status: 400 });
  }

  const piano = PIANI.find((p) => p.id === body.piano);
  const periodo: Periodo = body.periodo === "annuale" ? "annuale" : "mensile";
  if (!piano) return NextResponse.json({ errore: "Piano sconosciuto." }, { status: 400 });

  const importo = periodo === "annuale" ? piano.annuale : piano.mensile;
  const base = config.siteUrl;
  const ritorno = body.reportId ? `/report/${encodeURIComponent(body.reportId)}` : "/prezzi";

  try {
    const sessione = await stripe().checkout.sessions.create({
      mode: "subscription",
      locale: "it",
      customer_email: body.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: importo * 100,
            recurring: { interval: periodo === "annuale" ? "year" : "month" },
            product_data: {
              name: piano.stripeNome,
              description: piano.perChi,
            },
          },
        },
      ],
      // IVA: Stripe Tax calcola l'aliquota dal paese del cliente, se attivo sull'account.
      automatic_tax: { enabled: process.env.STRIPE_TAX === "1" },
      tax_id_collection: { enabled: true },
      billing_address_collection: "required",
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { piano: piano.id, periodo, reportId: body.reportId ?? "" },
      },
      metadata: { piano: piano.id, periodo, reportId: body.reportId ?? "" },
      success_url: `${base}/abbonamento/grazie?sessione={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${ritorno}`,
    });
    return NextResponse.json({ url: sessione.url });
  } catch (e) {
    console.error("checkout", e);
    return NextResponse.json({ errore: "Non siamo riusciti ad aprire il pagamento. Riprova tra un minuto." }, { status: 500 });
  }
}
