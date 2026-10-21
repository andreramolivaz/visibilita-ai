import { engine } from "@/lib/engines";
import type { RigaDomanda, EngineId, Posizione } from "@/lib/types";

/**
 * Mappa domanda × assistente: una cella per risposta, colore per posizione
 * (1º scuro → 5º chiaro, un solo colore), vuota se non compari.
 * È la vista d'insieme del report: in un colpo d'occhio dove ti trovano.
 */

/** Scala sequenziale: un solo verde, più scuro = posizione migliore. */
export const COLORE_POSIZIONE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "#0a4537",
  2: "#0e5a47",
  3: "#3f7f6b",
  4: "#7fa99a",
  5: "#b7d1c7",
};

function stileCella(p: Posizione) {
  if (p === null) return { background: "var(--soft)", color: "var(--faint)" };
  return { background: COLORE_POSIZIONE[p], color: p >= 4 ? "var(--ink)" : "#ffffff" };
}

export function Heatmap({ righe, motori, ripetizioni }: { righe: RigaDomanda[]; motori: EngineId[]; ripetizioni: number }) {
  return (
    <figure>
      {/* Intestazione colonne (schermo largo) */}
      <div className="hidden md:grid md:grid-cols-[minmax(0,1.6fr)_repeat(6,minmax(0,1fr))] md:gap-1 md:pb-2">
        <span />
        {motori.map((m) => (
          <span key={m} className="truncate text-center text-xs font-medium text-muted">
            {engine(m).nome}
          </span>
        ))}
      </div>

      <ol className="space-y-2 md:space-y-1">
        {righe.map((riga) => (
          <li key={riga.domanda.id} className="md:grid md:grid-cols-[minmax(0,1.6fr)_repeat(6,minmax(0,1fr))] md:items-center md:gap-1">
            <span className="mb-1 block text-[15px] md:mb-0 md:pr-3 md:text-sm">{riga.domanda.testo}</span>
            <div className="grid grid-cols-6 gap-1 md:contents">
              {riga.celle.map((c) => {
                const volte = c.volte ?? Number(c.frequenza.split(" ")[0]);
                const titolo = `${engine(c.motore).nome}: ${
                  c.posizione === null ? "non compari" : `${c.posizione}º posto`
                }, ${volte} su ${ripetizioni}`;
                return (
                  <div
                    key={c.motore}
                    title={titolo}
                    className="tabular flex h-11 flex-col items-center justify-center rounded-md text-sm leading-none md:h-10"
                    style={stileCella(c.posizione)}
                  >
                    <span className="sr-only">{titolo}</span>
                    {c.posizione === null ? (
                      <span aria-hidden="true">✕</span>
                    ) : (
                      <>
                        <span className="font-semibold" aria-hidden="true">
                          {c.posizione}º
                        </span>
                        <span className="mt-0.5 text-[10px] opacity-80" aria-hidden="true">
                          {volte}/{ripetizioni}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Nomi dei motori sotto la riga, solo telefono */}
            <div className="mt-1 grid grid-cols-6 gap-1 md:hidden">
              {riga.celle.map((c) => (
                <span key={c.motore} className="truncate text-center text-[10px] text-faint">
                  {engine(c.motore).nome}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span>Posizione in cui compari:</span>
        {([1, 2, 3, 4, 5] as const).map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-sm" style={{ background: COLORE_POSIZIONE[p] }} />
            {p}º
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-soft" />
          mai
        </span>
        <span>Il numero piccolo è quante volte su {ripetizioni}.</span>
      </figcaption>
    </figure>
  );
}
