/**
 * La scala del punteggio: quattro fasce su una barra, con il segno di dove sei.
 * Spiega il verdetto senza una legenda.
 */
const FASCE = [
  { nome: "Invisibile", da: 0, a: 10, colore: "var(--danger)" },
  { nome: "Poco visibile", da: 11, a: 40, colore: "var(--warn)" },
  { nome: "Visibile", da: 41, a: 70, colore: "var(--accent)" },
  { nome: "Dominante", da: 71, a: 100, colore: "var(--accent-ink)" },
];

export function ScalaPunteggio({ punteggio, compatta = false }: { punteggio: number; compatta?: boolean }) {
  const pct = Math.max(0, Math.min(100, punteggio));
  return (
    <div className={compatta ? "mt-4" : "mt-6"}>
      <div className="relative h-2.5 w-full overflow-visible rounded-full bg-soft">
        {FASCE.map((f) => (
          <div
            key={f.nome}
            className="absolute top-0 h-full first:rounded-l-full last:rounded-r-full"
            style={{
              left: `${f.da}%`,
              width: `${f.a - f.da + (f.da === 0 ? 0 : 1)}%`,
              background: f.colore,
              opacity: pct >= f.da ? 1 : 0.25,
            }}
          />
        ))}
        <div
          className="absolute -top-1.5 h-5 w-[3px] -translate-x-1/2 rounded-full bg-ink ring-2 ring-bg"
          style={{ left: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 grid grid-cols-4 text-[11px] leading-tight text-faint sm:text-xs">
        {FASCE.map((f) => (
          <span key={f.nome} className={pct >= f.da && pct <= f.a ? "font-semibold text-ink" : ""}>
            {f.nome}
            {!compatta && (
              <span className="tabular block font-normal text-faint">
                {f.da}–{f.a}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
