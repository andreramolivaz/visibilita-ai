import { engine } from "@/lib/engines";
import type { Report as ReportT, TipoDomanda } from "@/lib/types";
import { Barra, Bottone, Etichetta, Scheda } from "@/components/ui";
import { Andamento } from "./Andamento";
import { CopiaLink } from "./CopiaLink";
import { Heatmap } from "./Heatmap";
import { Posizioni } from "./Posizioni";
import { Potenziale } from "./Potenziale";
import { InTrentaSecondi } from "./InTrentaSecondi";
import { Concorrenti } from "./Concorrenti";
import { Territorio } from "./Territorio";
import { NoteTecniche, periodoScansione } from "./NoteTecniche";
import { Telescopio } from "./Telescopio";
import { SchedeReport } from "./SchedeReport";
import { letturaAssistenti, letturaConcorrenti, letturaDicono, letturaFonti, letturaParole, letturaTelescopio, letturaTerritorio, letturaTipi } from "@/lib/letture";
import { punteggioPerMotore } from "@/lib/stats";

export const NOME_TIPO: Record<TipoDomanda, { titolo: string; esempio: string }> = {
  generica: { titolo: "Generiche", esempio: "«miglior pizzeria a Bergamo»" },
  bisogno: { titolo: "Per bisogno", esempio: "«aperta la domenica», «stasera»" },
  specialita: { titolo: "Per specialità", esempio: "«forno a legna», «napoletana»" },
  requisito: { titolo: "Per requisito", esempio: "«con dehors», «aperta adesso»" },
  prezzo: { titolo: "Per prezzo", esempio: "«economica», «buon rapporto qualità prezzo»" },
  occasione: { titolo: "Per occasione", esempio: "«con bambini», «pranzo di lavoro»" },
  recensioni: { titolo: "Per recensioni", esempio: "«con più di 4 stelle», «affidabile»" },
  vicino: { titolo: "Vicino a te", esempio: "«vicino a me», posizione impostata" },
  informativa: { titolo: "Informative", esempio: "«come scegliere…», «quanto costa in media»" },
  confronto: { titolo: "Di confronto", esempio: "«meglio X o Y?»" },
  nome: { titolo: "Sul nome", esempio: "«com'è la Pizzeria Da Gino?»" },
  inglese: { titolo: "In inglese", esempio: "«best … in Bergamo»" },
};

const TONO: Record<string, { testo: string; tono: "accento" | "neutro" | "errore" }> = {
  positivo: { testo: "tono positivo", tono: "accento" },
  neutro: { testo: "tono neutro", tono: "neutro" },
  critico: { testo: "tono critico", tono: "errore" },
};

