import { createClient } from "@supabase/supabase-js";

/** Client con la chiave di servizio: solo lato server (webhook, coda). Salta la RLS. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
