"use client";

import { useState } from "react";
import { Bottone } from "@/components/ui";

/** Chiede una scansione fuori calendario. Va in coda; il report arriva via email. */
export function RichiediScansione({ attivitaId, disponibili }: { attivitaId: string; disponibili: number }) {
  const [stato, setStato] = useState<"fermo" | "invio" | "inCoda" | "errore">("fermo");
  const [messaggio, setMessaggio] = useState("");

  async function richiedi() {
    setStato("invio");
    try {
      const r = await fetch("/api/scansioni", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attivitaId }),
      });
      const dati = (await r.json()) as { stato?: string; errore?: string; minuti?: number };
      if (!r.ok) throw new Error(dati.errore ?? "Errore sconosciuto.");
      setMessaggio(`In coda. Il report arriva via email tra circa ${dati.minuti ?? 3} minuti.`);
      setStato("inCoda");
    } catch (e) {
      setStato("errore");
      setMessaggio(e instanceof Error ? e.message : "Non siamo riusciti a mettere in coda la scansione.");
    }
  }

  if (stato === "inCoda") {
    return (
      <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-ink" role="status">
        {messaggio}
      </p>
    );
  }

  return (
    <div>
      <Bottone type="button" onClick={richiedi} disabled={stato === "invio" || disponibili === 0} className="w-full sm:w-full">
        {stato === "invio" ? "Metto in coda…" : "Richiedi una scansione ora"}
      </Bottone>
      <p className="mt-2 text-xs text-muted">
        {disponibili > 0 ? `${disponibili} scansioni extra disponibili questo mese, oltre a quella programmata.` : "Hai usato le scansioni extra di questo mese."}
      </p>
      {stato === "errore" && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {messaggio}
        </p>
      )}
    </div>
  );
}
