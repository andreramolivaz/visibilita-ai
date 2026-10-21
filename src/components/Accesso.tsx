"use client";

import { useState } from "react";
import { Bottone, Campo } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Accesso con link magico: scrivi l'email, ricevi un link, entri. Niente password. */
export function Accesso({ attivo }: { attivo: boolean }) {
  const [email, setEmail] = useState("");
  const [stato, setStato] = useState<"fermo" | "invio" | "inviato" | "errore">("fermo");
  const [messaggio, setMessaggio] = useState("");

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    if (!attivo) {
      setStato("errore");
      setMessaggio("L'accesso si attiva al lancio, insieme agli abbonamenti.");
      return;
    }
    setStato("invio");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?prossima=/area` },
    });
    if (error) {
      setStato("errore");
      setMessaggio("Non siamo riusciti a mandare il link. Controlla l'email e riprova.");
      return;
    }
    setStato("inviato");
  }

  if (stato === "inviato") {
    return (
      <div className="rounded-2xl bg-accent-soft p-6">
        <h2 className="text-lg font-semibold text-accent-ink">Controlla la posta</h2>
        <p className="mt-1 text-[15px]">
          Abbiamo mandato un link a <span className="font-medium">{email}</span>. Aprilo da questo
          dispositivo e sei dentro. Vale 1 ora.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={invia} className="space-y-3">
      <label htmlFor="email" className="block text-sm font-medium">
        La tua email
      </label>
      <Campo
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nome@attivita.it"
      />
      <Bottone type="submit" disabled={stato === "invio"} className="w-full sm:w-full">
        {stato === "invio" ? "Invio il link…" : "Mandami il link di accesso"}
      </Bottone>
      {stato === "errore" && (
        <p className="text-sm text-danger" role="alert">
          {messaggio}
        </p>
      )}
      <p className="text-sm text-muted">Niente password: entri con il link che ti mandiamo via email.</p>
    </form>
  );
}
