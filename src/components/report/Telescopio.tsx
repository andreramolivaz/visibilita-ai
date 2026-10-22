import { engine } from "@/lib/engines";
import type { EngineId, Report, RisultatoPunto, Zoom } from "@/lib/types";
import { Barra } from "@/components/ui";
import { percentuale, quotaPunti } from "@/lib/stats";

/**
 * Il telescopio: la stessa misura a tre livelli di zoom (città, zona, vicino
 * a te), i punti intorno all'attività, le occasioni, quanto conta la forma
 * della domanda e cosa succede nelle domande informative. Solo barre e una
 * mappa a celle, un colore.
 */

export const NOME_ZOOM: Record<Zoom, { titolo: string; esempio: string }> = {
  citta: { titolo: "Città", esempio: "«a Bergamo»" },
  zona: { titolo: "Zona", esempio: "«in zona centro»" },
  vicino: { titolo: "Vicino a te", esempio: "«vicino a me», posizione impostata" },
  provincia: { titolo: "Provincia", esempio: "«in provincia di…»" },
  regione: { titolo: "Regione", esempio: "«in Lombardia»" },
  nazionale: { titolo: "Italia", esempio: "«in Italia», «nel nord Italia»" },
};

/** La griglia dei punti: nord in alto, est a destra; gli angoli restano vuoti con cinque punti. */
const GRIGLIA: (RisultatoPunto["punto"]["etichetta"] | null)[][] = [
  ["nord-ovest", "nord", "nord-est"],
  ["ovest", "centro", "est"],
  ["sud-ovest", "sud", "sud-est"],
];

function IntornoATe({ punti, motori, ripetizioni }: { punti: RisultatoPunto[]; motori: EngineId[]; ripetizioni: number }) {
  const per = new Map(punti.map((p) => [p.punto.etichetta, p]));
  const raggio = Math.max(...punti.map((p) => Math.max(Math.abs(p.punto.nordM), Math.abs(p.punto.estM))), 0);
  const qp = quotaPunti(punti);
  const perPunto = punti[0]?.totale ?? 0;
  const pesoMedio = punti.length ? punti.reduce((a, p) => a + (p.peso ?? 0), 0) / punti.length : 0;
  const presenti = GRIGLIA.flat().filter((e) => e && per.has(e));
  const righe = presenti.length <= 5 ? GRIGLIA.filter((riga) => riga.some((e) => e && per.has(e))) : GRIGLIA;
  return (
    <div>
      <p className="tabular text-[15px]">
        Compari in {qp.k} {qp.k === 1 ? "punto" : "punti"} su {qp.n}.
      </p>
      <div className="mt-3 grid max-w-[260px] grid-cols-3 gap-1.5">
        {righe.flat().map((etichetta, i) => {
          const p = etichetta ? per.get(etichetta) : undefined;
          if (!p) return <div key={i} className="aspect-square rounded-lg border border-dashed border-line" aria-hidden="true" />;
          const quota = p.ridotta ?? (p.totale ? p.comparse / p.totale : 0);
          const scuro = quota >= 0.45;
          return (
            <div
              key={i}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-center ${etichetta === "centro" ? "ring-2 ring-ink/70" : ""} ${scuro ? "text-white" : "text-ink"}`}
              style={{ background: `color-mix(in oklab, var(--accent) ${Math.round(12 + quota * 88)}%, var(--soft))` }}
              title={`${etichetta}: ${p.comparse} risposte su ${p.totale}; stima ridotta ${percentuale(quota)}`}
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
        Posizione impostata al tuo indirizzo e a {raggio >= 1000 ? `${(raggio / 1000).toLocaleString("it-IT", { maximumFractionDigits: 1 })} km` : `${raggio} m`} nelle quattro direzioni, su{" "}
        {motori.map((m) => engine(m).nome).join(" e ")}: gli assistenti che accettano le coordinate in italiano. {ripetizioni} ripetizioni, {perPunto} risposte per punto: troppo poche per
        leggere un punto da solo, perciò la percentuale è la stima ridotta verso la media dei punti (il dato grezzo pesa circa il {percentuale(1 - pesoMedio)}) e la mappa non si
        confronta punto per punto da un report all&apos;altro.
      </p>
    </div>
  );
}

function Forma({ report: r }: { report: Report }) {
  const f = r.sensibilitaForma;
  if (!f || f.domande < 3) return null;
  const qb = f.breve.totale ? f.breve.comparse / f.breve.totale : 0;
  const ql = f.lista.totale ? f.lista.comparse / f.lista.totale : 0;
  const rumore = Math.abs(f.differenza) < 2 * f.errore;
  const segno = f.differenza > 0 ? "+" : "";
  return (
    <div>
      <h3 className="font-semibold">La forma della domanda</h3>
      <p className="tabular mt-2 text-[15px]">
        Forma breve: compari nel {percentuale(qb)} delle risposte. Con la richiesta esplicita di più opzioni: {percentuale(ql)}. Differenza {segno}
        {f.differenza.toLocaleString("it-IT", { maximumFractionDigits: 0 })} punti (±{(2 * f.errore).toLocaleString("it-IT", { maximumFractionDigits: 0 })}), su {f.domande} domande chieste nelle due forme.
      </p>
      <p className="mt-2 text-xs text-muted">
        {rumore
          ? "La differenza è dentro il rumore: le parole non cambiano il risultato, e le due forme si sommano come ripetizioni."
          : f.differenza > 0
            ? "Quando il cliente chiede una lista compari di più: nelle risposte brevi resti fuori. È un segno di notorietà debole, non di assenza."
            : "Quando il cliente chiede una lista compari di meno: con più nomi in gioco scivoli fuori dai primi."}
      </p>
    </div>
  );
}

function Informative({ report: r }: { report: Report }) {
  const i = r.informativa;
  if (!i || i.domande === 0) return null;
  return (
    <div>
      <h3 className="font-semibold">Domande informative</h3>
      <p className="tabular mt-2 text-[15px]">
        «Come scegliere», «quanto costa in media»: {i.domande} domande, {i.risposte} risposte. {i.conNomi} fanno almeno un nome di attività; tu ci sei in {i.comparse}.
      </p>
      <p className="mt-2 text-xs text-muted">Sono le domande su cui Google mostra più spesso le AI Overviews. Spesso non fanno nomi: per questo non entrano nel punteggio e si contano sulle risposte che ne fanno almeno uno.</p>
    </div>
  );
}

export function Telescopio({ report: r }: { report: Report }) {
  const zoom = r.perZoom ?? [];
  const occasioni = r.perOccasione ?? [];
  const intorno = r.intorno;
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-8">
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
          <p className="mt-2 text-xs text-muted">
            La stessa domanda, da lontano a vicino: dove ti citano solo quando il cliente è già nella tua zona, manca la notorietà in città. «Vicino a te» conta solo gli assistenti che
            accettano la posizione; per gli altri «vicino a me» è la città, e le loro risposte stanno lì.
          </p>
        </div>
        <Forma report={r} />
        <Informative report={r} />
      </div>
      <div className="space-y-8">
        {intorno && intorno.punti.length > 1 && (
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
