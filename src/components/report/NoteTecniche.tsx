import { engine } from "@/lib/engines";
import type { Report } from "@/lib/types";
import {
  TIPI_SPONTANEI,
  coerenzaDati,
  concentrazione,
  copertura,
  perFamiglia,
  percentuale,
  posizioneMedia,
  primiTre,
  punteggioIntervallo,
  quotaVoce,
  stabilita,
  tassoCitazione,
} from "@/lib/stats";
import { RIFERIMENTI } from "@/lib/riferimenti";
import { Guida } from "./Guida";
import { Forma } from "./Telescopio";

const dataIt = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
const oraIt = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

/** «18–20 ottobre 2026» se la scansione è su più giorni, altrimenti «20 ottobre 2026, 10:12–10:14». */
export function periodoScansione(inizio: string, fine: string) {
  const a = new Date(inizio);
  const b = new Date(fine);
  const stessoGiorno = a.toDateString() === b.toDateString();
  if (stessoGiorno) return `${dataIt(inizio)}, ${oraIt(inizio)}–${oraIt(fine)}`;
  const stessoMese = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return stessoMese ? `${a.getDate()}–${dataIt(fine)}` : `${dataIt(inizio)} – ${dataIt(fine)}`;
}

const NOME_FAMIGLIA: Record<string, string> = {
  generica: "Generiche",
  bisogno: "Per bisogno",
  specialita: "Per specialità",
  requisito: "Per requisito",
  prezzo: "Per prezzo",
  occasione: "Per occasione",
  recensioni: "Per recensioni",
  vicino: "Vicino a te",
};

/**
 * Il tab Dettagli: tutto quello che serve a verificare il report e niente di
 * quello che serve a leggerlo. Numeri chiave con campione e intervalli, le
 * famiglie con le loro stime, la forma della domanda, i dati della scansione,
 * i riferimenti esterni e le definizioni. Il metodo completo è nel white paper.
 */
