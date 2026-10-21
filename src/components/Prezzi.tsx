"use client";

import { useState } from "react";
import { PIANI, SISTEMAZIONE, TEST_GRATUITO, euro, type Periodo } from "@/lib/prezzi";
import { Checkout } from "@/components/Checkout";
import { Bottone } from "@/components/ui";

export function Prezzi({ pagamentiAttivi }: { pagamentiAttivi: boolean }) {
  const [periodo, setPeriodo] = useState<Periodo>("mensile");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted">Prezzi IVA esclusa. Disdici quando vuoi dall&apos;area personale.</p>
        <div
          role="radiogroup"
          aria-label="Periodo di fatturazione"
          className="inline-flex rounded-lg border border-line p-1 text-sm font-semibold"
        >
          {(["mensile", "annuale"] as Periodo[]).map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={periodo === p}
              onClick={() => setPeriodo(p)}
              className={`rounded-md px-3.5 py-1.5 transition-colors ${
                periodo === p ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {p === "mensile" ? "Mensile" : "Annuale, due mesi gratis"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {PIANI.map((p) => {
          const importo = periodo === "annuale" ? p.annuale : p.mensile;
          return (
            <section
              key={p.id}
              id={p.id}
              className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
                p.evidenza ? "border-accent ring-1 ring-accent" : "border-line"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{p.nome}</h2>
                {p.evidenza && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
                    Il più scelto
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{p.perChi}</p>
              <p className="mt-5">
                <span className="tabular text-5xl font-bold tracking-tight">{euro(importo)}</span>
                <span className="ml-2 text-sm text-muted">{periodo === "annuale" ? "all'anno" : "al mese"}</span>
              </p>
              {periodo === "annuale" ? (
                <p className="tabular mt-1 text-sm text-muted">
                  Come {euro(Math.round(p.annuale / 12))} al mese. Risparmi {euro(p.mensile * 12 - p.annuale)}.
                </p>
              ) : (
                <p className="tabular mt-1 text-sm text-muted">Oppure {euro(p.annuale)} all&apos;anno.</p>
              )}
              <ul className="mt-6 flex-1 space-y-2 text-[15px]">
                {p.include.map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-0.5 text-accent" aria-hidden="true">
                      ✓
                    </span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <Checkout piano={p.id} periodo={periodo} secondario={!p.evidenza} attivo={pagamentiAttivi} className="mt-7">
                Attiva {p.nome}
              </Checkout>
              <p className="mt-2 text-center text-xs text-faint">Parti dal test gratuito, poi scegli il piano dal report.</p>
            </section>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-line p-6 sm:p-7">
          <h2 className="text-lg font-semibold">Test gratuito</h2>
          <p className="mt-1 text-sm text-muted">
            {TEST_GRATUITO.domande} domande su {TEST_GRATUITO.motori} motori, {TEST_GRATUITO.ripetizioni} ripetizioni.
            Un test per attività ogni {TEST_GRATUITO.ogniGiorni} giorni, senza registrazione.
          </p>
          <div className="mt-4">
            <Bottone href="/#test" secondario>
              Fai il test
            </Bottone>
          </div>
        </section>
        <section className="rounded-2xl bg-soft p-6 sm:p-7">
          <h2 className="text-lg font-semibold">
            {SISTEMAZIONE.nome} <span className="tabular font-normal text-muted">· {euro(SISTEMAZIONE.prezzo)} una tantum</span>
          </h2>
          <p className="mt-1 text-sm text-muted">{SISTEMAZIONE.testo}</p>
          <div className="mt-4">
            <Bottone href="mailto:ciao@visibilita-ai.it?subject=Sistemazione" secondario>
              Chiedi la sistemazione
            </Bottone>
          </div>
        </section>
      </div>
    </div>
  );
}
