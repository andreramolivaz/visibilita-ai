import { NextResponse, after } from "next/server";
import { config } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { utenteCorrente } from "@/lib/supabase/server";
import { creaScansione } from "@/lib/scansione/coda";
import { deposito } from "@/lib/scansione/deposito";
import { avviaAvanzamento } from "@/lib/scansione/innesco";
import { domandePer } from "@/lib/profilo";
import { REPORT_SINGOLO } from "@/lib/prezzi";
import type { ProfiloAttivita, SegnaliProfilo } from "@/lib/types";

const MAX_GIORNO = Number(process.env.MAX_TEST_GRATUITI_AL_GIORNO ?? 100);

/**
 * Avvia un report singolo.
 * Il profilo e i segnali arrivano dalla conferma; le domande le genera il
 * server (sono il metodo: il titolare non le vede né le cambia).
 * Con Stripe attivo la scansione nasce «in attesa di pagamento» e parte quando
 * il pagamento è confermato (webhook, o verifica della sessione al ritorno).
 * Senza Stripe parte subito: con gli assistenti configurati è vera, altrimenti
 * è una dimostrazione con il report di esempio.
 */
export async function POST(req: Request) {
  let body: { attivitaId?: string; attivita?: ProfiloAttivita; segnali?: SegnaliProfilo; recensioni?: string[]; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errore: "Richiesta non valida." }, { status: 400 });
  }

  if (body.attivitaId) {
    if (config.supabase) {
      const utente = await utenteCorrente();
      if (!utente) return NextResponse.json({ errore: "Devi prima accedere." }, { status: 401 });
    }
    // TODO: caricare l'attività dalla tabella `attivita` e creare la scansione con il piano dell'abbonamento.
    return NextResponse.json({ id: `scan-${Date.now().toString(36)}`, stato: "in coda", minuti: 3 });
  }

  const { attivita, segnali } = body;
  if (!attivita?.nome || !attivita.citta || !segnali) {
    return NextResponse.json({ errore: "Profilo mancante: torna alla conferma." }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (config.stripe && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ errore: "Serve un'email valida per ricevere il report." }, { status: 400 });
  }
  // Mai far pagare una dimostrazione: con Stripe attivo servono gli assistenti.
  if (config.stripe && config.motori === 0) {
    return NextResponse.json({ errore: "Gli assistenti non sono ancora collegati su questo ambiente: il report a pagamento non è disponibile." }, { status: 503 });
  }

  const dep = deposito();
  if (!config.stripe && config.motori > 0 && (await dep.testGratuitiOggi()) >= MAX_GIORNO) {
    return NextResponse.json({ errore: "Le scansioni di oggi sono finite: riprova domani." }, { status: 429 });
  }

  const domande = await domandePer(attivita, segnali, "singolo");
  const s = await creaScansione({ piano: "singolo", attivita, domande, segnali, recensioni: body.recensioni, email, attesaPagamento: config.stripe });

  if (config.stripe) {
    const base = config.siteUrl;
    try {
      const sessione = await stripe().checkout.sessions.create({
        mode: "payment",
        locale: "it",
        customer_email: email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: REPORT_SINGOLO.prezzo * 100,
              product_data: { name: REPORT_SINGOLO.stripeNome, description: `${attivita.nome}, ${attivita.citta}` },
            },
          },
        ],
        automatic_tax: { enabled: process.env.STRIPE_TAX === "1" },
        tax_id_collection: { enabled: true },
        billing_address_collection: "required",
        invoice_creation: { enabled: true },
        metadata: { scansioneId: s.id, tipo: "report-singolo" },
        payment_intent_data: { metadata: { scansioneId: s.id, tipo: "report-singolo" } },
        success_url: `${base}/scansione?id=${encodeURIComponent(s.id)}&sessione={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/conferma?q=${encodeURIComponent(`${attivita.nome}, ${attivita.citta}`)}`,
      });
      return NextResponse.json({ id: s.id, url: sessione.url });
    } catch (e) {
      console.error("checkout report singolo", e);
      return NextResponse.json({ errore: "Non siamo riusciti ad aprire il pagamento. Riprova tra un minuto." }, { status: 500 });
    }
  }

  await dep.registraTestGratuito({ placeId: attivita.placeId, nome: attivita.nome, citta: attivita.citta, scansioneId: s.id });
  if (!s.simulata) after(() => avviaAvanzamento(s.id));
  return NextResponse.json({ id: s.id, simulata: s.simulata, totale: s.celle.length, url: `/scansione?id=${encodeURIComponent(s.id)}` });
}
