import type { RigaDomanda } from "@/lib/types";
import { territorio } from "@/lib/stats";

/**
 * Le domande del set in tre gruppi: dove ci sei, dove c'è un concorrente e
 * tu no, dove non c'è nessuno. Una barra divisa, un solo colore più il grigio.
 * È la lettura più rapida della mappa, e dice dove vale la pena lavorare.
 */
const GRUPPI = [
  { chiave: "tue", nome: "ci sei", colore: "var(--accent)", testo: "#fff" },
  { chiave: "contese", nome: "c'è un concorrente, tu no", colore: "#b9c2be", testo: "var(--ink)" },
  { chiave: "libere", nome: "nessuno", colore: "var(--soft)", testo: "var(--muted)" },
] as const;

export function Territorio({ righe }: { righe: RigaDomanda[] }) {
  const t = territorio(righe);
  if (t.n === 0) return null;
  return (
    <figure>
      <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-md" role="img" aria-label={`${t.n} domande: ci sei in ${t.tue.length}, c'è un concorrente e tu no in ${t.contese.length}, nessuno in ${t.libere.length}`}>
        {GRUPPI.map((g) => {
          const v = t[g.chiave].length;
          if (v === 0) return null;
          const pct = (v / t.n) * 100;
          return (
            <div
              key={g.chiave}
              title={`${g.nome}: ${v} domande`}
              className="tabular flex items-center justify-center text-xs font-semibold"
              style={{ width: `${pct}%`, background: g.colore, color: g.testo }}
            >
              {pct >= 8 ? v : ""}
            </div>
          );
        })}
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {GRUPPI.map((g) => (
          <span key={g.chiave} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-sm border border-line" style={{ background: g.colore }} />
            {g.nome}: <span className="tabular">{t[g.chiave].length}</span>
          </span>
        ))}
        <span>su {t.n} domande</span>
      </figcaption>
    </figure>
  );
}
