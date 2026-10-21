import type { TestaATesta as TestaATestaT } from "@/lib/types";

/**
 * Confronto diretto con ogni concorrente: barra divisa in tre segmenti
 * (solo lui · entrambi · solo tu), con un vuoto di 2 px tra i segmenti.
 * Il tuo segmento è nell'accento; il suo in grigio.
 */
const SEGMENTI = [
  { chiave: "loroSenzaTe", nome: "solo lui", colore: "#b9c2be" },
  { chiave: "entrambi", nome: "entrambi", colore: "#7fa99a" },
  { chiave: "tuSenzaLoro", nome: "solo tu", colore: "var(--accent)" },
] as const;

export function TestaATesta({ righe, domande }: { righe: TestaATestaT[]; domande: number }) {
  return (
    <figure>
      <ul className="space-y-4">
        {righe.map((r) => {
          const valori = SEGMENTI.map((s) => r[s.chiave]);
          const somma = valori.reduce((a, b) => a + b, 0);
          return (
            <li key={r.nome}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[15px]">
                <span>{r.nome}</span>
                <span className="tabular text-sm text-muted">
                  {somma} domande su {domande}
                </span>
              </div>
              <div
                className="flex h-6 w-full gap-0.5 overflow-hidden rounded-md"
                role="img"
                aria-label={`${r.nome}: solo lui in ${r.loroSenzaTe} domande, entrambi in ${r.entrambi}, solo tu in ${r.tuSenzaLoro}`}
              >
                {SEGMENTI.map((s, i) => {
                  const v = valori[i];
                  if (v === 0) return null;
                  const pct = (v / domande) * 100;
                  return (
                    <div
                      key={s.chiave}
                      title={`${s.nome}: ${v}`}
                      className="tabular flex items-center justify-center text-xs font-semibold"
                      style={{
                        width: `${pct}%`,
                        background: s.colore,
                        color: s.chiave === "loroSenzaTe" ? "var(--ink)" : "#fff",
                      }}
                    >
                      {pct >= 12 ? v : ""}
                    </div>
                  );
                })}
                {somma < domande && <div className="flex-1 bg-soft" title={`nessuno dei due: ${domande - somma}`} />}
              </div>
            </li>
          );
        })}
      </ul>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {SEGMENTI.map((s) => (
          <span key={s.chiave} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-sm" style={{ background: s.colore }} />
            {s.nome}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-soft" />
          nessuno dei due
        </span>
      </figcaption>
    </figure>
  );
}
