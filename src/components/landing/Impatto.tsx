"use client";

import { useEffect, useRef, useState } from "react";
import { ASSUNZIONI, impattoA } from "@/lib/impatto";
import { verdetto } from "@/lib/score";

/**
 * L'impatto: oggi il cliente chiede all'assistente prima di scegliere, e la
 * risposta fa tre o quattro nomi. Due dati italiani con la fonte e una
 * simulazione: il punteggio sale da solo da quello di oggi a quello del primo
 * in città, e clienti ed euro salgono con lui. L'unica cosa da scrivere è il
 * ricavo medio per cliente; le assunzioni stanno chiuse sotto, per chi le vuole.
 */

export interface DatiImpatto {
  /** Il punteggio di oggi (quello del report di esempio). */
  oggi: number;
  /** Il punteggio del primo concorrente in città: il traguardo della simulazione. */
  primo: number;
  /** Persone che ogni mese chiedono a un assistente un'attività come questa, in città. */
  richiesteMese: number;
  /** Ricavo medio per cliente proposto, in euro. */
  ricavoCliente: number;
  /** «una pizzeria», «Bergamo», 120000: per la nota con le assunzioni. */
  cosa: string;
  citta: string;
  abitanti: number;
  /** «sei adulti su cento»: la quota che in un mese cerca un'attività di questa categoria. */
  quotaCerca: string;
}

const DURATA = 4500;
const ATTESA = 500;

const numero = (n: number) => n.toLocaleString("it-IT");
const euro = (n: number) => `${numero(n)} €`;
const conSegno = (n: number) => (n > 0 ? `+${numero(n)}` : numero(n));

