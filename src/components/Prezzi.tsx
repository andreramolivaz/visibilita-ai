"use client";

import { useState } from "react";
import { PIANI, REPORT_SINGOLO, SISTEMAZIONE, euro, type Periodo } from "@/lib/prezzi";
import { Checkout } from "@/components/Checkout";
import { Bottone } from "@/components/ui";

export function Prezzi({ pagamentiAttivi }: { pagamentiAttivi: boolean }) {
  const [periodo, setPeriodo] = useState<Periodo>("mensile");

  return (
    <div>
      {/* Prima il report singolo: è da lì che si parte. */}
      <section id="singolo" className="flex flex-col gap-5 rounded-2xl border border-line p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{REPORT_SINGOLO.nome}</h2>
          <p className="mt-1 max-w-xl text-[15px] text-muted">
            Punteggio, chi consigliano al posto tuo, da dove prendono le informazioni e tre azioni. Online e in PDF, senza abbonamento; se poi ti abboni entro 30 giorni,
            viene scalato dal primo mese.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <p>
            <span className="tabular text-4xl font-bold tracking-tight">{euro(REPORT_SINGOLO.prezzo)}</span>
            <span className="ml-1.5 text-sm text-muted">una tantum</span>
          </p>
          <Bottone href="/#test" className="!w-auto">
            Avvia il report
          </Bottone>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Oppure ricevilo ogni mese</h2>
          <p className="mt-1 text-muted">Vedi se sali, se le azioni funzionano e se arriva un concorrente nuovo.</p>
        </div>
        <div role="radiogroup" aria-label="Periodo di fatturazione" className="inline-flex rounded-lg border border-line p-1 text-sm font-semibold">
          {(["mensile", "annuale"] as Periodo[]).map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={periodo === p}
              onClick={() => setPeriodo(p)}
              className={`rounded-md px-3.5 py-1.5 transition-colors ${periodo === p ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {p === "mensile" ? "Mensile" : "Annuale, 2 mesi in meno"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PIANI.map((p) => {
          const importo = periodo === "annuale" ? p.annuale : p.mensile;
          return (
            <section key={p.id} id={p.id} className={`flex flex-col rounded-2xl p-6 sm:p-7 ${p.evidenza ? "bg-ink text-white" : "border border-line"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{p.nome}</h3>
                {p.evidenza && <span className="rounded-full bg-[#9fe8c6] px-2.5 py-0.5 text-xs font-semibold text-ink">Il più scelto</span>}
              </div>
              <p className={`mt-1 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>{p.perChi}</p>
              <p className="mt-5">
                <span className="tabular text-5xl font-bold tracking-tight">{euro(importo)}</span>
                <span className={`ml-2 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>{periodo === "annuale" ? "all'anno" : "al mese"}</span>
              </p>
              {periodo === "annuale" && (
                <p className={`tabular mt-1 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>Risparmi {euro(p.mensile * 12 - p.annuale)}.</p>
              )}
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
            </section>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted">Prezzi IVA esclusa. Il primo report arriva in pochi minuti. Disdici quando vuoi, dall&apos;area personale.</p>

      <section className="mt-12 flex flex-col gap-4 rounded-2xl bg-soft p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Preferisci che lo facciamo noi? <span className="tabular font-normal text-muted">{SISTEMAZIONE.nome}, {euro(SISTEMAZIONE.prezzo)} una tantum</span>
          </h2>
          <p className="mt-1 max-w-xl text-[15px] text-muted">{SISTEMAZIONE.testo}</p>
        </div>
        <Bottone href="mailto:ciao@visibilita-ai.it?subject=Sistemazione" secondario className="!w-auto">
          Chiedi la sistemazione
        </Bottone>
      </section>
    </div>
  );
}
