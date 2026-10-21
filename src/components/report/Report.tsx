import { engine } from "@/lib/engines";
import type { Report as ReportT, TipoDomanda, Verdetto } from "@/lib/types";
import { Barra, Bottone, Etichetta, Scheda } from "@/components/ui";
import { Andamento } from "./Andamento";
import { ScalaPunteggio } from "./ScalaPunteggio";
import { CopiaLink } from "./CopiaLink";
import { Heatmap } from "./Heatmap";
import { TestaATesta } from "./TestaATesta";
import { Posizioni } from "./Posizioni";
import { Potenziale } from "./Potenziale";
import { CitaChi } from "./CitaChi";

const dataIt = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const oraIt = (iso: string) =>
  new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

const NOME_TIPO: Record<TipoDomanda, { titolo: string; esempio: string }> = {
  generica: { titolo: "Domande generiche", esempio: "«miglior pizzeria a Bergamo»" },
  bisogno: { titolo: "Domande per bisogno", esempio: "«aperta la domenica», «con delivery»" },
  specialita: { titolo: "Domande per specialità", esempio: "«forno a legna», «senza glutine»" },
  nome: { titolo: "Domanda sul tuo nome", esempio: "«com'è la Pizzeria Da Gino?»" },
};

function coloreVerdetto(v: Verdetto) {
  switch (v) {
    case "Invisibile":
      return "text-danger";
    case "Poco visibile":
      return "text-warn";
    default:
      return "text-accent";
  }
}

function spiegazioneVerdetto(v: Verdetto) {
  switch (v) {
    case "Invisibile":
      return "Quando un cliente chiede all'AI, tu non ci sei.";
    case "Poco visibile":
      return "Compari ogni tanto, quasi mai per primo.";
    case "Visibile":
      return "Ti consigliano spesso. Si può salire ancora.";
    case "Dominante":
      return "Sei tra i nomi che l'AI fa quasi sempre.";
  }
}

