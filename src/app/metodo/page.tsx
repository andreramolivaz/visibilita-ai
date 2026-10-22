import type { Metadata } from "next";
import Link from "next/link";
import { Pagina, Titolo } from "@/components/ui";
import { Simbolo } from "@/components/Marchio";
import { Pipeline } from "@/components/metodo/Pipeline";
import { StrisciaMotori } from "@/components/landing/StrisciaMotori";
import { Categorie } from "@/components/landing/Categorie";
import { ENGINES, motoriAttivi, motoriInArrivo, elencoMotori } from "@/lib/engines";
import { GLOSSARIO } from "@/lib/glossario";
import { PROFILI } from "@/lib/profiles";
import { RIFERIMENTI } from "@/lib/riferimenti";

export const metadata: Metadata = {
  title: "Metodo: come raccogliamo i dati",
  description: "Come interroghiamo gli assistenti AI, come riconosciamo la tua attività nelle risposte, come calcoliamo il punteggio e cosa sappiamo e non sappiamo.",
};

const MODELLI = [
  {
    nome: "Riconoscimento dell'attività e dei concorrenti",
    oggi: "Confronto di nome, indirizzo e telefono con la scheda Google (con alias per varianti come «Da Gino» e «Trattoria da Gino»), più un modello linguistico che risolve i casi ambigui.",
    poi: "Un classificatore addestrato sulle coppie risolte a mano: la precisione viene misurata su un campione ogni mese e pubblicata nel report (Allegato A).",
  },
  {
    nome: "Estrazione dei termini",
    oggi: "Parole e coppie di parole più frequenti nelle risposte della tua categoria, al netto delle parole comuni, confrontate con le tue recensioni e il tuo sito.",
    poi: "Raggruppamento dei sinonimi («forno a legna», «cottura a legna») e peso per assistente.",
  },
  {
    nome: "Stima dei punti per azione",
    oggi: "Regole: quante domande e quante risposte toccano la fonte o il dato su cui agisce l'azione, moltiplicato per il peso degli assistenti che la citano.",
    poi: "Regressione sulle scansioni successive: quali azioni, in quali categorie, hanno spostato il punteggio e di quanto. La stima migliora con i clienti che la verificano.",
  },
  {
    nome: "Tono delle descrizioni",
    oggi: "Un modello linguistico classifica la descrizione di ogni assistente in positiva, neutra o critica. Lo segnaliamo solo quando è critica: negli studi di settore il tono è positivo per quasi tutte le attività, e un punteggio di sentiment non direbbe cosa fare.",
    poi: "Confronto del tono con le recensioni recenti, per capire da dove viene una descrizione critica.",
  },
  {
    nome: "Previsione del punteggio",
    oggi: "Non la facciamo. Le liste degli assistenti cambiano da una risposta all'altra e i modelli cambiano senza preavviso: una previsione non avrebbe una base statistica. Mostriamo l'andamento delle scansioni e gli intervalli.",
    poi: "Resta così, finché non esiste un modo di prevedere che possiamo verificare sui nostri dati.",
  },
  {
    nome: "Avviso concorrenti nuovi",
    oggi: "Un nome che entra tra i cinque più citati e non c'era il mese prima.",
    poi: "Soglia statistica sulla variazione, per non segnalare oscillazioni casuali.",
  },
];

const LIMITI = [
  "Le risposte degli assistenti cambiano nel tempo e tra una ripetizione e l'altra: la stessa lista ricompare meno di una volta su cento, nello stesso ordine circa una su mille (SparkToro, 2026). Per questo ogni domanda viene posta più volte, in giorni diversi nell'abbonamento, e ogni numero ha il suo campione e, dove serve, il suo intervallo.",
  "Le interfacce ufficiali (API) possono differire dalle app che usano i clienti: su domande aperte lo scarto può essere grande (Brandlight, 2026), su domande chiuse le classifiche coincidono nell'87% dei casi (Massive, 2026). Dichiariamo il canale in ogni report e ogni trimestre confrontiamo 50 domande con le app vere, pubblicando lo scarto.",
  "Con 384 risposte spontanee una quota del 25% ha un intervallo di Wilson di ±4 punti, ma quello tra domande, l'unico che vale per domande di quel tipo, è ±10–12; la singola cella «2 su 3» è un'indicazione, non una misura. Tra due report una variazione sotto gli 8–13 punti non è rilevabile.",
  "Copilot e Meta AI non hanno un'interfaccia ufficiale di ricerca: non sono nel punteggio finché non potremo leggerli in modo affidabile.",
  "Il punteggio misura i consigli degli assistenti AI, non Google tradizionale, non le recensioni, non il fatturato.",
  "Usiamo solo dati pubblici dell'attività e, per l'abbonamento, l'email del titolare.",
];

