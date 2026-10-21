import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { utenteCorrente } from "@/lib/supabase/server";
import { abbonamentoDi } from "@/lib/supabase/abbonamenti";

/** Apre il portale Stripe: cambio carta, fatture, disdetta. Solo per chi è entrato. */
export async function POST() {
  if (!config.stripe || !config.supabase) {
    return NextResponse.json({ errore: "Non disponibile su questo ambiente." }, { status: 503 });
  }
  const utente = await utenteCorrente();
  if (!utente?.email) return NextResponse.json({ errore: "Devi prima accedere." }, { status: 401 });

  const abb = await abbonamentoDi(utente.email);
  if (!abb?.stripe_customer_id) {
    return NextResponse.json({ errore: "Nessun abbonamento collegato a questa email." }, { status: 404 });
  }

  const portale = await stripe().billingPortal.sessions.create({
    customer: abb.stripe_customer_id,
    return_url: `${config.siteUrl}/area`,
    locale: "it",
  });
  return NextResponse.json({ url: portale.url });
}
