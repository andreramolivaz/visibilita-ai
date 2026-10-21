import { proiezione } from "@/lib/stats";

/**
 * Andamento del punteggio negli ultimi mesi: una linea sola, SVG inline,
 * più la proiezione lineare dei tre mesi successivi in tratteggio.
 * Solo nell'abbonamento.
 */
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

export function Andamento({ punti }: { punti: { mese: string; punteggio: number }[] }) {
  if (punti.length < 2) return null;
  const prev = proiezione(punti, 3);
  const futuri = prev.valori.map((v, k) => {
    const i = MESI.indexOf(punti[punti.length - 1].mese);
    return { mese: i >= 0 ? MESI[(i + k + 1) % 12] : `+${k + 1}`, punteggio: v };
  });
  const tutti = [...punti, ...futuri];
  const w = 360;
  const h = 110;
  const padX = 12;
  const padY = 12;
  const passo = (w - padX * 2) / (tutti.length - 1);
  const y = (p: number) => padY + (h - padY * 2) * (1 - p / 100);
  const x = (i: number) => padX + i * passo;
  const d = punti.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.punteggio)}`).join(" ");
  const n = punti.length;
  const dProiezione =
    futuri.length > 0
      ? [`M${x(n - 1)},${y(punti[n - 1].punteggio)}`, ...futuri.map((p, k) => `L${x(n + k)},${y(p.punteggio)}`)].join(" ")
      : "";
  const ultimo = punti[n - 1];
  const prec = punti[n - 2];
  const delta = ultimo.punteggio - prec.punteggio;

  return (
    <figure className="mt-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
        <span className="font-medium">Ultimi {n} mesi e proiezione</span>
        <span className={`tabular ${delta >= 0 ? "text-accent" : "text-danger"}`}>
          {delta >= 0 ? "+" : ""}
          {delta} rispetto al mese prima
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Punteggio: ${punti.map((p) => `${p.mese} ${p.punteggio}`).join(", ")}. Proiezione: ${futuri.map((p) => `${p.mese} ${p.punteggio}`).join(", ")}`}
      >
        {[0, 50, 100].map((v) => (
          <line key={v} x1={padX} x2={w - padX} y1={y(v)} y2={y(v)} stroke="var(--line)" />
        ))}
        {futuri.length > 0 && <rect x={x(n - 1)} y={padY - 4} width={x(tutti.length - 1) - x(n - 1)} height={h - padY * 2 + 8} fill="var(--soft)" opacity={0.6} />}
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {dProiezione && <path d={dProiezione} fill="none" stroke="var(--accent)" strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" />}
        {punti.map((p, i) => (
          <circle key={p.mese} cx={x(i)} cy={y(p.punteggio)} r={3.5} fill="var(--accent)" stroke="var(--bg)" strokeWidth={2} />
        ))}
        {futuri.map((p, k) => (
          <circle key={`f${k}`} cx={x(n + k)} cy={y(p.punteggio)} r={3} fill="var(--bg)" stroke="var(--accent)" strokeWidth={1.5} />
        ))}
      </svg>
      <div className="grid text-xs text-muted" style={{ gridTemplateColumns: `repeat(${tutti.length}, minmax(0, 1fr))` }}>
        {tutti.map((p, i) => (
          <span key={`${p.mese}${i}`} className={`text-center ${i >= n ? "text-faint" : ""}`}>
            {p.mese}
          </span>
        ))}
      </div>
      {futuri.length > 0 && (
        <figcaption className="mt-1.5 text-xs text-muted">
          Tratteggio: proiezione lineare dei prossimi tre mesi se la tendenza continua ({prev.pendenza >= 0 ? "+" : ""}
          {prev.pendenza.toFixed(1)} punti al mese). Indicativa: cambia a ogni scansione.
        </figcaption>
      )}
    </figure>
  );
}
