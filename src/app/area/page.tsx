import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Pagina } from "@/components/ui";
import { utenteCorrente } from "@/lib/supabase/server";
import { abbonamentoDi } from "@/lib/supabase/abbonamenti";
import { AreaPersonale } from "@/components/area/AreaPersonale";
import { datiAreaDaReport } from "@/lib/area";
import { deposito } from "@/lib/scansione/deposito";
import { CercaAttivita } from "@/components/CercaAttivita";

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

  const [abb, report] = await Promise.all([abbonamentoDi(utente.email), deposito().reportPerEmail(utente.email)]);
  const dati = datiAreaDaReport(utente.email, report);
  if (!dati) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-muted">{utente.email}</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">La tua area</h1>
        <p className="mt-3 text-muted">Nessun report collegato a questa email. Quando ne avvii uno con la stessa email, lo trovi qui con lo storico.</p>
        <div className="mt-6">
          <CercaAttivita grande id="area" />
        </div>
        <form action="/esci" method="post" className="mt-8">
          <button type="submit" className="text-sm text-muted underline underline-offset-2 hover:text-ink">
            Esci
          </button>
        </form>
      </div>
    );
  }
  if (abb) {
    dati.pianoId = abb.piano;
    dati.periodo = abb.periodo;
    dati.statoAbbonamento = abb.stato === "canceled" ? "disdetto" : "attivo";
    dati.rinnovoIl = abb.rinnovo_il ?? undefined;
  }
  return <AreaPersonale dati={dati} />;
}