export function Impatto({ dati }: { dati: DatiImpatto }) {
  const [punteggio, setPunteggio] = useState(dati.oggi);
  const [ricavo, setRicavo] = useState<number | "">(dati.ricavoCliente);
  const toccato = useRef(false);
  const scatola = useRef<HTMLDivElement>(null);

  // Il punteggio sale da solo, una volta, quando la scatola entra nello schermo.
  useEffect(() => {
    const el = scatola.current;
    if (!el) return;
    let raf = 0;
    let partito = false;
    const fermo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const osservatore = new IntersectionObserver(
      ([voce]) => {
        if (!voce.isIntersecting || partito) return;
        partito = true;
        osservatore.disconnect();
        if (fermo) {
          setPunteggio(dati.primo);
          return;
        }
        const inizio = performance.now() + ATTESA;
        const passo = (t: number) => {
          if (toccato.current) return;
          const x = Math.min(1, Math.max(0, (t - inizio) / DURATA));
          const e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
          setPunteggio(Math.round(dati.oggi + (dati.primo - dati.oggi) * e));
          if (x < 1) raf = requestAnimationFrame(passo);
        };
        raf = requestAnimationFrame(passo);
      },
      { threshold: 0.45 },
    );
    osservatore.observe(el);
    return () => {
      osservatore.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [dati.oggi, dati.primo]);

  const parametri = { richiesteMese: dati.richiesteMese, ricavoCliente: ricavo === "" ? 0 : ricavo };
  const adesso = impattoA(punteggio, parametri);
  const base = impattoA(dati.oggi, parametri);
  const inPiuAnno = adesso.ricavoAnno - base.ricavoAnno;
  const inPiuClienti = adesso.clienti - base.clienti;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
      <div className="lg:self-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Più ti consigliano, più clienti entrano.</h2>
        <p className="mt-4 text-lg text-muted">
          Chi chiede a un assistente AI riceve tre o quattro nomi e sceglie tra quelli. Se non ci sei, quel cliente va da un altro.
        </p>
        <dl className="mt-8 grid max-w-md grid-cols-2 gap-6">
          {[
            ["35%", "degli italiani online usa un assistente AI per decidere cosa comprare"],
            ["64%", "di loro poi va di persona, in negozio o nel locale"],
          ].map(([n, t]) => (
            <div key={n}>
              <dt className="tabular text-4xl font-bold tracking-tight">{n}</dt>
              <dd className="mt-1 text-[15px] text-muted">{t}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[12px] text-faint">IAB Italia, Osservatorio Search 2026.</p>
      </div>

      <div ref={scatola} className="rounded-2xl bg-ink p-6 text-white sm:p-7">
        <h3 className="text-xl font-semibold">Quanto vale salire di punteggio?</h3>

        {/* Il punteggio: sale da solo, poi si trascina. */}
        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/80">Punteggio di visibilità AI</p>
              <p className="mt-0.5 text-xs text-white/55">Sale da solo fino al primo in città. Trascinalo dove vuoi.</p>
            </div>
            <div className="text-right">
              <p className="tabular text-4xl font-bold leading-none">{punteggio}</p>
              <p className="mt-1 text-xs text-white/70">{verdetto(punteggio)}</p>
            </div>
          </div>
          <div className="relative mt-4 h-5">
            <div className="absolute inset-x-0 top-1.5 h-2 rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#9fe8c6]" style={{ width: `${punteggio}%` }} />
            </div>
            <Tacca a={dati.oggi} testo={`tu oggi · ${dati.oggi}`} />
            <Tacca a={dati.primo} testo={`il primo in città · ${dati.primo}`} />
            <div
              className="pointer-events-none absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-[#9fe8c6] shadow-[0_0_0_3px_var(--ink)]"
              style={{ left: `${punteggio}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={punteggio}
              aria-label="Punteggio di visibilità AI"
              onPointerDown={() => (toccato.current = true)}
              onKeyDown={() => (toccato.current = true)}
              onChange={(e) => {
                toccato.current = true;
                setPunteggio(Number(e.target.value));
              }}
              className="absolute inset-0 h-5 w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="h-5" />
        </div>

        {/* L'unico dato da scrivere. */}
        <label className="mt-5 flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm text-white/80">Ricavo medio per cliente</span>
            <span className="block text-xs text-white/55">Uno scontrino, una visita, una commessa.</span>
          </span>
          <span className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-3 py-2 focus-within:border-[#9fe8c6]">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={1000000}
              value={ricavo}
              onChange={(e) => setRicavo(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
              aria-label="Ricavo medio per cliente, in euro"
              className="tabular w-20 bg-transparent text-right text-lg font-semibold outline-none"
            />
            <span className="text-white/70">€</span>
          </span>
        </label>

        {/* Clienti ed euro: salgono con il punteggio. */}
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
          <div>
            <dt className="text-xs text-white/60">Clienti dall&apos;AI al mese</dt>
            <dd className="tabular mt-1 text-3xl font-bold leading-none sm:text-4xl">{numero(adesso.clienti)}</dd>
            <dd className="tabular mt-1.5 text-xs text-white/55">oggi {numero(base.clienti)}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/60">Ricavo al mese</dt>
            <dd className="tabular mt-1 text-3xl font-bold leading-none sm:text-4xl">{euro(adesso.ricavoMese)}</dd>
            <dd className="tabular mt-1.5 text-xs text-white/55">oggi {euro(base.ricavoMese)}</dd>
          </div>
          <div className="col-span-2 mt-1 rounded-xl bg-white/5 px-4 py-4">
            <dt className="text-xs text-white/60">In più all&apos;anno, rispetto a oggi</dt>
            <dd className={`tabular mt-1 text-4xl font-bold leading-none sm:text-5xl ${inPiuAnno > 0 ? "text-[#9fe8c6]" : ""}`}>{conSegno(inPiuAnno)} €</dd>
            <dd className="tabular mt-1.5 text-xs text-white/55">{conSegno(inPiuClienti)} clienti al mese</dd>
          </div>
        </dl>

        <details className="group mt-4 text-xs text-white/55">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 hover:text-white/80 [&::-webkit-details-marker]:hidden">
            Una simulazione per {dati.cosa} a {dati.citta}. Come la calcoliamo
            <span className="transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="mt-2">
            Circa {numero(dati.richiesteMese)} persone al mese chiedono a un assistente {dati.cosa} a {dati.citta} ({numero(dati.abitanti)} abitanti: {dati.quotaCerca} ne
            cercano una in un mese, il {Math.round(ASSUNZIONI.quotaAI * 100)}% sceglie con l&apos;AI). Chi ti vede nella risposta ti sceglie una volta su quattro, quasi una su
            due se sei il primo nome; il {Math.round(ASSUNZIONI.visita * 100)}% poi va di persona. Non è una previsione: è l&apos;ordine di grandezza di quello che è in gioco.
          </p>
        </details>
      </div>
    </div>
  );
}

/** Una tacca sotto la barra, con l'etichetta allineata per non uscire dai bordi. */
function Tacca({ a, testo }: { a: number; testo: string }) {
  const allineamento = a < 18 ? "left-0" : a > 82 ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <div className="pointer-events-none absolute top-0" style={{ left: `${a}%` }}>
      <div className="absolute left-0 top-0 h-5 w-px -translate-x-1/2 bg-white/60" />
      <div className={`absolute top-6 whitespace-nowrap text-[11px] text-white/70 ${allineamento}`}>{testo}</div>
    </div>
  );
}
