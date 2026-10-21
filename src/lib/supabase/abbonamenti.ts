import { supabaseAdmin } from "./admin";
import type { PianoId, Periodo } from "@/lib/prezzi";

export interface Abbonamento {
  email: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  piano: PianoId;
  periodo: Periodo;
  stato: string;
  rinnovo_il: string | null;
  report_id: string | null;
  disdetto_il: string | null;
}

/** Scrive o aggiorna un abbonamento (tabella `abbonamenti`, vedi supabase/schema.sql). */
export async function salvaAbbonamento(a: {
  email?: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  piano: PianoId;
  periodo: Periodo;
  stato: string;
  rinnovoIl: string | null;
  reportId?: string | null;
}) {
  const sb = supabaseAdmin();
  if (!sb) {
    console.warn("Supabase non configurato: abbonamento non salvato", a.stripeSubscriptionId);
    return;
  }
  const riga: Record<string, unknown> = {
    stripe_customer_id: a.stripeCustomerId,
    stripe_subscription_id: a.stripeSubscriptionId,
    piano: a.piano,
    periodo: a.periodo,
    stato: a.stato,
    rinnovo_il: a.rinnovoIl,
    aggiornato_il: new Date().toISOString(),
  };
  if (a.email) riga.email = a.email.toLowerCase();
  if (a.reportId) riga.report_id = a.reportId;

  const { error } = await sb.from("abbonamenti").upsert(riga, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

export async function segnaAbbonamentoDisdetto(stripeSubscriptionId: string) {
  const sb = supabaseAdmin();
  if (!sb) return;
  const { error } = await sb
    .from("abbonamenti")
    .update({ stato: "canceled", disdetto_il: new Date().toISOString() })
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error) throw error;
}

/** L'abbonamento più recente di un'email, o null. */
export async function abbonamentoDi(email: string): Promise<Abbonamento | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("abbonamenti")
    .select("*")
    .eq("email", email.toLowerCase())
    .order("aggiornato_il", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Abbonamento | null) ?? null;
}
