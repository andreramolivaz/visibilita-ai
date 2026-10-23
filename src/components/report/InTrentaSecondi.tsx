import type { Report, Verdetto } from "@/lib/types";
import { ScalaPunteggio } from "./ScalaPunteggio";

/**
 * La prima cosa che il titolare legge: dove sta e chi gli passa davanti.
 * Due riquadri, numeri semplici; le azioni vengono subito sotto, nello stesso tab.
 * Intervalli e quote stanno nel tab Dettagli.
 */
function coloreVerdetto(v: Verdetto) {
  if (v === "Invisibile") return "text-danger";
  if (v === "Poco visibile") return "text-warn";
  return "text-accent";
}

export function InTrentaSecondi({ report: r, abbonato = false }: { report: Report; abbonato?: boolean }) {
  const tu = r.concorrenti.find((c) => c.seiTu);
  const avversari = r.concorrenti.filter((c) => !c.seiTu).slice(0, 3);
  const storico = abbonato && r.andamento && r.andamento.length >= 2 ? r.andamento : null;
  const delta = storico ? storico[storico.length - 1].punteggio - storico[storico.length - 2].punteggio : null;

  return (
    <section id="trenta" className="scroll-mt-32 pt-8">
      <h2 className="sr-only">In sintesi</h2>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
        {/* Dove sei */}
        <div className="bg-bg p-5 sm:p-6">
          <p className="text-sm text-muted">Dove sei</p>
          <p className="mt-2 flex items-end gap-3">
            <span className={`tabular text-6xl font-bold leading-none ${coloreVerdetto(r.verdetto)}`}>{r.punteggio}</span>
            <span className="pb-1">
              <span className={`block text-lg font-semibold leading-tight ${coloreVerdetto(r.verdetto)}`}>{r.verdetto}</span>
              <span className="text-sm text-muted">su 100</span>
            </span>
            {delta !== null && (
              <span className={`tabular pb-1.5 text-sm font-semibold ${delta >= 0 ? "text-accent" : "text-danger"}`}>
                {delta >= 0 ? "+" : ""}
                {delta} dal mese scorso
              </span>
            )}
          </p>
          <ScalaPunteggio punteggio={r.punteggio} compatta riferimento={r.contesto ? { valore: r.contesto.mediana, etichetta: "mediana della categoria" } : undefined} />
          <p className="tabular mt-4 text-[15px]">
            {tu && (
              <>
                Quando un cliente non fa il tuo nome, gli assistenti ti nominano in {tu.citazioni} risposte su {tu.totale}.
              </>
            )}{" "}
            {r.contesto && (
              <>
                Sei più in alto del {r.contesto.percentile}% delle {r.contesto.categoria} di {r.contesto.citta} che abbiamo analizzato.
              </>
            )}
          </p>
        </div>

        {/* Chi ti passa davanti */}
        <div className="bg-bg p-5 sm:p-6">
          <p className="text-sm text-muted">Chi consigliano al posto tuo</p>
          <ol className="mt-3 space-y-3">
            {avversari.map((c, i) => (
              <li key={c.nome} className="flex items-baseline gap-3">
                <span className="tabular w-4 shrink-0 text-faint">{i + 1}.</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{c.nome}</span>
                    <span className="tabular shrink-0 text-sm text-muted">{c.citazioni} risposte</span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-soft">
                    <span className="block h-full rounded-full bg-[#b9c2be]" style={{ width: `${(c.citazioni / c.totale) * 100}%` }} />
                  </span>
                </span>
              </li>
            ))}
            {tu && (
              <li className="flex items-baseline gap-3">
                <span className="w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-accent">
                      Tu
                    </span>
                    <span className="tabular shrink-0 text-sm text-muted">{tu.citazioni} risposte</span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-soft">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${(tu.citazioni / tu.totale) * 100}%` }} />
                  </span>
                </span>
              </li>
            )}
          </ol>
          {tu && <p className="tabular mt-4 text-sm text-muted">Su {tu.totale} risposte alle domande in cui il cliente non fa il tuo nome.</p>}
        </div>
      </div>
    </section>
  );
}
