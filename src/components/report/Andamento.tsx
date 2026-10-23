/**
 * Andamento del punteggio nelle scansioni precedenti: una linea sola, SVG inline.
 * Nessuna previsione: le risposte degli assistenti non hanno una base statistica
 * che le renda prevedibili, e i modelli cambiano senza preavviso. Solo nell'abbonamento.
 */
export function Andamento({ punti, compatto = false }: { punti: { mese: string; punteggio: number }[]; compatto?: boolean }) {
  if (punti.length < 2) return null;
  const w = 360;
  const h = compatto ? 72 : 110;
  const padX = 12;
  const padY = 10;
  const passo = (w - padX * 2) / (punti.length - 1);
  /** Scala verticale: da 0 a una decina sopra il massimo (almeno 40), così la linea si legge. */
  const tetto = Math.max(40, Math.ceil((Math.max(...punti.map((p) => p.punteggio)) + 10) / 10) * 10);
  const y = (p: number) => padY + (h - padY * 2) * (1 - p / tetto);
  const x = (i: number) => padX + i * passo;
  const d = punti.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.punteggio)}`).join(" ");
  const n = punti.length;
  const ultimo = punti[n - 1];
  const prec = punti[n - 2];
  const delta = ultimo.punteggio - prec.punteggio;

  return (
    <figure className={compatto ? "mt-3" : "mt-5"}>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
        <span className="font-medium">Ultime {n} scansioni</span>
        <span className={`tabular ${delta >= 0 ? "text-accent" : "text-danger"}`}>
          {delta >= 0 ? "+" : ""}
          {delta} rispetto alla precedente
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`Punteggio: ${punti.map((p) => `${p.mese} ${p.punteggio}`).join(", ")}`}>
        {[0, tetto / 2, tetto].map((v) => (
          <g key={v}>
            <line x1={padX} x2={w - padX} y1={y(v)} y2={y(v)} stroke="var(--line)" />
            <text x={w - padX} y={y(v) - 3} textAnchor="end" fontSize="9" fill="var(--faint)">
              {v}
            </text>
          </g>
        ))}
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {punti.map((p, i) => (
          <g key={`${p.mese}${i}`}>
            <circle cx={x(i)} cy={y(p.punteggio)} r={3.5} fill="var(--accent)" stroke="var(--bg)" strokeWidth={2} />
            <text x={x(i)} y={y(p.punteggio) - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)">
              {p.punteggio}
            </text>
          </g>
        ))}
      </svg>
      <div className="grid text-xs text-muted" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {punti.map((p, i) => (
          <span key={`${p.mese}${i}`} className="text-center">
            {p.mese}
          </span>
        ))}
      </div>
      {!compatto && (
        <figcaption className="mt-1.5 text-xs text-muted">
          Stesse domande a ogni report: le variazioni di pochi punti possono essere oscillazioni, una tendenza si vede su più mesi.
        </figcaption>
      )}
    </figure>
  );
}
