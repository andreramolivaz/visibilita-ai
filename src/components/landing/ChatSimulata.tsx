"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motoriAttivi } from "@/lib/engines";
import type { EngineId } from "@/lib/types";

/** «Riduci movimento» del sistema, letto come store esterno: sul server è falso. */
const QUERY_MOVIMENTO = "(prefers-reduced-motion: reduce)";
function sottoscriviMovimento(onChange: () => void) {
  const mq = window.matchMedia(QUERY_MOVIMENTO);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const leggiMovimento = () => window.matchMedia(QUERY_MOVIMENTO).matches;
const leggiMovimentoServer = () => false;

/**
 * La hero: una chat simulata come in un'app di messaggi. Il cliente «sta
 * scrivendo» (i tre puntini), la domanda arriva intera, l'assistente pensa e
 * risponde con tre nomi, e l'attività che cerchiamo non c'è.
 * Tre scenari a rotazione (ristorante, dentista, carpenteria) su tre assistenti
 * diversi: le domande cambiano con il mestiere, il problema è lo stesso.
 * Con "riduci movimento" attivo mostra solo lo stato finale.
 */
const SCENARI: {
  motore: EngineId;
  domanda: string;
  intro: string;
  nomi: [string, string][];
  manca: string;
  dettaglio: string;
}[] = [
  {
    motore: "chatgpt",
    domanda: "Miglior pizzeria a Bergamo, forno a legna, per stasera?",
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
    motore: "gemini",
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
    motore: "perplexity",
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

/** I tre puntini di «sta scrivendo», come nelle app di messaggi. */
function StaScrivendo({ aDestra = false, etichetta }: { aDestra?: boolean; etichetta: string }) {
  return (
    <div className={`flex ${aDestra ? "justify-end" : "justify-start"}`} aria-label={etichetta}>
      <span className={`inline-flex items-center gap-1 rounded-2xl px-3.5 py-2.5 ${aDestra ? "rounded-br-md bg-soft" : "rounded-bl-md bg-soft/70"}`}>
        {[0, 1, 2].map((k) => (
          <span key={k} className="h-2 w-2 animate-bounce rounded-full bg-faint" style={{ animationDelay: `${k * 150}ms` }} />
        ))}
      </span>
    </div>
  );
}

export function ChatSimulata() {
  const [i, setI] = useState(0);
  const [fase, setFase] = useState<Fase>("scrivo");
  const [righe, setRighe] = useState(0);
  const ridotto = useSyncExternalStore(sottoscriviMovimento, leggiMovimento, leggiMovimentoServer);
  const scena = SCENARI[i];
  const timer = useRef<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const motori = motoriAttivi("mvp");

  /** Leggera inclinazione 3D al passaggio del mouse: solo con puntatore fine e senza "riduci movimento". */
  function inclina(e: React.PointerEvent<HTMLDivElement>) {
    if (ridotto || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 6, y: px * 8 });
  }

  useEffect(() => {
    if (ridotto) return;
    const dopo = (ms: number, fn: () => void) => {
      timer.current = window.setTimeout(fn, ms);
    };
    if (fase === "scrivo") {
      dopo(1500, () => setFase("penso"));
    } else if (fase === "penso") {
      dopo(1300, () => setFase("rispondo"));
    } else if (fase === "rispondo") {
      if (righe < scena.nomi.length + 1) dopo(righe === 0 ? 350 : 650, () => setRighe((r) => r + 1));
      else dopo(700, () => setFase("verdetto"));
    } else if (fase === "verdetto") {
      dopo(4600, () => setFase("pausa"));
    } else {
      dopo(300, () => {
        setI((x) => (x + 1) % SCENARI.length);
        setRighe(0);
        setFase("scrivo");
      });
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [fase, righe, scena, ridotto]);

  const finale = ridotto;
  const mostraDomanda = finale || fase !== "scrivo";
  const mostraRisposta = finale || fase === "rispondo" || fase === "verdetto" || fase === "pausa";
  const righeVisibili = finale ? scena.nomi.length + 1 : righe;
  const mostraVerdetto = finale || fase === "verdetto" || fase === "pausa";

  return (
    <div style={{ perspective: 1400 }} className="relative w-full min-w-0 max-w-lg" onPointerMove={inclina} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      {/* Le altre risposte, dietro: sei assistenti, uno alla volta davanti. */}
      <div aria-hidden="true" className="absolute inset-x-6 -top-4 h-full rounded-2xl border border-line bg-bg/70" />
      <div aria-hidden="true" className="absolute inset-x-3 -top-2 h-full rounded-2xl border border-line bg-bg/90" />
      <figure
        className="relative w-full min-w-0 rounded-2xl border border-line bg-bg shadow-[0_1px_2px_rgba(20,32,28,0.04),0_24px_60px_-20px_rgba(20,32,28,0.25)] transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        aria-live="polite"
      >
        <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto border-b border-line px-2 py-1.5 text-[12px] sm:gap-1 sm:px-3 sm:text-[12.5px]" role="tablist" aria-label="Assistente mostrato">
          {motori.map((m) => {
            const attivo = m.id === scena.motore;
            return (
              <span
                key={m.id}
                role="tab"
                aria-selected={attivo}
                className={`shrink-0 rounded-md px-1.5 py-1 transition-colors duration-500 sm:px-2 ${attivo ? "bg-ink font-semibold text-white" : "text-faint"}`}
              >
                {m.nome}
              </span>
            );
          })}
        </div>
        <div className="min-h-[316px] space-y-3.5 px-4 py-4 text-[15px] leading-relaxed sm:min-h-[332px] sm:px-5 sm:py-5">
          {mostraDomanda ? (
            <div className="flex justify-end">
              <p className="max-w-[88%] rounded-2xl rounded-br-md bg-soft px-4 py-2.5 text-[15px] leading-snug text-ink sm:text-[16px]">{scena.domanda}</p>
            </div>
          ) : (
            <StaScrivendo aDestra etichetta="il cliente sta scrivendo" />
          )}
          {!finale && fase === "penso" && <StaScrivendo etichetta="l'assistente sta scrivendo" />}
          {mostraRisposta && (
            <div className="text-ink">
              {righeVisibili >= 1 && <p>{scena.intro}</p>}
              <ol className="mt-2 space-y-2">
                {scena.nomi.slice(0, Math.max(0, righeVisibili - 1)).map(([nome, nota], k) => (
                  <li key={nome} className="flex gap-2.5">
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
          className={`flex min-h-[58px] items-start gap-2.5 border-t border-line px-4 py-3 text-sm transition-colors duration-500 sm:px-5 ${
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
    </div>
  );
}