function Blocco({
  titolo,
  sotto,
  children,
  id,
}: {
  titolo: string;
  sotto?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-7 sm:py-9">
      <h2 className="text-xl font-semibold sm:text-2xl">{titolo}</h2>
      {sotto && <p className="mt-1 max-w-prose text-[15px] text-muted">{sotto}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Nel test gratuito, al posto di "In breve" e delle parole: cosa arriva con il Base. */
function NelBase({ compatto = false }: { compatto?: boolean }) {
  const voci = [
    "«In breve»: la sintesi scritta dai dati, da leggere in trenta secondi",
    "Le parole che gli assistenti usano quando consigliano, e quali ti mancano",
    "15 domande invece di 8, 3 ripetizioni invece di 2",
    "Scansione ogni mese, andamento del punteggio, PDF da inviare",
  ];
  return (
    <div className={`rounded-2xl border border-accent bg-accent-soft/40 ${compatto ? "p-4" : "p-5 sm:p-6"}`}>
      <p className="text-xs font-semibold text-accent-ink">Nel piano Base trovi anche</p>
      <ul className={`mt-2 space-y-1.5 ${compatto ? "text-sm" : "text-[15px]"}`}>
        {(compatto ? voci.slice(1, 2) : voci).map((v) => (
          <li key={v} className="flex gap-2">
            <span className="text-accent" aria-hidden="true">
              ✓
            </span>
            {v}
          </li>
        ))}
      </ul>
      <a href="#abbonamento" className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-2">
        Attiva il piano Base, 29 € al mese
      </a>
    </div>
  );
}

export function Report({ report, abbonato = false }: { report: ReportT; abbonato?: boolean }) {
  const r = report;
  const gratuito = r.piano === "gratuito";
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  const potenziale = guadagno > 0 ? Math.min(100, r.punteggio + guadagno) : null;
  const totaleRisposte = r.domande * r.motori.length * r.ripetizioni;
  const tue = r.concorrenti.find((c) => c.seiTu);
  const col = coloreVerdetto(r.verdetto);

  return (
    <article className="divide-y divide-line">
      {/* Intestazione */}
      <header className="pb-7 sm:pb-9">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Report di visibilità AI, {dataIt(r.data)}</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {r.attivita.nome}, {r.attivita.citta}
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              {r.attivita.categoriaGoogle} · {r.attivita.indirizzo}
            </p>
          </div>
          <div className="no-print flex gap-2">
            {!gratuito && (
              <Bottone href={`/report/${r.id}/pdf`} secondario className="!w-auto !px-4 !py-2 !text-sm" target="_blank">
                Scarica il PDF
              </Bottone>
            )}
            <CopiaLink />
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {[
            [String(r.domande), "domande"],
            [String(r.motori.length), "assistenti AI"],
            [`${r.ripetizioni}×`, "ogni domanda"],
            [String(totaleRisposte), "risposte lette"],
          ].map(([n, t]) => (
            <div key={t} className="border-l-2 border-line pl-3">
              <dt className="tabular text-2xl font-bold">{n}</dt>
              <dd className="text-sm text-muted">{t}</dd>
            </div>
          ))}
        </dl>
        <nav className="no-print mt-6 -mb-1 flex gap-2 overflow-x-auto text-sm" aria-label="Sezioni del report">
          {[
            ["#punteggio", "Punteggio"],
            ["#assistenti", "Assistenti"],
            ["#concorrenti", "Concorrenti"],
            ["#mappa", "Mappa"],
            ["#fonti", "Fonti"],
            ["#dicono", "Cosa dicono"],
            ["#azioni", "Azioni"],
            ["#metodo", "Metodo"],
          ].map(([href, testo]) => (
            <a key={href} href={href} className="shrink-0 rounded-full border border-line px-3 py-1 text-muted hover:border-ink hover:text-ink">
              {testo}
            </a>
          ))}
        </nav>
      </header>

      {/* In breve + punteggio */}
      <section id="punteggio" className="scroll-mt-20 py-7 sm:py-9">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <div className="flex items-end gap-4">
              <span className={`punteggio ${col}`}>{r.punteggio}</span>
              <span className="pb-1.5">
                <span className={`block text-2xl font-semibold ${col}`}>{r.verdetto}</span>
                <span className="text-sm text-muted">{spiegazioneVerdetto(r.verdetto)}</span>
              </span>
            </div>
            <ScalaPunteggio
              punteggio={r.punteggio}
              riferimento={r.contesto ? { valore: r.contesto.mediana, etichetta: `mediana ${r.contesto.categoria} a ${r.contesto.citta}` } : undefined}
            />
            {r.contesto && (
              <p className="mt-3 text-sm">
                <span className="tabular">
                  Su {r.contesto.attivitaAnalizzate} {r.contesto.categoria} analizzate a {r.contesto.citta}, la mediana è {r.contesto.mediana}: il tuo
                  punteggio è più alto del {r.contesto.percentile}% di loro.
                </span>
              </p>
            )}
            <p className="mt-2 text-sm text-muted">
              Su 100: quante volte compari nelle {totaleRisposte} risposte, pesato per la posizione (1º posto vale 1, 5º vale 0,4)
              e per quanti italiani usano ogni assistente.
            </p>
            <Posizioni righe={r.righe} />
            {abbonato && r.andamento && <Andamento punti={r.andamento} />}
          </div>
          {gratuito ? (
            <div className="self-center">
              <NelBase />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">In breve</h2>
              <p className="mt-3 border-l-[3px] border-accent pl-4 text-[17px] leading-relaxed">{r.sintesi}</p>
              {potenziale !== null && (
                <p className="mt-4 text-sm text-muted">
                  Con le tre azioni in fondo al report il punteggio stimato è <span className="tabular font-semibold text-ink">{potenziale}</span>.{" "}
                  <a href="#azioni" className="font-semibold text-accent underline underline-offset-2">
                    Vai alle azioni
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Per motore + per tipo */}
      <section id="assistenti" className="scroll-mt-20 py-7 sm:py-9">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Per assistente</h2>
            <p className="mt-1 text-[15px] text-muted">
              Domande in cui compari almeno una volta, su {r.domande}. In ordine di quanti italiani lo usano.
            </p>
            <div className="mt-4">
              {r.perMotore.map((m) => (
                <Barra
                  key={m.motore}
                  etichetta={engine(m.motore).nome}
                  valore={m.comparse}
                  massimo={m.totale}
                  testo={`${m.comparse} su ${m.totale}`}
                  sotto={`${engine(m.motore).utentiMln.toLocaleString("it-IT")} mln`}
                  accento
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Per tipo di domanda</h2>
            <p className="mt-1 text-[15px] text-muted">
              Dove ti trovano e dove no. Risposte in cui compari, sul totale di quel tipo.
            </p>
            <div className="mt-4">
              {r.perTipo.map((t) => (
                <Barra
                  key={t.tipo}
                  etichetta={NOME_TIPO[t.tipo].titolo}
                  valore={t.comparse}
                  massimo={t.totale}
                  testo={`${t.comparse} su ${t.totale}`}
                  sotto={`${t.domande} ${t.domande === 1 ? "domanda" : "domande"} · ${NOME_TIPO[t.tipo].esempio}`}
                  accento
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Concorrenti */}
      <Blocco
        id="concorrenti"
        titolo="Chi consigliano al posto tuo"
        sotto={`I cinque nomi più citati nelle ${totaleRisposte} risposte, e il confronto diretto domanda per domanda.`}
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            {r.concorrenti.map((c) => (
              <Barra
                key={c.nome}
                etichetta={c.nome}
                valore={c.citazioni}
                massimo={r.concorrenti[0]?.totale ?? 1}
                testo={`${c.citazioni} su ${c.totale}`}
                tu={c.seiTu}
              />
            ))}
          </div>
          <div>
            <h3 className="font-semibold">Testa a testa</h3>
            <p className="mb-3 mt-1 text-sm text-muted">In quante domande, su {r.domande}, compare solo lui, entrambi, o solo tu.</p>
            <TestaATesta righe={r.testaATesta} domande={r.domande} />
          </div>
        </div>
        {r.citaChi.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold">Chi cita chi</h3>
            <p className="mb-3 mt-1 text-sm text-muted">Quale assistente conosce quale attività: dove un concorrente è forte e tu no, è lì che si gioca.</p>
            <CitaChi righe={r.citaChi} motori={r.motori} domande={r.domande} />
          </div>
        )}
      </Blocco>

      {/* Domanda per domanda */}
      <Blocco
        id="mappa"
        titolo="Dove ti trovano, domanda per domanda"
        sotto="Una cella per ogni domanda e assistente: più è scura, più in alto ti mettono. Passa il mouse o tocca una cella per il dettaglio."
      >
        <Heatmap righe={r.righe} motori={r.motori} ripetizioni={r.ripetizioni} />
      </Blocco>

      {/* Parole + fonti */}
      <section id="fonti" className="scroll-mt-20 py-7 sm:py-9">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {gratuito ? (
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">Le parole che usano</h2>
              <p className="mt-1 text-[15px] text-muted">
                I termini più frequenti quando gli assistenti consigliano nella tua categoria, e se compaiono già
                nelle tue recensioni o sul tuo sito.
              </p>
              <div className="mt-4">
                <NelBase compatto />
              </div>
            </div>
          ) : (
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Le parole che usano</h2>
            <p className="mt-1 text-[15px] text-muted">
              I termini più frequenti quando gli assistenti consigliano nella tua categoria, e se compaiono
              già nelle tue recensioni o sul tuo sito.
            </p>
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
            <p className="mt-3 text-xs text-muted">Volte in cui il termine compare nelle {totaleRisposte} risposte, e quante nelle tue recensioni Google. In verde i termini che hai già.</p>
          </div>
          )}
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Da dove prendono le informazioni</h2>
            <p className="mt-1 text-[15px] text-muted">
              Le otto fonti più citate per la tua categoria. Dove non ci sei, i motori non possono trovarti.
            </p>
            <div className="mt-4">
              {r.fonti.map((f) => (
                <Barra
                  key={f.nome}
                  etichetta={f.nome}
                  valore={f.citazioni}
                  massimo={r.fonti[0]?.citazioni ?? 1}
                  testo={`${f.citazioni}`}
                  sotto={f.concorrentiPresenti !== undefined ? `concorrenti presenti: ${f.concorrentiPresenti} su 5` : undefined}
                  accento={f.ciSei}
                  stato={f.ciSei ? { testo: "ci sei", tono: "accento" } : { testo: "non ci sei", tono: "errore" }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Volte in cui la fonte è citata nelle {totaleRisposte} risposte, e quanti dei 5 concorrenti più citati ci sono. In verde dove hai una scheda.</p>
          </div>
        </div>
      </section>

      {/* Cosa dicono di te */}
      <Blocco
        id="dicono"
        titolo="Cosa dicono di te"
        sotto="La descrizione che ogni assistente dà della tua attività quando gli chiedi di te, e gli errori nei dati."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {r.descrizioniPerMotore.map((d) => (
            <li key={d.motore} className="rounded-xl bg-soft p-4">
              <p className="text-xs font-semibold text-muted">{engine(d.motore).nome}</p>
              <p className="mt-1 text-[15px]">«{d.testo}»</p>
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
          <p className="mt-5 text-sm text-muted">Nessun errore trovato nei dati che l&apos;AI riporta su di te.</p>
        )}
      </Blocco>

      {/* Tre azioni */}
      <Blocco id="azioni" titolo="Tre azioni, in ordine di impatto" sotto="Ognuna nasce da un dato di questo report. Fatte queste, il mese prossimo si misura la differenza.">
        {potenziale !== null && (
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
                      {a.impattoStimato !== undefined && <Etichetta tono="neutro">+{a.impattoStimato} punti stimati</Etichetta>}
                    </p>
                  </div>
                </div>
              </Scheda>
            </li>
          ))}
        </ol>
      </Blocco>

      {/* Metodo */}
      <Blocco id="metodo" titolo="Come è stato fatto">
        <dl className="grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Scansione</dt>
            <dd>
              {dataIt(r.metodo.inizio)}, dalle {oraIt(r.metodo.inizio)} alle {oraIt(r.metodo.fine)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Posizione e lingua</dt>
            <dd>
              {r.metodo.posizione}, {r.metodo.lingua}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Assistenti e peso nel punteggio</dt>
            <dd className="tabular">
              {r.motori
                .map((m) => `${engine(m).nome} ${Math.round(engine(m).peso * 100)}%`)
                .join(", ")}
              , rinormalizzati sugli assistenti interrogati.
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Campione</dt>
            <dd className="tabular">
              {r.domande} domande × {r.motori.length} assistenti × {r.ripetizioni} ripetizioni = {totaleRisposte} risposte.
              {tue ? ` Compari in ${tue.citazioni}.` : ""}
            </dd>
          </div>
        </dl>
        <ul className="mt-4 space-y-1 text-sm text-muted">
          {r.metodo.note.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Blocco>
    </article>
  );
}
