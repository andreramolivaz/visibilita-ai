import type { Azione } from "@/lib/types";

/**
 * Dove puoi arrivare: dal punteggio di oggi a quello stimato dopo le azioni,
 * un segmento per azione. È una stima, e lo dice.
 */
export function Potenziale({ punteggio, azioni, compatto = false }: { punteggio: number; azioni: Azione[]; compatto?: boolean }) {
  const conStima = azioni.filter((a) => (a.impattoStimato ?? 0) > 0);
  if (conStima.length === 0) return null;
  const guadagno = conStima.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  const potenziale = Math.min(100, punteggio + guadagno);
  const tinte = ["var(--accent-ink)", "var(--accent)", "#3f7f6b"];

  return (
    <figure className={compatto ? "" : "rounded-2xl border border-line p-5 sm:p-6"}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-sm font-medium">Dove puoi arrivare con le tre azioni</p>
          <p className="mt-0.5 text-xs text-muted">Stima dai dati di questo report: quanto peserebbero sul punteggio le domande e le fonti su cui agisci.</p>
        </div>
        <p className="tabular text-sm">
          <span className="text-2xl font-bold">{punteggio}</span>
          <span className="mx-2 text-muted">→</span>
          <span className="text-2xl font-bold text-accent">{potenziale}</span>
          <span className="ml-1.5 text-muted">su 100</span>
        </p>
      </div>
      <div className="mt-3 flex h-6 w-full gap-0.5 overflow-hidden rounded-md bg-soft" role="img" aria-label={`Oggi ${punteggio}; con le azioni circa ${potenziale}`}>
        <div className="tabular flex items-center justify-end pr-2 text-xs font-semibold text-white" style={{ width: `${punteggio}%`, background: "var(--ink)" }}>
          {punteggio >= 10 ? punteggio : ""}
        </div>
        {conStima.map((a, i) => (
          <div
            key={a.titolo}
            title={`${a.titolo}: +${a.impattoStimato}`}
            className="tabular flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${a.impattoStimato}%`, background: tinte[i % tinte.length] }}
          >
            {(a.impattoStimato ?? 0) >= 5 ? `+${a.impattoStimato}` : ""}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {conStima.map((a, i) => (
          <span key={a.titolo} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: tinte[i % tinte.length] }} />
            Azione {i + 1}: <span className="tabular">+{a.impattoStimato}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
