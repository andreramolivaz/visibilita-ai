import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

/** Client Supabase lato server, con la sessione dell'utente nei cookie. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) store.set(name, value, options);
        } catch {
          // In un Server Component i cookie sono in sola lettura: li scrive il proxy.
        }
      },
    },
  });
}

/** L'utente che ha fatto accesso, o null. */
export async function utenteCorrente() {
  if (!config.supabase) return null;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
