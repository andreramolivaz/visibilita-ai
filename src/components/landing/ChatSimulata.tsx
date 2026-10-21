"use client";

import { useEffect, useRef, useState } from "react";

/**
 * La hero: una chat simulata. Scrive la domanda come la scriverebbe un cliente,
 * l'assistente risponde con tre nomi, e l'attività che cerchiamo non c'è.
 * Tre scenari a rotazione (ristorante, dentista, carpenteria): le domande
 * cambiano con il mestiere, il problema è lo stesso.
 * Con "riduci movimento" attivo mostra solo lo stato finale.
 */
const SCENARI = [
  {
    domanda: "Miglior pizzeria a Bergamo?",
    intro: "Ecco tre pizzerie molto apprezzate a Bergamo:",
    nomi: [
      ["Pizzeria Fratelli Rossi", "forno a legna, impasto a lunga lievitazione, in centro."],
      ["Al Forno Antico", "pizza napoletana, molto apprezzata per le margherite."],
      ["La Margherita", "buon rapporto qualità-prezzo, aperta anche a pranzo."],
    ],
    manca: "Pizzeria Da Gino non compare.",
    dettaglio: "Né qui, né in 6 delle 15 domande del report.",
  },
  {
    domanda: "Dentista per invisalign a Treviso, consigliato",
    intro: "Alcuni studi a Treviso con buone recensioni per gli allineatori:",
    nomi: [
      ["Studio Dentistico Conti", "ortodonzia invisibile, prima visita gratuita."],
      ["Clinica Sorriso", "allineatori e sbiancamento, aperta il sabato."],
      ["Dott.ssa Marin", "studio in centro, pagamenti a rate."],
    ],
    manca: "Studio Bianchi non compare.",
    dettaglio: "Compare solo alla domanda sul suo nome.",
  },
  {
    domanda: "Carpenteria metallica conto terzi in provincia di Brescia, taglio laser",
    intro: "Alcune aziende in provincia di Brescia che fanno carpenteria e taglio laser:",
    nomi: [
      ["Metalfer Srl", "taglio laser lamiera, piegatura, piccole serie."],
      ["OMB Carpenterie", "carpenteria pesante, certificata ISO 9001."],
      ["Tecnolaser Brescia", "taglio laser fibra fino a 25 mm, consegna in 48 ore."],
    ],
    manca: "Officine Rinaldi non compare.",
    dettaglio: "Nessun assistente la cita per il taglio laser, che è il suo lavoro principale.",
  },
];

type Fase = "scrivo" | "penso" | "rispondo" | "verdetto" | "pausa";

export function ChatSimulata() {
  const [i, setI] = useState(0);
  const [fase, setFase] = useState<Fase>("scrivo");
  const [caratteri, setCaratteri] = useState(0);
  const [righe, setRighe] = useState(0);
  const [ridotto, setRidotto] = useState(false);
  const scena = SCENARI[i];
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setRidotto(mq.matches);
    const onChange = () => setRidotto(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (ridotto) return;
    const dopo = (ms: number, fn: () => void) => {
      timer.current = window.setTimeout(fn, ms);
    };
    if (fase === "scrivo") {
      if (caratteri < scena.domanda.length) dopo(28 + Math.random() * 40, () => setCaratteri((c) => c + 1));
      else dopo(500, () => setFase("penso"));
    } else if (fase === "penso") {
      dopo(1100, () => setFase("rispondo"));
    } else if (fase === "rispondo") {
      if (righe < scena.nomi.length + 1) dopo(righe === 0 ? 350 : 650, () => setRighe((r) => r + 1));
      else dopo(700, () => setFase("verdetto"));
    } else if (fase === "verdetto") {
      dopo(4200, () => setFase("pausa"));
    } else {
      dopo(300, () => {
        setI((x) => (x + 1) % SCENARI.length);
        setCaratteri(0);
        setRighe(0);
        setFase("scrivo");
      });
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [fase, caratteri, righe, scena, ridotto]);

  const finale = ridotto;
  const testoDomanda = finale ? scena.domanda : scena.domanda.slice(0, caratteri);
  const mostraRisposta = finale || fase === "rispondo" || fase === "verdetto" || fase === "pausa";
  const righeVisibili = finale ? scena.nomi.length + 1 : righe;
  const mostraVerdetto = finale || fase === "verdetto" || fase === "pausa";

  return (
    <figure
      className="w-full max-w-md rounded-2xl border border-line bg-bg shadow-[0_1px_2px_rgba(20,32,28,0.04),0_18px_50px_-16px_rgba(20,32,28,0.22)]"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs text-faint">
        <span className="h-2 w-2 rounded-full bg-[#b9c2be]" />
        <span className="h-2 w-2 rounded-full bg-[#b9c2be]" />
        <span className="h-2 w-2 rounded-full bg-[#b9c2be]" />
        <span className="ml-2">assistente AI</span>
        <span className="ml-auto tabular">
          esempio {i + 1} di {SCENARI.length}
        </span>
      </div>
      <div className="min-h-[300px] space-y-3 px-4 py-4 text-[14.5px] leading-relaxed sm:px-5">
        <div className="flex justify-end">
          <p className="max-w-[88%] rounded-2xl rounded-br-md bg-soft px-3.5 py-2 text-ink">
            {testoDomanda}
            {!finale && fase === "scrivo" && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-ink" aria-hidden="true" />}
          </p>
        </div>
        {!finale && fase === "penso" && (
          <div className="flex items-center gap-1 pl-1" aria-label="l'assistente sta scrivendo">
            {[0, 1, 2].map((k) => (
              <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint" style={{ animationDelay: `${k * 150}ms` }} />
            ))}
          </div>
        )}
        {mostraRisposta && (
          <div className="text-ink">
            {righeVisibili >= 1 && <p>{scena.intro}</p>}
            <ol className="mt-2 space-y-1.5">
              {scena.nomi.slice(0, Math.max(0, righeVisibili - 1)).map(([nome, nota], k) => (
                <li key={nome} className="flex gap-2">
                  <span className="tabular w-4 shrink-0 text-faint">{k + 1}.</span>
                  <span>
                    <span className="font-semibold">{nome}</span>
                    <span className="text-muted"> – {nota}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <figcaption
        className={`flex items-start gap-2.5 border-t border-line px-4 py-3 text-sm transition-colors duration-500 sm:px-5 ${
          mostraVerdetto ? "bg-danger-soft/70" : "bg-bg"
        }`}
      >
        {mostraVerdetto ? (
          <>
            <span className="mt-0.5 font-bold text-danger" aria-hidden="true">
              ✕
            </span>
            <span>
              <span className="font-semibold text-danger">{scena.manca}</span> <span className="text-muted">{scena.dettaglio}</span>
            </span>
          </>
        ) : (
          <span className="text-faint">&nbsp;</span>
        )}
      </figcaption>
    </figure>
  );
}