export default function Metodo() {
  const attivi = motoriAttivi();
  return (
    <Pagina larga>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-accent">Metodo</p>
        <Titolo>Come raccogliamo i dati, e cosa non sappiamo</Titolo>
        <p className="mt-4 text-lg text-muted">
          Ogni numero del report si può rifare a mano dalla mappa domanda × assistente. Qui c&apos;è tutto il percorso: cosa chiediamo, a chi,
          come riconosciamo la tua attività nelle risposte, come calcoliamo il punteggio e dove il metodo ha dei limiti.
        </p>
      </div>

      <a
        href="/white-paper-visibilita-ai.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 flex max-w-2xl items-center gap-4 rounded-2xl border border-line bg-soft/60 p-4 transition-colors hover:border-ink sm:p-5"
      >
        <Simbolo size={44} className="shrink-0" />
        <span className="min-w-0">
          <span className="block font-semibold">Il white paper: metodo, prodotto e strategia</span>
          <span className="block text-[15px] text-muted">Cinque pagine in PDF: perché gli intenti e non le frasi, perché ogni numero ha un intervallo, cosa c&apos;è nel report e dove vogliamo arrivare.</span>
        </span>
        <span className="ml-auto shrink-0 text-sm font-semibold text-accent">Scarica</span>
      </a>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Il percorso dei dati</h2>
        <div className="mt-6">
          <Pipeline />
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line p-5 sm:p-7">
        <h2 className="text-2xl font-bold">Sei assistenti, pesati per quanti italiani li usano</h2>
        <div className="mt-6">
          <StrisciaMotori />
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold">1. Il profilo e le domande</h2>
          <div className="mt-4 space-y-3 text-[16px]">
            <p>
              Scrivi il nome e la città (o il link di Google Maps). Dalla scheda Google prendiamo nome, indirizzo, telefono, categoria, orari,
              rating, recensioni e attributi (asporto, dehors, prenotazione, parcheggio…); dal sito leggiamo la pagina iniziale e le pagine chiave
              (menu, servizi, lavorazioni); dai suggerimenti di ricerca Google per la tua categoria e città prendiamo i vincoli che la gente
              aggiunge («senza glutine», «aperta ora»); dalle attività vicine della stessa categoria, il concorrente del confronto diretto. Tu
              confermi con un tocco, e vedi da dove viene ogni domanda.
            </p>
            <p>
              Le domande sono quelle che un cliente fa davvero, e sono corte: con la ricerca attiva un prompt a ChatGPT ha in media 4 parole
              (Semrush, 80 milioni di righe di clickstream), in Google AI Mode 7, e tre sessioni su quattro di chi cerca un professionista
              contengono una domanda in stile parola chiave, come «dentista Bergamo» (Search Engine Land, 2026). I modelli sono scritti per{" "}
              {PROFILI.filter((p) => p.imprese > 0).length} categorie, in ordine di numerosità, e riempiti con città, zona o provincia, con le
              specialità che emergono dalle tue recensioni e dal tuo sito e con i requisiti della scheda e delle ricerche; per chi esporta o
              riceve stranieri ci sono anche domande in inglese. Il set non si vede prima della scansione e non si cambia: è il metodo, e resta
              uguale da una scansione all&apos;altra perché il confronto nel tempo regga.
            </p>
            <p>
              <strong>Il telescopio.</strong> Il set è una struttura, non una lista. Dodici famiglie: generiche («miglior pizzeria a Bergamo»),
              per bisogno («per una cena romantica»), per specialità («con forno a legna»), per requisito, orari e urgenza («con dehors», «aperta
              adesso», «certificata EN 1090»), per prezzo («buon rapporto qualità prezzo»: in Italia il compito più frequente di chi decide con
              l&apos;AI, IAB 2026), per occasione («con bambini piccoli», «pranzo di lavoro», «per un prototipo»), per recensioni («con più di 4
              stelle», «affidabile»), vicino a te («vicino a me», con la posizione impostata), informative («come scegliere…», contate a parte
              perché spesso non fanno nomi), di confronto («meglio X o Y?», una per concorrente), sul nome, in inglese. Lo stesso intento è
              chiesto a più livelli di zoom (città, zona, vicino a te; provincia, regione e Italia per le aziende).
            </p>
            <p>
              <strong>Intenti, non parafrasi.</strong> Contiamo intenti distinti: 36 nel report singolo, 48 nel Base, 72 nel Pro. Ogni intento
              spontaneo è chiesto in due forme, breve («pizzeria aperta la domenica a Bergamo») e con la richiesta esplicita di più opzioni
              («…: consigliami 5 opzioni»), e le due forme sono le sue ripetizioni, non due domande: il registro colloquiale non cambia i nomi
              nelle risposte, la richiesta di una lista sì (Peec 2026, 37.804 risposte; Dice Roll Method 2026). Nei confronti la seconda forma
              inverte l&apos;ordine dei nomi, perché gli assistenti preferiscono il primo che leggono. La griglia intorno a te (indirizzo più
              quattro punti a 1,2 km) entra nel Base e nel Pro, solo sugli assistenti che accettano le coordinate in italiano.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">2. Gli assistenti</h2>
          <div className="mt-4 space-y-3 text-[16px]">
            <p>
              Interroghiamo {attivi.length} assistenti attraverso le loro interfacce ufficiali, con la posizione impostata sulla tua città e la lingua
              italiana: {elencoMotori(attivi)}. In arrivo: {elencoMotori(motoriInArrivo())}.
            </p>
            <p>
              Ogni intento viene posto 2 volte nel report singolo, nella stessa giornata (forma breve e a lista), e 3 nel piano Base, in tre
              giorni diversi della stessa settimana, perché le risposte cambiano più tra un giorno e l&apos;altro che tra un minuto e
              l&apos;altro. La varianza sta tra le domande, non tra le ripetizioni: oltre due o tre ripetizioni il guadagno è minimo e conviene
              spendere in intenti e assistenti (variance components 2026; Dice Roll Method 2026). Gli assistenti con ricerca web convergono in
              pochi passaggi (finite-sample audit 2026). Nelle domande vicino a te la posizione è impostata con le coordinate su Google AI e
              Perplexity; Gemini le accetta solo con il grounding Maps, documentato per il solo inglese; ChatGPT e Claude accettano la città,
              Grok nessuna posizione: per loro «vicino a me» è la città, e il report lo dice. Per ogni risposta salviamo assistente, modello
              restituito, canale, località impostata, data e ora, forma della domanda, testo della risposta, ordine dei nomi citati, fonti
              consultate e, dove l&apos;interfaccia le espone, le ricerche fatte per rispondere: senza questi campi un dato non è ricostruibile.
            </p>
          </div>
          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2 pr-3 font-medium">Assistente</th>
                <th className="tabular pb-2 pr-3 text-right font-medium">Utenti in Italia</th>
                <th className="tabular pb-2 pr-3 text-right font-medium">Peso</th>
                <th className="pb-2 pl-3 font-medium">Come</th>
              </tr>
            </thead>
            <tbody>
              {ENGINES.map((e) => (
                <tr key={e.id} className={`border-t border-line ${e.fase === "mvp" ? "" : "text-muted"}`}>
                  <td className="py-2 pr-3">{e.nome}</td>
                  <td className="tabular whitespace-nowrap py-2 pr-3 text-right">{e.utentiMln.toLocaleString("it-IT")} mln</td>
                  <td className="tabular py-2 pr-3 text-right">{Math.round(e.peso * 100)}%</td>
                  <td className="py-2 pl-3 text-xs text-muted">{e.fase === "mvp" ? e.come : `In arrivo: ${e.come.toLowerCase()}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">
            Utenti mensili, luglio 2026: Osservatorio Cosenza su dati Audicom; per Google AI, Sensemakers su dati Comscore. I pesi si aggiornano ogni
            trimestre.
          </p>
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold">3. Il riconoscimento</h2>
          <div className="mt-4 space-y-3 text-[16px]">
            <p>
              Compari in una risposta quando nome, indirizzo o telefono coincidono con la tua scheda Google. Le varianti del nome («Da Gino»,
              «Trattoria da Gino», «Gino&apos;s») sono alias che puoi correggere. I concorrenti sono le altre attività della tua categoria citate nelle
              risposte, aggregate per nome e indirizzo.
            </p>
            <p>
              La posizione è l&apos;ordine in cui i nomi compaiono nella risposta: il primo nome citato è 1º. Oltre il 5º non contiamo, perché i clienti
              non leggono oltre.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">4. Il punteggio e le statistiche</h2>
          <div className="mt-4 space-y-3 text-[16px]">
            <p>
              Il punteggio usa solo le domande spontanee, quelle in cui il cliente non fa il nome dell&apos;attività: misura se gli assistenti ti
              consigliano da soli (ricordo spontaneo, non sollecitato). Le domande sul nome e di confronto, in cui compari quasi per forza, sono
              riportate a parte. Per ogni risposta la posizione vale un peso: 1º = 1,00, 2º = 0,85, 3º = 0,70, 4º = 0,55, 5º = 0,40, assente = 0. Il
              punteggio di un assistente è la media dei pesi sulle sue risposte; il punteggio totale è la media dei punteggi per assistente pesata
              per quanti italiani lo usano, portata su 100.
            </p>
            <p>
              Accanto al punteggio diamo sempre il campione e due intervalli al 95%: quello di Wilson sulle risposte, che vale per «queste
              domande, questi assistenti, questi giorni», e quello «tra domande», da un bootstrap che ricampiona le domande intere, che vale per
              domande di quel tipo ed è più largo, perché le risposte alla stessa domanda sono correlate. Le famiglie con poche domande e i punti
              della griglia hanno anche una stima ridotta, tirata verso la media del report in proporzione a quante poche risposte hanno, con il
              peso dichiarato. La quota di voce è la tua parte di tutte le citazioni di attività nelle risposte, come la definiscono Peec,
              Profound, Semrush e BrightLocal. Al posto della posizione media usiamo «nei primi tre», perché l&apos;ordine esatto oscilla e i
              primi tre nomi sono quelli che un cliente legge. La stabilità misura quante celle della mappa concordano su tutte le ripetizioni;
              la sensibilità alla forma dice se la richiesta di una lista cambia il risultato. La mediana della categoria viene dalle attività
              della stessa categoria e città analizzate negli ultimi 90 giorni.
            </p>
            <p className="text-sm text-muted">
              Tutte le definizioni, una per una, sono nella{" "}
              <Link href="/report/esempio#guida" className="font-semibold text-accent underline underline-offset-2">
                guida alla lettura
              </Link>{" "}
              in fondo a ogni report ({GLOSSARIO.length} voci).
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">5. I modelli: cosa è una regola e cosa impara dai dati</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Preferiamo regole semplici e dichiarate dove bastano, e modelli appresi solo dove abbiamo abbastanza dati per misurarne la precisione.
          Per ogni pezzo, com&apos;è oggi e come cambia con i clienti.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-[15px]">
            <thead className="bg-soft text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Pezzo</th>
                <th className="px-4 py-2.5 font-medium">Oggi</th>
                <th className="px-4 py-2.5 font-medium">Con più dati</th>
              </tr>
            </thead>
            <tbody>
              {MODELLI.map((m) => (
                <tr key={m.nome} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-medium">{m.nome}</td>
                  <td className="px-4 py-3 text-muted">{m.oggi}</td>
                  <td className="px-4 py-3 text-muted">{m.poi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold">6. Quanto è normale non comparire</h2>
          <p className="mt-3 text-muted">
            Un risultato basso è la norma, non un difetto della misura. I riferimenti con cui ogni report confronta il tuo numero:
          </p>
          <ul className="mt-4 space-y-3 text-[16px]">
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
        <div>
          <h2 className="text-2xl font-bold">7. Quanto sono larghi gli intervalli</h2>
          <p className="mt-3 text-muted">
            La quota di risposte in cui compari è una proporzione, e le risposte alla stessa domanda si somigliano: l&apos;intervallo onesto è
            quello «tra domande», più largo di quello sulle risposte. Per questo i numeri chiave sono sull&apos;intero report, una famiglia si
            legge con la sua stima ridotta e un punto della griglia solo nell&apos;insieme.
          </p>
          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2 pr-3 font-medium">Con una quota osservata del 25%</th>
                <th className="tabular pb-2 pr-3 text-right font-medium">Risposte</th>
                <th className="tabular pb-2 pr-3 text-right font-medium">Wilson</th>
                <th className="tabular pb-2 text-right font-medium">Tra domande</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Un punto della griglia (2 assistenti × 3)", "6", "±29", "non si legge da solo"],
                ["Una famiglia da 4 intenti (× 6 × 2)", "48", "±12", "±25–35"],
                ["Report singolo, domande spontanee (32 × 6 × 2)", "384", "±4", "±10–12"],
                ["Piano Base, domande spontanee (40 × 6 × 3)", "720", "±3", "±8–10"],
              ].map(([n, a, b, c]) => (
                <tr key={n} className="border-t border-line">
                  <td className="py-2 pr-3">{n}</td>
                  <td className="tabular py-2 pr-3 text-right">{a}</td>
                  <td className="tabular py-2 pr-3 text-right">{b}</td>
                  <td className="tabular py-2 text-right">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">
            Punti percentuali, intervalli al 95%. Tra due report, con le stesse domande, una variazione sotto gli 8–13 punti non è rilevabile:
            guardare se due intervalli si sovrappongono non basta; una tendenza si dichiara solo dopo quattro scansioni.
          </p>
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold">8. La validazione</h2>
          <ul className="mt-4 space-y-3 text-[16px]">
            <li>
              <span className="font-semibold">Ogni scansione.</span> Ripetizioni, campione e intervallo dichiarati nel report; data, ora e posizione
              nell&apos;intestazione.
            </li>
            <li>
              <span className="font-semibold">Ogni mese.</span> Un campione di riconoscimenti controllato a mano; la precisione va nell&apos;Allegato A.
            </li>
            <li>
              <span className="font-semibold">Ogni trimestre.</span> 50 domande confrontate tra interfacce ufficiali e app vere; pesi degli assistenti
              aggiornati con i dati Audicom e Comscore; stessa batteria rieseguita su un pannello fisso di attività per misurare la deriva dei
              modelli; versioni dei modelli e novità delle piattaforme annotate nel report, perché un salto nei dati si spiega prima con quelle
              che con le azioni del cliente.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold">9. I limiti</h2>
          <ul className="mt-4 space-y-3 text-[16px]">
            {LIMITI.map((l) => (
              <li key={l} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="per-chi" className="mt-16 scroll-mt-20 border-t border-line pt-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Per quali attività</h2>
          <div>
            <p className="text-lg text-muted">
              {PROFILI.filter((p) => p.imprese > 0).length} categorie con domande, fonti e azioni proprie, dalla più numerosa alla più piccola: un ristorante si gioca su piatti e orari, un dentista
              sulle prestazioni, una carpenteria su lavorazioni, certificazioni, provincia e domande in inglese. Per i mestieri non previsti il profilo lo costruiamo dal
              sito e dalla scheda Google.
            </p>
            <p className="mt-3 text-[13px] text-faint">Imprese attive per categoria: ISTAT, registro ASIA 2023 (via Eurostat).</p>
          </div>
        </div>
        <div className="mt-10">
          <Categorie />
        </div>
      </section>
    </Pagina>
  );
}
