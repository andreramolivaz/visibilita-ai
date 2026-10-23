"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface SchedaReport {
  id: string;
  titolo: string;
  contenuto: ReactNode;
}

/** Altezza della riga del marchio nell'intestazione, bordo compreso: i tab si attaccano lì sotto. */
const ALTEZZA_INTESTAZIONE = { telefono: 53, schermo: 65 };

/**
 * Il report diviso in tab veri: uno solo alla volta, gli altri nascosti.
 * Il tab scelto finisce nell'indirizzo (#concorrenti), così un link porta
 * dritto lì; un link a un punto dentro un tab (#guida) apre quel tab.
 * In stampa si vedono tutti.
 */
export function SchedeReport({ schede }: { schede: SchedaReport[] }) {
  const [attiva, setAttiva] = useState(schede[0]?.id);
  const inizio = useRef<HTMLDivElement>(null);
  const tab = useRef<(HTMLButtonElement | null)[]>([]);

  // L'indirizzo decide il tab: all'apertura e quando cambia l'ancora.
  useEffect(() => {
    const daIndirizzo = () => {
      const ancora = decodeURIComponent(window.location.hash.slice(1));
      if (!ancora) return;
      if (schede.some((s) => s.id === ancora)) {
        setAttiva(ancora);
        return;
      }
      const el = document.getElementById(ancora);
      const pannello = el?.closest<HTMLElement>("[data-scheda]");
      if (el && pannello?.dataset.scheda) {
        setAttiva(pannello.dataset.scheda);
        requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
      }
    };
    const primo = requestAnimationFrame(daIndirizzo);
    window.addEventListener("hashchange", daIndirizzo);
    return () => {
      cancelAnimationFrame(primo);
      window.removeEventListener("hashchange", daIndirizzo);
    };
  }, [schede]);

  function scegli(id: string) {
    setAttiva(id);
    window.history.replaceState(null, "", `#${id}`);
    // Se la pagina è già scesa dentro il tab, si riparte dall'inizio del nuovo.
    const el = inizio.current;
    if (!el) return;
    const sopra = window.matchMedia("(min-width: 768px)").matches ? ALTEZZA_INTESTAZIONE.schermo : ALTEZZA_INTESTAZIONE.telefono;
    const y = el.getBoundingClientRect().top + window.scrollY - sopra;
    if (window.scrollY > y) window.scrollTo({ top: y });
  }

  function tasti(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = schede.length;
    const prossimo = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (prossimo === null) return;
    e.preventDefault();
    scegli(schede[prossimo].id);
    tab.current[prossimo]?.focus();
  }

  return (
    <div>
      <div ref={inizio} aria-hidden="true" />
      <div className="no-print sticky top-[53px] z-20 -mx-4 bg-bg/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 md:top-[65px]">
        <div className="border-b border-line">
        <div role="tablist" aria-label="Sezioni del report" className="-mb-px flex justify-between gap-3 overflow-x-auto sm:justify-start sm:gap-7">
          {schede.map((s, i) => {
            const si = s.id === attiva;
            return (
              <button
                key={s.id}
                ref={(b) => {
                  tab.current[i] = b;
                }}
                type="button"
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={si}
                aria-controls={`pannello-${s.id}`}
                tabIndex={si ? 0 : -1}
                onClick={() => scegli(s.id)}
                onKeyDown={(e) => tasti(e, i)}
                className={`shrink-0 border-b-2 py-3 text-[14px] font-medium transition-colors sm:text-[15px] ${si ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}
              >
                {s.titolo}
              </button>
            );
          })}
        </div>
        </div>
      </div>
      {schede.map((s) => (
        <div
          key={s.id}
          role="tabpanel"
          id={`pannello-${s.id}`}
          aria-labelledby={`tab-${s.id}`}
          data-scheda={s.id}
          className={s.id === attiva ? "" : "hidden print:block"}
        >
          <h2 className="hidden pt-8 text-2xl font-bold print:block">{s.titolo}</h2>
          {s.contenuto}
        </div>
      ))}
    </div>
  );
}
