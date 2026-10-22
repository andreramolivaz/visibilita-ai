"use client";

import { useState } from "react";
import { PIANI, REPORT_SINGOLO, SISTEMAZIONE, euro, type Periodo } from "@/lib/prezzi";
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
              className={`flex flex-col rounded-2xl p-6 sm:p-7 ${p.evidenza ? "bg-ink text-white" : "border border-line"}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{p.nome}</h2>
                {p.evidenza && <span className="rounded-full bg-[#9fe8c6] px-2.5 py-0.5 text-xs font-semibold text-ink">Il più scelto</span>}
              </div>
              <p className={`mt-1 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>{p.perChi}</p>
              <p className="mt-5">
                <span className="tabular text-5xl font-bold tracking-tight">{euro(importo)}</span>
                <span className={`ml-2 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>{periodo === "annuale" ? "all'anno" : "al mese"}</span>
              </p>
              <p className={`tabular mt-1 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>
                {periodo === "annuale" ? (
                  <>
                    Come {euro(Math.round(p.annuale / 12))} al mese. Risparmi {euro(p.mensile * 12 - p.annuale)}.
                  </>
                ) : (
                  <>Oppure {euro(p.annuale)} all&apos;anno.</>
                )}
              </p>
              <ul className={`mt-6 flex-1 space-y-2 text-[15px] ${p.evidenza ? "text-white/85" : ""}`}>
                {p.include.map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className={`mt-0.5 ${p.evidenza ? "text-[#9fe8c6]" : "text-accent"}`} aria-hidden="true">
                      ✓
                    </span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <Checkout piano={p.id} periodo={periodo} secondario={!p.evidenza} suScuro={p.evidenza} attivo={pagamentiAttivi} className="mt-7">
                Attiva {p.nome}
              </Checkout>
              <p className={`mt-2 text-center text-xs ${p.evidenza ? "text-white/50" : "text-faint"}`}>Il primo report arriva in pochi minuti; i successivi {p.cadenza}.</p>
            </section>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section id="singolo" className="rounded-2xl border border-line p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">{REPORT_SINGOLO.nome}</h2>
            <p>
              <span className="tabular text-3xl font-bold tracking-tight">{euro(REPORT_SINGOLO.prezzo)}</span> <span className="text-sm text-muted">una tantum</span>
            </p>
          </div>
          <p className="mt-1 text-sm text-muted">Una scansione completa oggi, senza abbonamento. Se poi ti abboni entro 30 giorni, viene scalato dal primo mese.</p>
          <ul className="mt-4 space-y-1.5 text-[15px]">
            {REPORT_SINGOLO.include.map((i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 text-accent" aria-hidden="true">
                  ✓
                </span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <Bottone href="/#test">Avvia il report</Bottone>
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
