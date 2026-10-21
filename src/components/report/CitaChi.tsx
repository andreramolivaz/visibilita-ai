import { engine } from "@/lib/engines";
import type { CitaChi as CitaChiT, EngineId } from "@/lib/types";

/**
 * Chi cita chi: una riga per attività, una colonna per assistente, nella
 * cella in quante domande quell'assistente la cita. Più scuro = più citato.
 * Fa vedere quale assistente "appartiene" a quale concorrente.
 */
function tinta(v: number, max: number) {
  if (v === 0) return { background: "var(--soft)", color: "var(--faint)" };
  const t = max > 0 ? v / max : 0;
  const scala = ["#dbe9e3", "#b7d1c7", "#7fa99a", "#3f7f6b", "#0e5a47", "#0a4537"];
  const i = Math.min(scala.length - 1, Math.floor(t * (scala.length - 1) + 0.5));
  return { background: scala[i], color: i >= 3 ? "#fff" : "var(--ink)" };
}

export function CitaChi({ righe, motori, domande }: { righe: CitaChiT[]; motori: EngineId[]; domande: number }) {
  return (
    <figure>
      <div className="grid grid-cols-[minmax(0,1.5fr)_repeat(6,minmax(0,1fr))] gap-1 pb-1.5">
        <span />
        {motori.map((m) => (
          <span key={m} className="truncate text-center text-[10px] font-medium text-muted sm:text-xs">
            {engine(m).nome}
          </span>
        ))}
      </div>
      <ol className="space-y-1">
        {righe.map((r) => (
          <li key={r.nome} className="grid grid-cols-[minmax(0,1.5fr)_repeat(6,minmax(0,1fr))] items-center gap-1">
            <span className={`truncate pr-2 text-[13px] sm:text-sm ${r.seiTu ? "font-semibold text-accent" : ""}`}>{r.nome}</span>
            {motori.map((m) => {
              const v = r.perMotore[m] ?? 0;
              return (
                <div
                  key={m}
                  title={`${engine(m).nome} cita ${r.nome} in ${v} domande su ${domande}`}
                  className="tabular flex h-8 items-center justify-center rounded-md text-xs font-semibold"
                  style={tinta(v, domande)}
                >
                  {v}
                </div>
              );
            })}
          </li>
        ))}
      </ol>
      <figcaption className="mt-2 text-xs text-muted">Domande, su {domande}, in cui l&apos;assistente cita l&apos;attività. Più scura la cella, più la cita.</figcaption>
    </figure>
  );
}
