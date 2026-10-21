import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Pagina } from "@/components/ui";
import { utenteCorrente } from "@/lib/supabase/server";
import { abbonamentoDi } from "@/lib/supabase/abbonamenti";
import { AreaPersonale } from "@/components/area/AreaPersonale";
import { datiAreaEsempio } from "@/lib/mock-area";

export const metadata: Metadata = { title: "Area personale" };

export default function Area() {
  return (
    <Pagina larga>
      <Suspense fallback={<p className="text-muted">Carico la tua area…</p>}>
        <Contenuto />
      </Suspense>
    </Pagina>
  );
}

async function Contenuto() {
  const utente = await utenteCorrente();
  if (!utente?.email) redirect("/accedi");

  const abb = await abbonamentoDi(utente.email);
  // TODO: attività, storico e domande dalle tabelle `attivita` e `report`.
  const dati = datiAreaEsempio(utente.email);
  if (abb) {
    dati.pianoId = abb.piano;
    dati.periodo = abb.periodo;
    dati.statoAbbonamento = abb.stato === "canceled" ? "disdetto" : "attivo";
    dati.rinnovoIl = abb.rinnovo_il ?? undefined;
  } else {
    dati.statoAbbonamento = "nessuno";
  }
  return <AreaPersonale dati={dati} />;
}