/** Una sezione: titolo, la riga di lettura (il fatto con i numeri), il contenuto. */
function Blocco({ titolo, lettura, children, id }: { titolo: string; lettura?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-32 py-8 md:scroll-mt-36">
      <h2 className="text-xl font-semibold sm:text-2xl">{titolo}</h2>
      {lettura && <p className="tabular mt-1.5 max-w-prose text-[16px] leading-snug">{lettura}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Il report, in cinque tab: Riepilogo (dove sei, chi ti passa davanti, cosa
 * fare), Concorrenti, Domande (dove ti trovano, domanda per domanda), Fonti
 * (da dove prendono le informazioni, cosa dicono di te) e Dettagli (campione,
 * intervalli, definizioni). Chi legge solo il primo tab ha già tutto quello
 * che gli serve.
 */
export function Report({ report, abbonato = false }: { report: ReportT; abbonato?: boolean }) {
  const r = report;
  const parziali = punteggioPerMotore(r.righe, r.ripetizioni);
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  const totaleRisposte = r.domande * r.motori.length * r.ripetizioni;
  const mostraAndamento = abbonato && !!r.andamento && r.andamento.length >= 2;

  const riepilogo = (
    <div className="divide-y divide-line">
      <InTrentaSecondi report={r} abbonato={abbonato} />
      {mostraAndamento && (
        <section className="py-8">
          <Andamento punti={r.andamento!} />
        </section>
      )}
      <Blocco id="azioni" titolo="Cosa fare, in ordine di impatto">
        {guadagno > 0 && (
          <div className="mb-5">
            <Potenziale punteggio={r.punteggio} azioni={r.azioni} />
          </div>
        )}
        <ol className="space-y-3">
          {r.azioni.map((a, i) => (
            <li key={i}>
              <Scheda className={a.fatta ? "border-accent bg-accent-soft" : ""}>
                <div className="flex items-start gap-3.5">
                  <span className="tabular mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {a.fatta ? "✓" : i + 1}
                  </span>
                  <div>
                    <p className="text-[17px] font-semibold">{a.titolo}</p>
                    <p className="mt-1 text-[15px] text-muted">{a.dato}</p>
                    <p className="mt-2 flex flex-wrap gap-2">
                      <Etichetta tono={a.impatto === "alto" ? "accento" : "neutro"}>impatto {a.impatto}</Etichetta>
                      {a.impattoStimato !== undefined && <Etichetta tono="neutro">circa +{a.impattoStimato} punti</Etichetta>}
                    </p>
                  </div>
                </div>
              </Scheda>
            </li>
          ))}
        </ol>
      </Blocco>
    </div>
  );

  const concorrenti = (
    <Blocco titolo="Chi consigliano al posto tuo" lettura={letturaConcorrenti(r)}>
      <Concorrenti report={r} />
    </Blocco>
  );

  const domande = (
    <div className="divide-y divide-line">
      <Blocco id="dove" titolo="Dove ti trovano" lettura={letturaTerritorio(r)}>
        <Territorio righe={r.righe} />
        <Posizioni righe={r.righe} />
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="font-semibold">Per assistente</h3>
            <p className="tabular mt-1 text-[15px]">{letturaAssistenti(r)}</p>
            <div className="mt-3">
              {r.perMotore.map((m) => (
                <Barra
                  key={m.motore}
                  etichetta={engine(m.motore).nome}
                  valore={m.comparse}
                  massimo={m.totale}
                  testo={`${m.comparse} su ${m.totale}`}
                  sotto={`punteggio ${parziali[m.motore] ?? 0}`}
                  accento
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Domande in cui l&apos;assistente ti nomina almeno una volta, su {r.domandeSpontanee}.</p>
          </div>
          <div>
            <h3 className="font-semibold">Per tipo di domanda</h3>
            <p className="tabular mt-1 text-[15px]">{letturaTipi(r)}</p>
            <div className="mt-3">
              {r.perTipo.map((t) => (
                <Barra
                  key={t.tipo}
                  etichetta={NOME_TIPO[t.tipo].titolo}
                  valore={t.comparse}
                  massimo={t.totale}
                  testo={`${t.comparse} su ${t.totale}`}
                  sotto={NOME_TIPO[t.tipo].esempio}
                  accento
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Risposte in cui compari, su quelle di ogni tipo. Confronto, nome e informative non entrano nel punteggio.</p>
          </div>
        </div>
      </Blocco>

      <Blocco id="telescopio" titolo="Da lontano a vicino, e per chi" lettura={letturaTelescopio(r)}>
        <Telescopio report={r} />
      </Blocco>

      <Blocco id="mappa" titolo="Domanda per domanda">
        <p className="text-sm text-muted">Una cella per ogni domanda e assistente: il posto in cui ti mettono e quante volte su {r.ripetizioni}. Più scura, più in alto.</p>
        <details className="group mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center rounded-lg border border-line px-4 py-2 text-sm font-semibold transition-colors hover:border-ink [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Mostra tutte le {r.domande} domande</span>
            <span className="hidden group-open:inline">Nascondi le domande</span>
          </summary>
          <div className="mt-4">
            <Heatmap righe={r.righe} motori={r.motori} ripetizioni={r.ripetizioni} />
          </div>
        </details>
      </Blocco>
    </div>
  );

  const fonti = (
    <div className="divide-y divide-line">
      <section className="py-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Da dove prendono le informazioni</h2>
            <p className="tabular mt-1.5 text-[16px] leading-snug">{letturaFonti(r)}</p>
            <div className="mt-4">
              {r.fonti.map((f) => (
                <Barra
                  key={f.nome}
                  etichetta={f.nome}
                  valore={f.citazioni}
                  massimo={r.fonti[0]?.citazioni ?? 1}
                  testo={`${f.citazioni}`}
                  sotto={f.concorrentiPresenti !== undefined ? `concorrenti: ${f.concorrentiPresenti} su 5` : undefined}
                  accento={f.ciSei}
                  stato={f.ciSei ? { testo: "ci sei", tono: "accento" } : { testo: "non ci sei", tono: "errore" }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Risposte, su {totaleRisposte}, che citano la fonte. Dove non ci sei, gli assistenti non possono trovarti.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Le parole che usano</h2>
            <p className="tabular mt-1.5 text-[16px] leading-snug">{letturaParole(r)}</p>
            <div className="mt-4">
              {r.termini.map((t) => (
                <Barra
                  key={t.termine}
                  etichetta={t.termine}
                  valore={t.volte}
                  massimo={r.termini[0]?.volte ?? 1}
                  testo={`${t.volte}`}
                  sotto={t.volteTue !== undefined ? `nelle tue recensioni: ${t.volteTue}` : undefined}
                  accento={t.ceLHai}
                  stato={t.ceLHai ? { testo: "ce l'hai", tono: "accento" } : { testo: "manca", tono: "errore" }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Volte in cui la parola compare nelle risposte, e quante nelle tue recensioni Google.</p>
          </div>
        </div>
      </section>

      <Blocco id="dicono" titolo="Cosa dicono di te" lettura={letturaDicono(r)}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {r.descrizioniPerMotore.map((d) => (
            <li key={d.motore} className="rounded-xl bg-soft p-4">
              <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                {engine(d.motore).nome}
                {d.tono && <Etichetta tono={TONO[d.tono].tono}>{TONO[d.tono].testo}</Etichetta>}
                {d.datiCorretti === false && <Etichetta tono="errore">dati da correggere</Etichetta>}
              </p>
              <p className="mt-1.5 text-[15px]">«{d.testo}»</p>
            </li>
          ))}
        </ul>
        {r.errori.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {r.errori.map((e, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px]">
                <Etichetta tono="errore">errore</Etichetta>
                <span>{e.testo}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-muted">Nessun errore nei dati che gli assistenti riportano su di te.</p>
        )}
      </Blocco>
    </div>
  );

  return (
    <article>
      {/* Intestazione */}
      <header className="pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Report di visibilità AI · {periodoScansione(r.metodo.inizio, r.metodo.fine)}</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {r.attivita.nome}, {r.attivita.citta}
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              {r.attivita.categoriaGoogle} · {r.attivita.indirizzo}
            </p>
            <p className="tabular mt-1 text-[15px] text-muted">
              {r.domande} domande a {r.motori.length} assistenti AI, ognuna {r.ripetizioni} volte.
            </p>
          </div>
          <div className="no-print flex gap-2">
            <Bottone href={`/report/${r.id}/pdf`} secondario className="!w-auto !px-4 !py-2 !text-sm" target="_blank">
              Scarica il PDF
            </Bottone>
            <CopiaLink />
          </div>
        </div>
      </header>

      <SchedeReport
        schede={[
          { id: "riepilogo", titolo: "Riepilogo", contenuto: riepilogo },
          { id: "concorrenti", titolo: "Concorrenti", contenuto: concorrenti },
          { id: "domande", titolo: "Domande", contenuto: domande },
          { id: "fonti", titolo: "Fonti", contenuto: fonti },
          { id: "dettagli", titolo: "Dettagli", contenuto: <NoteTecniche report={r} /> },
        ]}
      />
    </article>
  );
}
