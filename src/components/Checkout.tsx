"use client";

import { useState } from "react";
import { Bottone } from "@/components/ui";
import type { Periodo, PianoId } from "@/lib/prezzi";

/**
 * Bottone che apre Stripe Checkout. Se i pagamenti non sono attivi,
 * dice perché invece di fingere.
 */
export function Checkout({
  piano,
  periodo,
  email,
  reportId,
  children,
  secondario,
  className = "",
  attivo,
  suScuro = false,
}: {
  piano: PianoId;
  periodo: Periodo;
  email?: string;
  reportId?: string;
  children: React.ReactNode;
  secondario?: boolean;
  className?: string;
  /** Pagamenti configurati sul server. */
  attivo: boolean;
  /** Dentro una scheda scura: bottone menta, errore chiaro. */
  suScuro?: boolean;
}) {
  const [stato, setStato] = useState<"fermo" | "apro" | "errore">("fermo");
  const [messaggio, setMessaggio] = useState("");

  async function apri() {
    if (!attivo) {
      setStato("errore");
      setMessaggio("I pagamenti si attivano al lancio. Lasciaci l'email e ti avvisiamo.");
      return;
    }
    setStato("apro");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ piano, periodo, email, reportId }),
      });
      const dati = (await r.json()) as { url?: string; errore?: string };
      if (!r.ok || !dati.url) throw new Error(dati.errore ?? "Errore sconosciuto.");
      window.location.assign(dati.url);
    } catch (e) {
      setStato("errore");
      setMessaggio(e instanceof Error ? e.message : "Non siamo riusciti ad aprire il pagamento.");
    }
  }

  return (
    <div className={className}>
      <Bottone
        type="button"
        onClick={apri}
        disabled={stato === "apro"}
        secondario={secondario}
        className={`w-full sm:w-full ${suScuro ? "!bg-[#9fe8c6] !text-ink hover:!bg-[#b8f0d6]" : ""}`}
      >
        {stato === "apro" ? "Apro il pagamento…" : children}
      </Bottone>
      {stato === "errore" && (
        <p className={`mt-2 text-sm ${suScuro ? "text-[#ffb4ad]" : "text-danger"}`} role="alert">
          {messaggio}
        </p>
      )}
    </div>
  );
}
