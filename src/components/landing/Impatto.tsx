"use client";

import { useState } from "react";

/**
 * L'impatto: oggi il cliente chiede all'assistente prima di scegliere, e se
 * non compari il cliente va da chi compare. Tre dati italiani con la fonte e
 * una stima trasparente: quanti clienti al mese passano dall'AI.
 */

const QUOTA_AI = 0.35; // 35,3% degli adulti online usa la ricerca generativa per decidere un acquisto (IAB Italia, mar 2026)

export function Impatto() {
  const [nuovi, setNuovi] = useState(120);
  const [quota, setQuota] = useState(15);
  const chiedono = Math.round(nuovi * QUOTA_AI);
  const persi = Math.round(chiedono * (1 - quota / 100));
  const recuperabili = Math.round(chiedono * Math.max(0, 0.6 - quota / 100));

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      <div>
        <h2 className="text-3xl font-bold sm:text-4xl">Il cliente chiede all&apos;AI prima di scegliere. Se non ci sei, sceglie un altro.</h2>
        <p className="mt-4 text-lg text-muted">
          Non è più «dove sei su Google». È «chi consiglia ChatGPT quando un cliente chiede una pizzeria, un dentista, un idraulico, un fornitore». La risposta nomina
          tre o quattro attività: quelle prendono il cliente, le altre non esistono.
        </p>
        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            ["35%", "degli adulti italiani online usa già un assistente AI per decidere cosa comprare: era il 20% un anno prima.", "IAB Italia, Osservatorio Search 2026 · 1.000 adulti, marzo 2026"],
            ["64%", "di chi decide con l'AI va poi in un negozio o in un locale fisico: l'assistente sceglie, il cliente entra dalla porta.", "IAB Italia, Osservatorio Search 2026"],
            ["4,4×", "il valore di un visitatore che arriva da una risposta AI rispetto a uno da Google: arriva già convinto.", "Semrush, AI search traffic study, 2025"],
          ].map(([n, t, f]) => (
            <div key={n}>
              <dt className="tabular text-4xl font-bold tracking-tight">{n}</dt>
              <dd className="mt-1.5 text-[15px]">{t}</dd>
              <dd className="mt-1.5 text-[12px] text-faint">{f}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl bg-ink p-6 text-white sm:p-7">
        <p className="text-sm text-white/70">Una stima, con le sue assunzioni</p>
        <h3 className="mt-1 text-xl font-semibold">Quanti clienti al mese ti passano dall&apos;AI?</h3>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="flex justify-between text-sm">
              <span className="text-white/80">Nuovi clienti al mese</span>
              <span className="tabular font-semibold">{nuovi}</span>
            </span>
            <input type="range" min={20} max={1000} step={10} value={nuovi} onChange={(e) => setNuovi(Number(e.target.value))} className="mt-2 w-full accent-[#9fe8c6]" />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm">
              <span className="text-white/80">Risposte AI in cui compari</span>
              <span className="tabular font-semibold">{quota}%</span>
            </span>
            <input type="range" min={0} max={100} step={5} value={quota} onChange={(e) => setQuota(Number(e.target.value))} className="mt-2 w-full accent-[#9fe8c6]" />
            <span className="mt-1 block text-xs text-white/55">Il report te lo dice. Il 15% è il valore dell&apos;esempio; per molte attività è zero.</span>
          </label>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-5">
          <div>
            <dt className="text-xs text-white/60">chiedono all&apos;AI</dt>
            <dd className="tabular mt-1 text-3xl font-bold leading-none">{chiedono}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/60">vanno da chi compare</dt>
            <dd className="tabular mt-1 text-3xl font-bold leading-none text-[#ffb4ad]">{persi}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/60">recuperabili al 60%</dt>
            <dd className="tabular mt-1 text-3xl font-bold leading-none text-[#9fe8c6]">{recuperabili}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-white/55">
          Al mese. Assunzioni: il 35% chiede a un assistente prima di scegliere (IAB Italia 2026); chi non ti vede nella risposta sceglie un&apos;attività che c&apos;è; il 60% è la quota di
          risposte dei primi tre nomi nella categoria dell&apos;esempio. Non è una previsione: è l&apos;ordine di grandezza di quello che è in gioco.
        </p>
      </div>
    </div>
  );
}
