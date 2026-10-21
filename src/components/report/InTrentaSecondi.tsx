import type { Report, Verdetto } from "@/lib/types";
import { percentuale, quotaVoce } from "@/lib/stats";
import { ScalaPunteggio } from "./ScalaPunteggio";

/**
 * La prima cosa che il titolare legge: dove sta, chi lo batte, cosa fare.
 * Tre colonne, numeri e una frase ciascuna.
 */
function coloreVerdetto(v: Verdetto) {
  if (v === "Invisibile") return "text-danger";
  if (v === "Poco visibile") return "text-warn";
  return "text-accent";
}

export function InTrentaSecondi({ report: r, abbonato = false }: { report: Report; abbonato?: boolean }) {
  const tu = r.concorrenti.find((c) => c.seiTu);
  const avversari = r.concorrenti.filter((c) => !c.seiTu).slice(0, 3);
  const qv = quotaVoce(r.concorrenti, r.citazioniTotali);
  const prima = r.azioni[0];
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  const storico = abbonato && r.andamento && r.andamento.length >= 2 ? r.andamento : null;
  const delta = storico ? storico[storico.length - 1].punteggio - storico[storico.length - 2].punteggio : null;

  return (
    <section id="trenta" className="scroll-mt-20 py-7 sm:py-9">
      <h2 className="sr-only">In trenta secondi</h2>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {/* Dove sei */}
        <div className="bg-bg p-5 sm:p-6">
          <p className="text-sm text-muted">Dove sei</p>
          <p className="mt-2 flex items-end gap-3">
            <span className={`tabular text-5xl font-bold leading-none ${coloreVerdetto(r.verdetto)}`}>{r.punteggio}</span>
            <span className={`pb-0.5 text-lg font-semibold ${coloreVerdetto(r.verdetto)}`}>{r.verdetto}</span>
            {delta !== null && (
              <span className={`tabular pb-1 text-sm ${delta >= 0 ? "text-accent" : "text-danger"}`}>
                {delta >= 0 ? "+" : ""}
                {delta}
              </span>
            )}
          </p>
          <ScalaPunteggio punteggio={r.punteggio} compatta riferimento={r.contesto ? { valore: r.contesto.mediana, etichetta: "mediana della categoria" } : undefined} />
          <p className="tabular mt-3 text-[15px]">
            {tu && (
              <>
                Compari in {tu.citazioni} risposte su {tu.totale} alle domande in cui il cliente non fa il tuo nome; quota di voce {percentuale(qv[tu.nome] ?? 0)}.
              </>
            )}{" "}
            {r.contesto && (
              <>
                Più alto del {r.contesto.percentile}% delle {r.contesto.attivitaAnalizzate} {r.contesto.categoria} analizzate a {r.contesto.citta} (mediana {r.contesto.mediana}).
              </>
            )}
          </p>
        </div>

        {/* Chi ti passa davanti */}
        <div className="bg-bg p-5 sm:p-6">
          <p className="text-sm text-muted">Chi ti passa davanti</p>
          <ol className="mt-2 space-y-2">
            {avversari.map((c, i) => {
              const t = r.testaATesta.find((x) => x.nome === c.nome);
              return (
                <li key={c.nome} className="flex items-baseline gap-2 text-[15px]">
                  <span className="tabular w-4 shrink-0 text-faint">{i + 1}.</span>
                  <span>
                    <span className="font-semibold">{c.nome}</span>
                    <span className="tabular block text-sm text-muted">
                      {c.citazioni} citazioni, quota di voce {percentuale(qv[c.nome] ?? 0)}
                      {t ? `; in ${t.loroSenzaTe} domande su ${r.domandeSpontanee} c'è lui e non tu` : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          {tu && <p className="tabular mt-3 text-sm text-muted">Tu: {tu.citazioni} citazioni, quota di voce {percentuale(qv[tu.nome] ?? 0)}.</p>}
        </div>

        {/* Cosa fare prima */}
        <div className="bg-accent-soft/50 p-5 sm:p-6">
          <p className="text-sm text-muted">La prima cosa da fare</p>
          {prima && (
            <>
              <p className="mt-2 text-[17px] font-semibold">{prima.titolo}</p>
              <p className="mt-1 text-sm text-muted">{prima.dato}</p>
              <p className="tabular mt-3 text-sm">
                {prima.impattoStimato !== undefined && (
                  <>
                    Stima <span className="font-semibold text-accent">+{prima.impattoStimato} punti</span>
                    {guadagno > prima.impattoStimato ? `; con tutte e tre, +${guadagno}.` : "."}
                  </>
                )}{" "}
                <a href="#azioni" className="font-semibold text-accent underline underline-offset-2">
                  Le tre azioni
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
