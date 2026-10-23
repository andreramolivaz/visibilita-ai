import Link from "next/link";
import { engine } from "@/lib/engines";
import { REPORT_ESEMPIO } from "@/lib/mock-report";
import { Barra } from "@/components/ui";
import { ScalaPunteggio } from "@/components/report/ScalaPunteggio";
import { periodoScansione } from "@/components/report/NoteTecniche";

/**
 * Il report di esempio, ridotto a quello che conta: punteggio, assistenti,
 * concorrenti, azioni. Dentro una finestra con la sua intestazione, perché
 * è il prodotto che si compra.
 */
export function AnteprimaReport() {
  const r = REPORT_ESEMPIO;
  const tu = r.concorrenti.find((c) => c.seiTu)!;
  const primo = r.concorrenti.filter((c) => !c.seiTu)[0];
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-bg shadow-[0_1px_2px_rgba(20,32,28,0.04),0_30px_70px_-30px_rgba(20,32,28,0.25)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-soft/70 px-5 py-3 text-[13px] text-muted sm:px-8">
        <span className="font-semibold text-ink">Report di visibilità AI</span>
        <span>
          {r.attivita.nome}, {r.attivita.citta}
        </span>
        <span className="tabular">{periodoScansione(r.metodo.inizio, r.metodo.fine)}</span>
      </div>
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="text-sm text-muted">Dove sei</p>
          <div className="mt-1 flex items-end gap-4">
            <span className="punteggio text-warn">{r.punteggio}</span>
            <span className="pb-1">
              <span className="block text-xl font-semibold text-warn">{r.verdetto}</span>
              <span className="text-sm text-muted">su 100</span>
            </span>
          </div>
          <ScalaPunteggio punteggio={r.punteggio} compatta />
          <p className="mt-5 text-[15px]">
            Gli assistenti ti nominano in {tu.citazioni} risposte su {tu.totale}; {primo.nome} in {primo.citazioni}.
          </p>
          <p className="mt-6 text-sm font-semibold">Per assistente</p>
          <div className="mt-1">
            {r.perMotore.map((m) => (
              <Barra key={m.motore} etichetta={engine(m.motore).nome} valore={m.comparse} massimo={m.totale} testo={`${m.comparse} su ${m.totale}`} accento />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Chi consigliano al posto tuo</p>
          <div className="mt-1">
            {r.concorrenti.slice(0, 4).map((c) => (
              <Barra key={c.nome} etichetta={c.nome} valore={c.citazioni} massimo={r.concorrenti[0].totale} testo={`${c.citazioni} su ${c.totale}`} tu={c.seiTu} />
            ))}
          </div>

          <p className="mt-7 text-sm font-semibold">Cosa fare, in ordine di impatto</p>
          <ol className="mt-2 space-y-2.5">
            {r.azioni.map((a, i) => (
              <li key={a.titolo} className="flex gap-3 text-[15px]">
                <span className="tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">{i + 1}</span>
                <span>
                  <span className="font-medium">{a.titolo}</span>
                  {a.impattoStimato !== undefined && <span className="tabular ml-2 text-sm text-accent">+{a.impattoStimato}</span>}
                  <span className="block text-sm text-muted">{a.dato}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-sm sm:px-8">
        <span className="text-muted">Nel report completo anche le domande una per una, le fonti e cosa dice di te ogni assistente.</span>
        <Link href="/report/esempio" className="shrink-0 font-semibold text-accent underline underline-offset-2">
          Apri il report di esempio
        </Link>
      </div>
    </div>
  );
}
