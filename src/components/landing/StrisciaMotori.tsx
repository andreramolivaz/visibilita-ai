import { motoriAttivi } from "@/lib/engines";

/**
 * I sei assistenti in una riga, con quanti italiani li usano ogni mese.
 * Una barra sottile ciascuno, stessa scala: chi ha più utenti conta di più.
 */
export function StrisciaMotori() {
  const motori = motoriAttivi("mvp");
  const max = Math.max(...motori.map((m) => m.utentiMln));
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 md:grid-cols-6">
        {motori.map((m) => (
          <div key={m.id}>
            <p className="text-[15px] font-semibold">{m.nome}</p>
            <p className="tabular text-sm text-muted">{m.utentiMln.toLocaleString("it-IT")} milioni</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(m.utentiMln / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-faint">Utenti al mese in Italia, luglio 2026 (Audicom, Comscore).</p>
    </div>
  );
}
