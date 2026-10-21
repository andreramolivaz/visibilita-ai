"use client";

import { useState } from "react";
import { Bottone } from "@/components/ui";

/** Apre il portale Stripe: carta, fatture, disdetta. */
export function Portale() {
  const [stato, setStato] = useState<"fermo" | "apro" | "errore">("fermo");
  const [messaggio, setMessaggio] = useState("");

  async function apri() {
    setStato("apro");
    try {
      const r = await fetch("/api/portale", { method: "POST" });
      const dati = (await r.json()) as { url?: string; errore?: string };
      if (!r.ok || !dati.url) throw new Error(dati.errore ?? "Errore sconosciuto.");
      window.location.assign(dati.url);
    } catch (e) {
      setStato("errore");
      setMessaggio(e instanceof Error ? e.message : "Non siamo riusciti ad aprire la gestione.");
    }
  }

  return (
    <div>
      <Bottone type="button" onClick={apri} disabled={stato === "apro"} secondario className="w-full sm:w-full">
        {stato === "apro" ? "Apro…" : "Fatture, carta e disdetta"}
      </Bottone>
      {stato === "errore" && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {messaggio}
        </p>
      )}
    </div>
  );
}