export function NoteTecniche({ report: r }: { report: Report }) {
  const cit = tassoCitazione(r.righe, r.ripetizioni);
  const cop = copertura(r.righe);
  const stab = stabilita(r.righe, r.ripetizioni);
  const pos = posizioneMedia(r.righe);
  const top3 = primiTre(r.righe);
  const conc = concentrazione(r.concorrenti);
  const coer = coerenzaDati(r.attivita);
  const ic = punteggioIntervallo(r.righe, r.ripetizioni);
  const qv = quotaVoce(r.concorrenti, r.citazioniTotali);
  const tu = r.concorrenti.find((c) => c.seiTu);
  const famiglie = perFamiglia(r.righe, r.ripetizioni).filter((f) => TIPI_SPONTANEI.includes(f.tipo));
  const totale = r.domande * r.motori.length * r.ripetizioni;

  const tiles: [string, string, string][] = [
    ["Punteggio", `${r.punteggio}`, `su 100 · intervallo tra domande ${ic.basso}–${ic.alto}`],
    ["Risposte in cui compari", percentuale(cit.quota), `${cit.k} su ${cit.n} · Wilson 95%: ${percentuale(cit.ic.basso)}–${percentuale(cit.ic.alto)} · tra domande: ${percentuale(cit.icDomande.basso)}–${percentuale(cit.icDomande.alto)}`],
    ["Quota di voce", tu ? percentuale(qv[tu.nome] ?? 0) : "–", `le tue citazioni su tutte le citazioni di attività${r.citazioniTotali ? ` (${r.citazioniTotali})` : ""}`],
    ["Domande in cui compari", percentuale(cop.quota), `${cop.k} su ${cop.n}`],
    ["Nei primi tre, quando compari", percentuale(top3.quota), `${top3.k} su ${top3.n} citazioni · tra domande ${percentuale(top3.icDomande.basso)}–${percentuale(top3.icDomande.alto)} · posizione media ${pos ? pos.toLocaleString("it-IT", { maximumFractionDigits: 1 }) : "–"}`],
    ["Stabilità delle risposte", percentuale(stab.quota), `${stab.concordi} celle su ${stab.totale} uguali in tutte le ${r.ripetizioni} ripetizioni`],
    ["Concentrazione dei consigli", percentuale(conc.quotaTop3), `quota dei tre nomi più citati su ${conc.totale} citazioni`],
    ["Dati di scheda coerenti", `${coer.coerenti} su ${coer.totale}`, coer.coerenti === coer.totale ? "nome, indirizzo, telefono, orari, categoria, sito" : r.attivita.incoerenze.join(" ")],
  ];

  return (
    <section id="note" className="scroll-mt-32 space-y-10 py-8">
      <div className="flex flex-col gap-3 rounded-2xl bg-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-muted">Per chi vuole verificare i numeri: campione, intervalli, definizioni. Il metodo completo è nel white paper.</p>
        <a href="/white-paper-visibilita-ai.pdf" target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-accent underline underline-offset-2">
          Scarica il white paper
        </a>
      </div>

      <div>
        <h3 className="font-semibold">Numeri chiave</h3>
        <dl className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(([nome, valore, nota]) => (
            <div key={nome} className="bg-bg p-4">
              <dt className="text-sm text-muted">{nome}</dt>
              <dd className="tabular mt-1 text-2xl font-bold tracking-tight">{valore}</dd>
              <dd className="tabular mt-1 text-xs text-muted">{nota}</dd>
            </div>
          ))}
        </dl>
      </div>

      {famiglie.length > 0 && (
        <div>
          <h3 className="font-semibold">Per tipo di domanda</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-2 pr-3 font-medium">Famiglia</th>
                  <th className="tabular pb-2 pr-3 text-right font-medium">Risposte</th>
                  <th className="tabular pb-2 pr-3 text-right font-medium">Quota</th>
                  <th className="tabular pb-2 pr-3 text-right font-medium">Tra domande, 95%</th>
                  <th className="tabular pb-2 text-right font-medium">Stima ridotta</th>
                </tr>
              </thead>
              <tbody>
                {famiglie.map((f) => (
                  <tr key={f.tipo} className="border-t border-line">
                    <td className="py-2 pr-3">{NOME_FAMIGLIA[f.tipo] ?? f.tipo}</td>
                    <td className="tabular py-2 pr-3 text-right">
                      {f.k} su {f.n}
                    </td>
                    <td className="tabular py-2 pr-3 text-right">{percentuale(f.n ? f.k / f.n : 0)}</td>
                    <td className="tabular py-2 pr-3 text-right">
                      {percentuale(f.icDomande.basso)}–{percentuale(f.icDomande.alto)}
                    </td>
                    <td className="tabular py-2 text-right">{percentuale(f.ridotta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            «Tra domande» è l&apos;intervallo che vale per domande di quel tipo, non solo per quelle fatte: ricampiona le domande intere, perché le risposte alla stessa domanda si
            somigliano. La stima ridotta tira le famiglie con poche domande verso la media del report.
          </p>
        </div>
      )}

      <Forma report={r} />

      <div>
        <h3 className="font-semibold">Scansione</h3>
        <dl className="mt-3 grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Quando</dt>
            <dd>{periodoScansione(r.metodo.inizio, r.metodo.fine)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Posizione, lingua, canale</dt>
            <dd>
              {r.metodo.posizione}, {r.metodo.lingua}
              {r.metodo.canale ? `, ${r.metodo.canale}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Campione</dt>
            <dd className="tabular">
              {r.domande} intenti × {r.motori.length} assistenti × {r.ripetizioni} ripetizioni = {totale} risposte. Ogni intento spontaneo è chiesto in forma breve e, la seconda volta, con la
              richiesta esplicita di più opzioni: due forme, non due domande. Punteggio e numeri chiave sulle {r.domandeSpontanee} domande spontanee (
              {r.domandeSpontanee * r.motori.length * r.ripetizioni} risposte), quelle in cui il cliente non fa il tuo nome.
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Peso degli assistenti nel punteggio</dt>
            <dd className="tabular">{r.motori.map((m) => `${engine(m).nome} ${Math.round(engine(m).peso * 100)}%`).join(", ")}, rinormalizzati sugli assistenti interrogati</dd>
          </div>
        </dl>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {r.metodo.note.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Riferimenti esterni</h3>
        <p className="mt-1 text-sm text-muted">Quanto è normale non comparire, secondo gli studi di settore. Servono a leggere il tuo numero, non a sostituirlo.</p>
        <ul className="mt-3 space-y-2 text-[15px]">
          {RIFERIMENTI.map((x) => (
            <li key={x.url}>
              {x.dato}{" "}
              <a href={x.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted underline underline-offset-2 hover:text-ink">
                {x.fonte}, {x.anno}, {x.campione}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Guida />
    </section>
  );
}
