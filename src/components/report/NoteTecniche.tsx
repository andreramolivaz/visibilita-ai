import { engine } from "@/lib/engines";
import type { Report } from "@/lib/types";
import { coerenzaDati, concentrazione, copertura, percentuale, posizioneMedia, primiTre, stabilita, tassoCitazione } from "@/lib/stats";
import { RIFERIMENTI } from "@/lib/riferimenti";
import { Guida } from "./Guida";

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

/**
 * Tutto quello che serve a verificare il report e niente di quello che serve
 * a leggerlo: numeri chiave con campione e intervallo, dati della scansione,
 * riferimenti esterni, definizioni. Chiuso di default.
 */
export function NoteTecniche({ report: r }: { report: Report }) {
  const cit = tassoCitazione(r.righe, r.ripetizioni);
  const cop = copertura(r.righe);
  const stab = stabilita(r.righe, r.ripetizioni);
  const pos = posizioneMedia(r.righe);
  const top3 = primiTre(r.righe);
  const conc = concentrazione(r.concorrenti);
  const coer = coerenzaDati(r.attivita);
  const totale = r.domande * r.motori.length * r.ripetizioni;

  const tiles: [string, string, string][] = [
    ["Risposte in cui compari", percentuale(cit.quota), `${cit.k} su ${cit.n} · Wilson 95%: ${percentuale(cit.ic.basso)}–${percentuale(cit.ic.alto)} · tra domande: ${percentuale(cit.icDomande.basso)}–${percentuale(cit.icDomande.alto)}`],
    ["Domande in cui compari", percentuale(cop.quota), `${cop.k} su ${cop.n}`],
    ["Nei primi tre, quando compari", percentuale(top3.quota), `${top3.k} su ${top3.n} citazioni · tra domande ${percentuale(top3.icDomande.basso)}–${percentuale(top3.icDomande.alto)} · posizione media ${pos ? pos.toLocaleString("it-IT", { maximumFractionDigits: 1 }) : "–"}, solo descrittiva`],
    ["Stabilità delle risposte", percentuale(stab.quota), `${stab.concordi} celle su ${stab.totale} concordano su tutte le ${r.ripetizioni} ripetizioni (forma breve e a lista comprese)`],
    ["Concentrazione dei consigli", percentuale(conc.quotaTop3), `quota dei tre nomi più citati su ${conc.totale} citazioni`],
    ["Dati di scheda coerenti", `${coer.coerenti} su ${coer.totale}`, coer.coerenti === coer.totale ? "nome, indirizzo, telefono, orari, categoria, sito" : r.attivita.incoerenze.join(" ")],
  ];

  return (
    <section id="note" className="scroll-mt-20 py-7 sm:py-9">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 [&::-webkit-details-marker]:hidden">
          <span>
            <h2 className="inline text-xl font-semibold sm:text-2xl">Note tecniche</h2>
            <span className="ml-3 text-[15px] text-muted">numeri chiave, scansione, riferimenti, definizioni</span>
          </span>
          <span className="shrink-0 text-faint transition-transform group-open:rotate-45" aria-hidden="true">
            +
          </span>
        </summary>

        <div className="mt-5 space-y-8">
          <div>
            <h3 className="font-semibold">Numeri chiave</h3>
            <dl className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {tiles.map(([nome, valore, nota]) => (
                <div key={nome} className="bg-bg p-4">
                  <dt className="text-sm text-muted">{nome}</dt>
                  <dd className="tabular mt-1 text-2xl font-bold tracking-tight">{valore}</dd>
                  <dd className="tabular mt-1 text-xs text-muted">{nota}</dd>
                </div>
              ))}
            </dl>
          </div>

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
                  {r.domandeSpontanee * r.motori.length * r.ripetizioni} risposte): quelle in cui il cliente non fa il tuo nome. Gli intervalli «tra domande» vengono da un bootstrap
                  che ricampiona le domande intere, perché le risposte alla stessa domanda sono correlate: sono più larghi di quelli di Wilson e sono quelli da usare.
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
        </div>
      </details>
    </section>
  );
}
