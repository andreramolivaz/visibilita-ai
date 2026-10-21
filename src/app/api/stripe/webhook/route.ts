import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { salvaAbbonamento, segnaAbbonamentoDisdetto } from "@/lib/supabase/abbonamenti";

/**
 * Webhook Stripe. Da registrare su Stripe con l'URL
 *   https://<dominio>/api/stripe/webhook
 * ed eventi: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted, invoice.payment_failed.
 */
export async function POST(req: Request) {
  const segreto = process.env.STRIPE_WEBHOOK_SECRET;
  const firma = req.headers.get("stripe-signature");
  if (!segreto || !firma) return NextResponse.json({ errore: "Webhook non configurato." }, { status: 503 });

  let evento: Stripe.Event;
  try {
    const corpo = await req.text();
    evento = stripe().webhooks.constructEvent(corpo, firma, segreto);
  } catch (e) {
    console.error("webhook firma", e);
    return NextResponse.json({ errore: "Firma non valida." }, { status: 400 });
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const s = evento.data.object;
        if (s.mode !== "subscription" || !s.subscription) break;
        const abb = await stripe().subscriptions.retrieve(String(s.subscription));
        await salvaAbbonamento({
          email: s.customer_details?.email ?? s.customer_email ?? "",
          stripeCustomerId: String(s.customer),
          stripeSubscriptionId: abb.id,
          piano: (s.metadata?.piano ?? abb.metadata?.piano ?? "base") as "base" | "pro" | "agenzia",
          periodo: (s.metadata?.periodo ?? "mensile") as "mensile" | "annuale",
          stato: abb.status,
          rinnovoIl: periodoCorrenteFine(abb),
          reportId: s.metadata?.reportId || null,
        });
        break;
      }
      case "customer.subscription.updated": {
        const abb = evento.data.object;
        await salvaAbbonamento({
          stripeCustomerId: String(abb.customer),
          stripeSubscriptionId: abb.id,
          piano: (abb.metadata?.piano ?? "base") as "base" | "pro" | "agenzia",
          periodo: (abb.metadata?.periodo ?? "mensile") as "mensile" | "annuale",
          stato: abb.status,
          rinnovoIl: periodoCorrenteFine(abb),
        });
        break;
      }
      case "customer.subscription.deleted": {
        const abb = evento.data.object;
        await segnaAbbonamentoDisdetto(abb.id);
        break;
      }
      case "invoice.payment_failed": {
        // TODO: email al titolare via Resend.
        console.warn("pagamento fallito", evento.data.object.id);
        break;
      }
    }
  } catch (e) {
    console.error("webhook", evento.type, e);
    return NextResponse.json({ errore: "Errore interno." }, { status: 500 });
  }

  return NextResponse.json({ ricevuto: true });
}

function periodoCorrenteFine(abb: Stripe.Subscription): string | null {
  const fine = abb.items.data[0]?.current_period_end;
  return fine ? new Date(fine * 1000).toISOString() : null;
}
