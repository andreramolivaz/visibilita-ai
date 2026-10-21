/**
 * Andamento del punteggio negli ultimi mesi: una linea sola, SVG inline.
 * Solo nell'abbonamento.
 */
export function Andamento({ punti }: { punti: { mese: string; punteggio: number }[] }) {
  if (punti.length < 2) return null;
  const w = 320;
  const h = 96;
  const padX = 12;
  const padY = 10;
  const passo = (w - padX * 2) / (punti.length - 1);
  const y = (p: number) => padY + (h - padY * 2) * (1 - p / 100);
  const d = punti.map((p, i) => `${i === 0 ? "M" : "L"}${padX + i * passo},${y(p.punteggio)}`).join(" ");
  const ultimo = punti[punti.length - 1];
  const prec = punti[punti.length - 2];
  const delta = ultimo.punteggio - prec.punteggio;

  return (
    <div className="mt-5">
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium">Ultimi {punti.length} mesi</span>
        <span className={`tabular ${delta >= 0 ? "text-accent" : "text-danger"}`}>
          {delta >= 0 ? "+" : ""}
          {delta} rispetto al mese prima
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-24 w-full"
        role="img"
        aria-label={`Punteggio: ${punti.map((p) => `${p.mese} ${p.punteggio}`).join(", ")}`}
      >
        <line x1={padX} x2={w - padX} y1={y(0)} y2={y(0)} stroke="var(--line)" />
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
        {punti.map((p, i) => (
          <circle key={p.mese} cx={padX + i * passo} cy={y(p.punteggio)} r={3} fill="var(--accent)" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted">
        {punti.map((p) => (
          <span key={p.mese}>{p.mese}</span>
        ))}
      </div>
    </div>
  );
}
