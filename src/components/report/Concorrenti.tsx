import { engine } from "@/lib/engines";
import type { Report } from "@/lib/types";
import { confrontoDiretto, percentuale, quotaVoce } from "@/lib/stats";

/** Alle domande «meglio tu o X?»: in quanti assistenti sei il primo nome. */
export function ConfrontoDiretto({ report: r }: { report: Report }) {
  const confronti = confrontoDiretto(r.righe);
  if (confronti.length === 0) return null;
  return (
    <ul className="mt-4 space-y-1.5 text-[15px]">
      {confronti.map((c) => (
        <li key={c.domanda.id} className="tabular">
          <span className="font-semibold">Confronto diretto{c.concorrente ? ` con ${c.concorrente}` : ""}:</span> ti mettono per primo{" "}
          {c.preferito.length} {c.preferito.length === 1 ? "assistente" : "assistenti"} su {c.assistenti}
          {c.preferito.length > 0 ? ` (${c.preferito.map((m) => engine(m).nome).join(", ")})` : ""}.
        </li>
      ))}
    </ul>
  );
}

/**
 * Chi consigliano al posto tuo: una tabella sola. Per ogni nome: citazioni,
 * quota di voce, presenza nei primi tre, domande in cui c'è lui e non tu,
 * assistente che lo cita di più. La tua riga è evidenziata.
 */
export function Concorrenti({ report: r }: { report: Report }) {
  const totale = r.concorrenti[0]?.totale ?? 1;
  const qv = quotaVoce(r.concorrenti, r.citazioniTotali);
  const massimo = Math.max(...r.concorrenti.map((c) => c.citazioni), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-[15px]">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pb-2 pr-3 font-medium">Attività</th>
            <th className="pb-2 pr-3 font-medium">Citazioni su {totale}</th>
            <th className="tabular pb-2 pr-3 text-right font-medium">Quota di voce</th>
            <th className="tabular hidden pb-2 pr-3 text-right font-medium sm:table-cell">Nei primi 3</th>
            <th className="tabular pb-2 pr-3 text-right font-medium">Domande senza di te</th>
            <th className="hidden pb-2 font-medium md:table-cell">Più forte su</th>
          </tr>
        </thead>
        <tbody>
          {r.concorrenti.map((c) => {
            const t = c.seiTu ? undefined : r.testaATesta.find((x) => x.nome === c.nome);
            const chi = r.citaChi.find((x) => x.nome === c.nome);
            const forte = chi
              ? (Object.entries(chi.perMotore) as [keyof typeof chi.perMotore, number][]).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
              : undefined;
            const primi = c.primiTre !== undefined && c.citazioni > 0 ? percentuale(c.primiTre / c.citazioni) : "–";
            return (
              <tr key={c.nome} className={`border-t border-line ${c.seiTu ? "bg-accent-soft/40 font-semibold" : ""}`}>
                <td className={`py-2.5 pr-3 ${c.seiTu ? "text-accent-ink" : ""}`}>
                  {c.nome}
                  {c.seiTu && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-[11px] font-semibold text-white">tu</span>}
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="tabular w-8 shrink-0 text-right">{c.citazioni}</span>
                    <div className="h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-soft">
                      <div className={`h-full rounded-full ${c.seiTu ? "bg-accent" : "bg-[#b9c2be]"}`} style={{ width: `${(c.citazioni / massimo) * 100}%` }} />
                    </div>
                  </div>
                </td>
                <td className="tabular py-2.5 pr-3 text-right">{percentuale(qv[c.nome] ?? 0)}</td>
                <td className="tabular hidden py-2.5 pr-3 text-right sm:table-cell">{primi}</td>
                <td className="tabular py-2.5 pr-3 text-right">{t ? `${t.loroSenzaTe} su ${r.domandeSpontanee}` : "–"}</td>
                <td className="hidden py-2.5 text-sm text-muted md:table-cell">
                  {forte && forte[1] ? `${engine(forte[0]).nome}, ${forte[1]} domande su ${r.domandeSpontanee}` : "–"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">
        Risposte alle {r.domandeSpontanee} domande in cui il cliente non fa il tuo nome. Quota di voce: citazioni dell&apos;attività su tutte le citazioni di attività in quelle risposte
        {r.citazioniTotali ? ` (${r.citazioniTotali})` : ""}. Nei primi 3: quota delle sue citazioni in 1ª, 2ª o 3ª posizione. Domande senza di te: su {r.domandeSpontanee}, quelle in cui compare lui e non tu
        {r.testaATesta.length < r.concorrenti.length - 1 ? ", calcolate per i tre più citati" : ""}.
      </p>
      <ConfrontoDiretto report={r} />
    </div>
  );
}
