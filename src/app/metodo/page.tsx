import type { Metadata } from "next";
import Link from "next/link";
import { Pagina, Titolo } from "@/components/ui";
import { Pipeline } from "@/components/metodo/Pipeline";
import { ENGINES, motoriAttivi, motoriInArrivo, elencoMotori } from "@/lib/engines";
import { GLOSSARIO } from "@/lib/glossario";

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
    nome: "Proiezione del punteggio",
    oggi: "Retta dei minimi quadrati sugli ultimi mesi, prolungata di tre, in tratteggio e con la pendenza dichiarata.",
    poi: "Modello con stagionalità e con l'effetto delle azioni fatte, quando ci sono abbastanza mesi per stimarlo.",
  },
  {
    nome: "Avviso concorrenti nuovi",
    oggi: "Un nome che entra tra i cinque più citati e non c'era il mese prima.",
    poi: "Soglia statistica sulla variazione, per non segnalare oscillazioni casuali.",
  },
];

const LIMITI = [
  "Le risposte degli assistenti cambiano nel tempo e tra una ripetizione e l'altra: per questo ogni domanda viene posta più volte e ogni numero ha il suo campione e, dove serve, il suo intervallo.",
  "Le interfacce ufficiali (API) possono differire dalle app che usano i clienti. Ogni trimestre confrontiamo 50 domande con le app vere e pubblichiamo lo scarto.",
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

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Il percorso dei dati</h2>
        <div className="mt-6">
          <Pipeline />
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold">1. Il profilo e le domande</h2>
          <div className="mt-4 space-y-3 text-[16px]">
            <p>
              Scrivi il nome e la città (o il link di Google Maps). Da Google Places prendiamo nome, indirizzo, telefono, categoria, orari, rating e
              recensioni; dal sito leggiamo le pagine chiave (menu, servizi, listino); con una ricerca web verifichiamo se hai una scheda sui portali
              della tua categoria. Un modello linguistico unisce tutto in un profilo che tu confermi con un tocco.
            </p>
            <p>
              Le domande sono quelle che un cliente farebbe davvero: le generiamo da modelli scritti per ogni categoria, con la tua città, la tua
              zona e le tue specialità. Quattro tipi: generiche («miglior pizzeria a Bergamo»), per bisogno («aperta la domenica»), per specialità
              («con forno a legna»), sul nome («com&apos;è la Pizzeria Da Gino?»). 8 nel test gratuito, 15 nel Base, 30 nel Pro. Una la scegli tu.
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
              Ogni domanda viene posta 2 volte nel test gratuito e 3 nell&apos;abbonamento, perché le risposte cambiano. Per ogni risposta salviamo il
              testo, l&apos;ordine dei nomi citati e le fonti consultate (URL restituiti dalle interfacce).
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
              Per ogni risposta la posizione vale un peso: 1º = 1,00, 2º = 0,85, 3º = 0,70, 4º = 0,55, 5º = 0,40, assente = 0. Il punteggio di un
              assistente è la media dei pesi sulle sue risposte; il punteggio totale è la media dei punteggi per assistente pesata per quanti italiani
              lo usano, portata su 100.
            </p>
            <p>
              Accanto al punteggio diamo sempre il campione e, per le quote, l&apos;intervallo di confidenza al 95% (Wilson): con 270 risposte, un 19% ha
              un&apos;incertezza di circa ±5 punti. La stabilità misura quante celle della mappa concordano su tutte le ripetizioni. La mediana della
              categoria viene dalle attività della stessa categoria e città analizzate negli ultimi 90 giorni.
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
          <h2 className="text-2xl font-bold">6. La validazione</h2>
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
              aggiornati con i dati Audicom e Comscore.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold">7. I limiti</h2>
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
    </Pagina>
  );
}
