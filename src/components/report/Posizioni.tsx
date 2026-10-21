import type { RigaDomanda } from "@/lib/types";
import { COLORE_POSIZIONE } from "./Heatmap";

/** Conta le risposte per posizione (1º…5º) dalle celle del report. */
export function distribuzionePosizioni(righe: RigaDomanda[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const d: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const riga of righe) {
    for (const c of riga.celle) {
      if (c.posizione === null) continue;
      d[c.posizione] += c.volte ?? Number(c.frequenza.split(" ")[0]);
    }
  }
  return d;
}

/**
 * Quando compari, in che posizione: una barra divisa per posizione,
 * dal 1º posto (scuro) al 5º (chiaro). Stesso colore della mappa.
 */
export function Posizioni({ righe }: { righe: RigaDomanda[] }) {
  const d = distribuzionePosizioni(righe);
  const totale = Object.values(d).reduce((a, b) => a + b, 0);
  if (totale === 0) return null;
  const primi = Math.round((d[1] / totale) * 100);

  return (
    <figure className="mt-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[15px]">
        <span className="font-medium">Quando compari, dove ti mettono</span>
        <span className="tabular text-sm text-muted">1º posto {primi}% delle volte</span>
      </div>
      <div className="flex h-6 w-full gap-0.5 overflow-hidden rounded-md" role="img" aria-label={`Risposte per posizione: ${([1, 2, 3, 4, 5] as const).map((p) => `${p}º ${d[p]}`).join(", ")}`}>
        {([1, 2, 3, 4, 5] as const).map((p) => {
          if (d[p] === 0) return null;
          const pct = (d[p] / totale) * 100;
          return (
            <div
              key={p}
              title={`${p}º posto: ${d[p]} risposte`}
              className="tabular flex items-center justify-center text-xs font-semibold"
              style={{ width: `${pct}%`, background: COLORE_POSIZIONE[p], color: p >= 4 ? "var(--ink)" : "#fff" }}
            >
              {pct >= 10 ? `${p}º` : ""}
            </div>
          );
        })}
      </div>
      <figcaption className="tabular mt-1.5 text-xs text-muted">
        {([1, 2, 3, 4, 5] as const)
          .filter((p) => d[p] > 0)
          .map((p) => `${p}º ${d[p]}`)
          .join(" · ")}{" "}
        su {totale} risposte in cui compari.
      </figcaption>
    </figure>
  );
}
