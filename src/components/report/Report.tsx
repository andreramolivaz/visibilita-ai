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
import { letturaAssistenti, letturaAzioni, letturaConcorrenti, letturaDicono, letturaFonti, letturaParole, letturaTerritorio, letturaTipi } from "@/lib/letture";
import { punteggioPerMotore } from "@/lib/stats";

const NOME_TIPO: Record<TipoDomanda, { titolo: string; esempio: string }> = {
  generica: { titolo: "Generiche", esempio: "«miglior pizzeria a Bergamo»" },
  bisogno: { titolo: "Per bisogno", esempio: "«aperta la domenica», «stasera»" },
  specialita: { titolo: "Per specialità", esempio: "«forno a legna», «napoletana»" },
  requisito: { titolo: "Per requisito", esempio: "«con dehors», «con parcheggio»" },
  confronto: { titolo: "Di confronto", esempio: "«meglio X o Y?»" },
  nome: { titolo: "Sul nome", esempio: "«com'è la Pizzeria Da Gino?»" },
};

const TONO: Record<string, { testo: string; tono: "accento" | "neutro" | "errore" }> = {
  positivo: { testo: "tono positivo", tono: "accento" },
  neutro: { testo: "tono neutro", tono: "neutro" },
  critico: { testo: "tono critico", tono: "errore" },
};

/** Una sezione: titolo, la riga di lettura (il fatto con i numeri), il contenuto. */
function Blocco({ titolo, lettura, children, id }: { titolo: string; lettura?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-20 py-7 sm:py-9">
      <h2 className="text-xl font-semibold sm:text-2xl">{titolo}</h2>
      {lettura && <p className="tabular mt-1.5 max-w-prose text-[16px] leading-snug">{lettura}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Nel test gratuito, al posto delle parole: cosa arriva con il Base. */
function NelBase() {
  const voci = [
    "Le parole che gli assistenti usano quando consigliano, e quali ti mancano",
    "15 domande invece di 8, con quelle di confronto e sui requisiti; 3 ripetizioni in 3 giorni",
    "Scansione ogni mese, andamento del punteggio, PDF da inviare",
  ];
  return (
    <div className="rounded-2xl border border-accent bg-accent-soft/40 p-5 sm:p-6">
      <p className="text-xs font-semibold text-accent-ink">Nel piano Base trovi anche</p>
      <ul className="mt-2 space-y-1.5 text-[15px]">
        {voci.map((v) => (
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
  const parziali = punteggioPerMotore(r.righe, r.ripetizioni);
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  const totaleRisposte = r.domande * r.motori.length * r.ripetizioni;
  const mostraAndamento = abbonato && !!r.andamento && r.andamento.length >= 2;

  return (
    <article className="divide-y divide-line">
      {/* Intestazione */}
      <header className="pb-7 sm:pb-9">
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
              {r.domande} domande × {r.motori.length} assistenti × {r.ripetizioni} ripetizioni = {totaleRisposte} risposte. Punteggio e numeri chiave sulle{" "}
              {r.domandeSpontanee} domande in cui il cliente non fa il tuo nome.
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
        <nav className="no-print mt-6 -mb-1 flex gap-2 overflow-x-auto text-sm" aria-label="Sezioni del report">
          {[
            ["#trenta", "In 30 secondi"],
            ["#azioni", "Cosa fare"],
            ["#concorrenti", "Concorrenti"],
            ["#dove", "Dove ti trovano"],
            ["#fonti", "Fonti e parole"],
            ["#dicono", "Cosa dicono"],
            ["#note", "Note tecniche"],
          ].map(([href, testo]) => (
            <a key={href} href={href} className="shrink-0 rounded-full border border-line px-3 py-1 text-muted hover:border-ink hover:text-ink">
              {testo}
            </a>
          ))}
        </nav>
      </header>

      <InTrentaSecondi report={r} abbonato={abbonato} />

      {/* Posizioni e andamento: due figure, nessun testo */}
      <section className="py-7 sm:py-9">
        <div className={`grid gap-8 ${mostraAndamento ? "lg:grid-cols-2 lg:gap-12" : ""}`}>
          <Posizioni righe={r.righe} />
          {mostraAndamento && <Andamento punti={r.andamento!} />}
        </div>
      </section>

      {/* Tre azioni */}
      <Blocco id="azioni" titolo="Cosa fare, in ordine di impatto" lettura={letturaAzioni(r)}>
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
                      {a.impattoStimato !== undefined && <Etichetta tono="neutro">+{a.impattoStimato} punti stimati</Etichetta>}
                    </p>
                  </div>
                </div>
              </Scheda>
            </li>
          ))}
        </ol>
      </Blocco>

      {/* Concorrenti */}
      <Blocco id="concorrenti" titolo="Chi consigliano al posto tuo" lettura={letturaConcorrenti(r)}>
        <Concorrenti report={r} />
      </Blocco>

      {/* Dove ti trovano: territorio, per assistente, per tipo, mappa */}
      <Blocco id="dove" titolo="Dove ti trovano" lettura={letturaTerritorio(r)}>
        <Territorio righe={r.righe} />
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
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
                  sotto={`${engine(m.motore).utentiMln.toLocaleString("it-IT")} mln · punteggio ${parziali[m.motore] ?? 0}`}
                  accento
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Domande spontanee in cui compari almeno una volta, su {r.domandeSpontanee}; utenti mensili in Italia e punteggio parziale 0–100 dell&apos;assistente.</p>
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
                  sotto={`${t.domande} ${t.domande === 1 ? "domanda" : "domande"} · ${NOME_TIPO[t.tipo].esempio}`}
                  accento
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Risposte in cui compari, sul totale delle risposte di quel tipo. Nelle domande di confronto e sul nome compari quasi per forza: non entrano nel punteggio.</p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="font-semibold">Domanda per domanda</h3>
          <p className="mt-1 text-sm text-muted">Una cella per ogni domanda e assistente: la posizione in cui ti mettono e quante volte su {r.ripetizioni}. Più scura, più in alto.</p>
          <div className="mt-3">
            <Heatmap righe={r.righe} motori={r.motori} ripetizioni={r.ripetizioni} />
          </div>
        </div>
      </Blocco>

      {/* Fonti + parole */}
      <section id="fonti" className="scroll-mt-20 py-7 sm:py-9">
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
            <p className="mt-2 text-xs text-muted">Risposte, su {totaleRisposte}, che citano la fonte; quanti dei 5 concorrenti più citati hanno una scheda lì. Dove non ci sei, gli assistenti non possono trovarti.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Le parole che usano</h2>
            {gratuito ? (
              <div className="mt-4">
                <NelBase />
              </div>
            ) : (
              <>
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
                <p className="mt-2 text-xs text-muted">Volte in cui il termine compare nelle {totaleRisposte} risposte della tua categoria, e quante nelle tue recensioni Google.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cosa dicono di te */}
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

      <NoteTecniche report={r} />
    </article>
  );
}
