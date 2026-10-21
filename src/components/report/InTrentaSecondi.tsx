import type { Report, Verdetto } from "@/lib/types";

/**
 * La prima cosa che il titolare legge: dove sta, chi lo batte, cosa fare.
 * Tre colonne, una frase ciascuna, niente altro.
 */
function coloreVerdetto(v: Verdetto) {
  if (v === "Invisibile") return "text-danger";
  if (v === "Poco visibile") return "text-warn";
  return "text-accent";
}

export function InTrentaSecondi({ report: r }: { report: Report }) {
  const tu = r.concorrenti.find((c) => c.seiTu);
  const avversari = r.concorrenti.filter((c) => !c.seiTu).slice(0, 3);
  const prima = r.azioni[0];
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);

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
          </p>
          <p className="mt-3 text-[15px]">
            {r.contesto ? (
              <>
                Più alto del <span className="tabular font-semibold">{r.contesto.percentile}%</span> delle {r.contesto.categoria} analizzate a{" "}
                {r.contesto.citta}. Mediana: {r.contesto.mediana}.
              </>
            ) : tu ? (
              <>
                Compari in <span className="tabular font-semibold">{tu.citazioni}</span> risposte su {tu.totale}.
              </>
            ) : null}
          </p>
        </div>

        {/* Chi ti passa davanti */}
        <div className="bg-bg p-5 sm:p-6">
          <p className="text-sm text-muted">Chi ti passa davanti</p>
          <ol className="mt-2 space-y-1.5">
            {avversari.map((c, i) => {
              const t = r.testaATesta.find((x) => x.nome === c.nome);
              return (
                <li key={c.nome} className="flex items-baseline gap-2 text-[15px]">
                  <span className="tabular w-4 shrink-0 text-faint">{i + 1}.</span>
                  <span>
                    <span className="font-semibold">{c.nome}</span>
                    <span className="tabular block text-sm text-muted">
                      {c.citazioni} citazioni{tu ? ` (tu ${tu.citazioni})` : ""}
                      {t ? `, in ${t.loroSenzaTe} domande senza di te` : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
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
                    Vale circa <span className="font-semibold text-accent">+{prima.impattoStimato} punti</span>
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
