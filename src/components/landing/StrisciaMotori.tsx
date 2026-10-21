import { elencoMotori, motoriAttivi, motoriInArrivo } from "@/lib/engines";

/**
 * I sei assistenti in una riga, con quanti italiani li usano: è il peso che
 * hanno nel punteggio. Una barra sottile ciascuno, stessa scala.
 */
export function StrisciaMotori() {
  const motori = motoriAttivi("mvp");
  const max = Math.max(...motori.map((m) => m.utentiMln));
  return (
    <div>
      <div className="grid grid-cols-3 gap-x-5 gap-y-5 md:grid-cols-6">
        {motori.map((m) => (
          <div key={m.id}>
            <p className="text-[15px] font-semibold">{m.nome}</p>
            <p className="tabular text-sm text-muted">{m.utentiMln.toLocaleString("it-IT")} mln</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(m.utentiMln / max) * 100}%` }} />
            </div>
            <p className="tabular mt-1 text-[12px] text-faint">peso {Math.round(m.peso * 100)}%</p>
          </div>
        ))}
      </div>
      <p className="mt-5 max-w-3xl text-[13px] text-faint">
        Utenti mensili in Italia, luglio 2026 (Osservatorio Cosenza su dati Audicom; per Google AI, Sensemakers su dati Comscore). Nel punteggio ogni assistente pesa
        per la sua quota d&apos;uso: essere invisibile su ChatGPT costa più punti che su Grok. In arrivo: {elencoMotori(motoriInArrivo())}.
      </p>
    </div>
  );
}
