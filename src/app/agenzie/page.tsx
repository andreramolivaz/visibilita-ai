import type { Metadata } from "next";
import { Bottone, Pagina, Titolo } from "@/components/ui";
import { piano, euro } from "@/lib/prezzi";

export const metadata: Metadata = { title: "Per le agenzie" };

export default function Agenzie() {
  const ag = piano("agenzia");
  return (
    <Pagina larga>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="max-w-xl">
          <Titolo>Vendi la visibilità AI ai tuoi clienti, con il tuo logo</Titolo>
          <p className="mt-4 text-lg text-muted">
            Per web agency e freelance: report GEO (ottimizzazione per i motori generativi) per i tuoi
            clienti locali, pronti da inviare, con il tuo marchio al posto del nostro.
          </p>
          <ul className="mt-8 space-y-3 text-[17px]">
            {[
              "Elenco attività con punteggio e variazione mensile",
              "PDF in white-label, due pagine, con il tuo logo",
              "Un link cliente per ogni attività",
              "Export CSV per i tuoi report",
              "Un argomento nuovo per il rinnovo: «ChatGPT non ti cita, ci pensiamo noi»",
            ].map((v) => (
              <li key={v} className="flex gap-3">
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                {v}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Bottone href="/prezzi#agenzia">Attiva il piano Agenzia</Bottone>
            <Bottone href="/report/esempio" secondario>
              Guarda un report
            </Bottone>
          </div>
        </div>
        <div className="rounded-2xl bg-soft p-6 sm:p-8">
          <p className="text-sm text-muted">Piano Agenzia</p>
          <p className="mt-2">
            <span className="tabular text-5xl font-bold tracking-tight">{euro(ag.mensile)}</span>
            <span className="ml-2 text-muted">al mese + IVA</span>
          </p>
          <p className="tabular mt-1 text-sm text-muted">Oppure {euro(ag.annuale)} all&apos;anno, due mesi gratis.</p>
          <ul className="mt-5 space-y-2 text-[15px]">
            {ag.include.map((i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                {i}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">
            Con dieci clienti a {euro(59)} al mese ciascuno rientri del piano e del tuo tempo nel primo
            mese.
          </p>
        </div>
      </div>
    </Pagina>
  );
}
