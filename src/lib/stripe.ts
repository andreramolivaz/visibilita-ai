import Stripe from "stripe";

let client: Stripe | null = null;

/** Client Stripe, creato alla prima richiesta così il build passa senza chiavi. */
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY mancante");
  if (!client) client = new Stripe(key, { typescript: true });
  return client;
}
