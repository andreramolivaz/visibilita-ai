import { engine } from "@/lib/engines";
import type { EngineId, Report, RisultatoPunto, Zoom } from "@/lib/types";
import { Barra } from "@/components/ui";
import { percentuale } from "@/lib/stats";

/**
 * Il telescopio: la stessa misura a tre livelli di zoom (città, zona, vicino
 * a te), i punti intorno all'attività, le occasioni, e quanto conta la
 * formulazione. Solo barre e una mappa a celle, un colore.
 */

export const NOME_ZOOM: Record<Zoom, { titolo: string; esempio: string }> = {
  citta: { titolo: "Città", esempio: "«a Bergamo»" },
  zona: { titolo: "Zona", esempio: "«in zona centro»" },
  vicino: { titolo: "Vicino a te", esempio: "«vicino a me», posizione impostata" },
  provincia: { titolo: "Provincia", esempio: "«in provincia di…»" },
  regione: { titolo: "Regione", esempio: "«in Lombardia»" },
  nazionale: { titolo: "Italia", esempio: "«in Italia», «nel nord Italia»" },
};

/** La griglia 3×3 dei punti: nord in alto, est a destra. */
const GRIGLIA: (RisultatoPunto["punto"]["etichetta"] | null)[][] = [
  ["nord-ovest", "nord", "nord-est"],
  ["ovest", "centro", "est"],
  ["sud-ovest", "sud", "sud-est"],
];

function IntornoATe({ punti, motori, ripetizioni }: { punti: RisultatoPunto[]; motori: EngineId[]; ripetizioni: number }) {
  const per = new Map(punti.map((p) => [p.punto.etichetta, p]));
  const raggio = Math.max(...punti.map((p) => Math.max(Math.abs(p.punto.nordM), Math.abs(p.punto.estM))), 0);
  return (
    <div>
      <div className="grid max-w-[260px] grid-cols-3 gap-1.5">
        {GRIGLIA.flat().map((etichetta, i) => {
          const p = etichetta ? per.get(etichetta) : undefined;
          if (!p) return <div key={i} className="aspect-square rounded-lg border border-dashed border-line" aria-hidden="true" />;
          const quota = p.totale ? p.comparse / p.totale : 0;
          const scuro = quota >= 0.45;
          return (
            <div
              key={i}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-center ${etichetta === "centro" ? "ring-2 ring-ink/70" : ""} ${scuro ? "text-white" : "text-ink"}`}
              style={{ background: `color-mix(in oklab, var(--accent) ${Math.round(12 + quota * 88)}%, var(--soft))` }}
              title={`${etichetta}: ${p.comparse} risposte su ${p.totale}`}
            >
              <span className="tabular text-[15px] font-semibold leading-none">{percentuale(quota)}</span>
              <span className={`tabular mt-1 text-[11px] leading-none ${scuro ? "text-white/80" : "text-muted"}`}>
                {p.comparse}/{p.totale}
              </span>
              <span className={`mt-1 text-[10px] leading-none ${scuro ? "text-white/70" : "text-faint"}`}>{etichetta === "centro" ? "da te" : etichetta}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 max-w-md text-xs text-muted">
        Risposte in cui compari quando la posizione è impostata in quel punto (il centro è il tuo indirizzo, gli altri a {raggio >= 1000 ? `${(raggio / 1000).toLocaleString("it-IT", { maximumFractionDigits: 1 })} km` : `${raggio} m`}), su{" "}
        {motori.map((m) => engine(m).nome).join(", ")}: gli assistenti che accettano le coordinate. {ripetizioni} ripetizioni.
      </p>
    </div>
  );
}

export function Telescopio({ report: r }: { report: Report }) {
  const zoom = r.perZoom ?? [];
  const occasioni = r.perOccasione ?? [];
  const intorno = r.intorno;
  const f = r.formulazioni;
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <h3 className="font-semibold">Per livello di zoom</h3>
        <div className="mt-3">
          {zoom.map((z) => (
            <Barra
              key={z.zoom}
              etichetta={NOME_ZOOM[z.zoom].titolo}
              valore={z.comparse}
              massimo={z.totale}
              testo={`${z.comparse} su ${z.totale}`}
              sotto={`${z.domande} ${z.domande === 1 ? "domanda" : "domande"} · ${NOME_ZOOM[z.zoom].esempio}`}
              accento
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">La stessa domanda, da lontano a vicino: dove ti citano solo quando il cliente è già nella tua zona, manca la notorietà in città.</p>
        {f && f.gruppi > 0 && (
          <p className="tabular mt-4 text-[15px]">
            Formulazione: in {f.concordi} {f.concordi === 1 ? "intento" : "intenti"} su {f.gruppi} chiesti in più modi il risultato non cambia con le parole.
          </p>
        )}
      </div>
      <div className="space-y-8">
        {intorno && intorno.punti.length > 0 && (
          <div>
            <h3 className="font-semibold">Intorno a te</h3>
            <div className="mt-3">
              <IntornoATe punti={intorno.punti} motori={intorno.motori} ripetizioni={r.ripetizioni} />
            </div>
          </div>
        )}
        {occasioni.length > 0 && (
          <div>
            <h3 className="font-semibold">Per occasione</h3>
            <div className="mt-3">
              {occasioni.map((o) => (
                <Barra key={o.occasione} etichetta={o.occasione} valore={o.comparse} massimo={o.totale} testo={`${o.comparse} su ${o.totale}`} accento />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Chi chiede e perché: famiglia, coppia, lavoro, gruppo, turisti, budget, subito. Risposte in cui compari sul totale di quell&apos;occasione.</p>
          </div>
        )}
      </div>
    </div>
  );
}
