import Link from "next/link";
import { CercaAttivita } from "@/components/CercaAttivita";
import { ChatSimulata } from "@/components/landing/ChatSimulata";
import { AnteprimaReport } from "@/components/landing/AnteprimaReport";
import { Barra, Bottone } from "@/components/ui";
import { elencoMotori, motoriAttivi, motoriInArrivo } from "@/lib/engines";
import { Pipeline } from "@/components/metodo/Pipeline";
import { GLOSSARIO } from "@/lib/glossario";
import { PIANI, SISTEMAZIONE, euro } from "@/lib/prezzi";

const PASSI = [
  {
    titolo: "Scrivi il nome della tua attività",
    testo: "Troviamo noi categoria, specialità, orari e portali da Google e dal tuo sito. Tu confermi con un tocco.",
  },
  {
    titolo: "Interroghiamo i motori come farebbe un cliente",
    testo: "Otto domande vere, nella tua città, su sei assistenti AI. Ogni domanda due volte, perché le risposte cambiano.",
  },
  {
    titolo: "Ricevi punteggio, concorrenti e tre azioni",
    testo: "In 60 secondi: quanto sei visibile, chi citano al posto tuo, da dove prendono le informazioni e cosa sistemare per primo.",
  },
];

const CATEGORIE = [
  "Negozi al dettaglio",
  "Ristoranti, pizzerie e bar",
  "Imprese edili e artigiani",
  "Carpenterie e metalmeccanica",
  "Avvocati e commercialisti",
  "Dentisti e studi medici",
  "Hotel, B&B e agriturismi",
  "Autofficine e gommisti",
  "Idraulici ed elettricisti",
  "Parrucchieri ed estetiste",
  "Agenzie immobiliari",
  "Logistica e trasporti",
  "Agenzie di comunicazione",
  "Scuole di lingue e formazione",
  "Palestre e centri sportivi",
  "Fisioterapisti e nutrizionisti",
  "Farmacie e ottici",
  "Veterinari e toelettature",
  "Musei e attrazioni",
  "Aziende agricole e cantine",
];

const FAQ = [
  {
    d: "Le risposte dell'AI cambiano: come fate a misurarle?",
    r: "Facciamo ogni domanda più volte e ti diciamo quante volte compari su quante risposte, con data e ora. Un numero come «2 su 3» è onesto; un sì o un no non lo sarebbe. Ogni trimestre confrontiamo anche le risposte delle API con quelle dell'app vera.",
  },
  {
    d: "Da dove prendete le domande?",
    r: "Da quello che un cliente chiede davvero: le generiamo dalla tua categoria, dalla tua città e dalle tue specialità, con modelli scritti per ogni mestiere. Una la scegli tu.",
  },
  {
    d: "Serve registrarsi per il test?",
    r: "No. Scrivi il nome, confermi il profilo e vedi il report. L'email serve solo se vuoi riceverlo ogni mese o ritrovare il link.",
  },
  {
    d: "Cosa succede se risulto invisibile?",
    r: "È la situazione più comune: oggi gli assistenti citano una piccola parte delle attività locali. Il report ti dice chi citano al posto tuo, da quali fonti prendono le informazioni e le tre cose da fare, in ordine di impatto. Se preferisci, le facciamo noi.",
  },
  {
    d: "Come faccio a fidarmi dei numeri?",
    r: "Ogni numero ha il suo campione («51 su 270») e, dove è una quota, l'intervallo di confidenza. Le domande sono ripetute, la posizione è dichiarata, i pesi degli assistenti vengono da dati pubblici e si aggiornano ogni trimestre. In fondo a ogni report c'è la guida alla lettura, e nella pagina Metodo tutto il percorso dei dati.",
  },
  {
    d: "Posso disdire quando voglio?",
    r: "Sì, dall'area personale, in un clic. L'abbonamento mensile si ferma a fine mese, quello annuale a fine anno.",
  },
  {
    d: "Quali assistenti interrogate?",
    r: "ChatGPT, Gemini, Google AI (le risposte AI dentro Google), Claude, Perplexity e Grok, tutti attraverso le loro interfacce ufficiali. Nel punteggio ogni assistente pesa per quanti italiani lo usano: essere invisibile su ChatGPT costa più punti che su Grok. Copilot e Meta AI arrivano appena sarà possibile leggerli in modo affidabile. Non siamo affiliati a nessuno di loro.",
  },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-xl">
            <h1 className="display">Quando un cliente chiede a ChatGPT, fa il tuo nome?</h1>
            <p className="mt-5 text-lg text-muted sm:text-xl">
              In 60 secondi sai se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok consigliano
              la tua attività o i tuoi concorrenti, e le tre cose da sistemare.
            </p>
            <div className="mt-7">
              <CercaAttivita grande id="test" />
            </div>
            <p className="mt-3 text-sm text-muted">
              Gratis, senza registrazione. Per ristoranti e dentisti come per carpenterie e logistica: le domande cambiano con il mestiere.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <ChatSimulata />
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section id="come-funziona" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold sm:text-3xl">Come funziona</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {PASSI.map((p, i) => (
              <li key={p.titolo} className="flex gap-4 sm:block">
                <span className="tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink text-sm font-bold sm:mb-4">
                  {i + 1}
                </span>
                <span>
                  <h3 className="font-semibold">{p.titolo}</h3>
                  <p className="mt-1.5 text-[15px] text-muted">{p.testo}</p>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Motori */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Sei assistenti, pesati per quanti italiani li usano</h2>
              <p className="mt-3 text-muted">
                Non tutti contano uguale. Nel punteggio ogni assistente pesa per la sua quota d&apos;uso
                in Italia: essere invisibile su ChatGPT costa più punti che su Grok. Le quote si
                aggiornano ogni trimestre.
              </p>
              <p className="mt-3 text-sm text-muted">
                In arrivo: {elencoMotori(motoriInArrivo())}, appena sarà possibile leggerli in modo affidabile.
              </p>
            </div>
            <div>
              {motoriAttivi().map((m) => (
                <Barra
                  key={m.id}
                  etichetta={m.nome}
                  valore={m.utentiMln}
                  massimo={Math.max(...motoriAttivi().map((x) => x.utentiMln))}
                  testo={`${m.utentiMln.toLocaleString("it-IT")} mln di italiani`}
                  accento
                />
              ))}
              <p className="mt-3 text-xs text-faint">
                Utenti mensili in Italia, luglio 2026. Fonte: Osservatorio Cosenza su dati Audicom; per
                Google AI, Sensemakers su dati Comscore (persone esposte alle risposte AI su Google).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cosa ricevi */}
      <section className="border-t border-line bg-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Un punteggio, un confronto, tre azioni</h2>
            <p className="mt-3 text-muted">
              Questo è un report vero, con i nomi cambiati. Punteggio, dove ti trovano e dove no, chi
              ti passa davanti, le parole e le fonti che usano, cosa dicono di te, tre azioni. Ogni
              numero con il suo campione.
            </p>
          </div>
          <div className="mt-8 bg-bg">
            <AnteprimaReport />
          </div>
        </div>
      </section>

      {/* Perché non a mano */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Si può fare a mano. Non ogni mese.</h2>
              <p className="mt-3 text-muted">
                Aprire ChatGPT e chiedere «miglior pizzeria a Bergamo» lo fai in un minuto. Farlo su sei
                assistenti, con quindici domande, tre volte ciascuna, segnando posizione, concorrenti
                e fonti, è una giornata. E il mese dopo è già tutto diverso.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 lg:grid-cols-2">
              {[
                ["270", "risposte lette ogni mese nel piano Base"],
                ["6", "assistenti AI, interrogati con la tua città"],
                ["1º–5º", "la posizione in cui compari, non solo se compari"],
                ["8", "fonti controllate: dove l'AI prende le informazioni"],
              ].map(([n, t]) => (
                <div key={t}>
                  <dt className="tabular text-4xl font-bold tracking-tight sm:text-5xl">{n}</dt>
                  <dd className="mt-1 max-w-[18ch] text-[15px] text-muted">{t}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Come raccogliamo i dati */}
      <section id="metodo" className="border-t border-line bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Come raccogliamo i dati, senza fuffa</h2>
              <p className="mt-3 text-white/75">
                Nessuna stima a occhio. Ogni numero del report si ricava dalla mappa domanda × assistente, e ogni metrica ha la sua
                definizione: cos&apos;è, come si calcola, come si legge. Le {GLOSSARIO.length} voci sono in fondo a ogni report.
              </p>
              <p className="mt-4">
                <Link href="/metodo" className="font-semibold text-[#9fe8c6] underline underline-offset-2">
                  Leggi il metodo per intero
                </Link>
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
              {[
                ["2–3×", "ogni domanda, perché le risposte cambiano"],
                ["95%", "intervallo di confidenza dichiarato sulle quote"],
                ["90 gg", "finestra della mediana di categoria"],
                ["50", "domande confrontate ogni trimestre con le app vere"],
                ["1º–5º", "posizione contata nell'elenco"],
                ["0", "numeri stimati a occhio"],
              ].map(([n, t]) => (
                <div key={t}>
                  <dt className="tabular text-3xl font-bold tracking-tight text-[#9fe8c6]">{n}</dt>
                  <dd className="mt-1 text-sm text-white/70">{t}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-10 rounded-2xl bg-bg p-4 text-ink sm:p-6">
            <Pipeline />
          </div>
        </div>
      </section>

      {/* Per chi */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Per qualsiasi attività che i clienti cercano, dal bar alla carpenteria</h2>
              <p className="mt-3 text-muted">
                Le domande, le fonti e le azioni cambiano con il mestiere: un ristorante si gioca su piatti e orari, un dentista sulle
                prestazioni, una carpenteria su lavorazioni, certificazioni e provincia. Il report mostra solo quello che serve alla tua
                categoria; per i mestieri non previsti, il profilo lo costruiamo dal tuo sito.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {CATEGORIE.map((c) => (
                <li key={c} className="rounded-full border border-line px-3.5 py-1.5 text-[15px]">
                  {c}
                </li>
              ))}
              <li className="rounded-full border border-dashed border-line px-3.5 py-1.5 text-[15px] text-muted">
                e qualsiasi altro mestiere
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Prezzi */}
      <section id="prezzi" className="border-t border-line bg-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold sm:text-3xl">Il test è gratis. Il mese dopo costa meno di un coperto al giorno.</h2>
              <p className="mt-3 text-muted">Prezzi al mese, IVA esclusa. Con l&apos;annuale due mesi sono gratis.</p>
            </div>
            <Link href="/prezzi" className="font-semibold text-accent underline underline-offset-2">
              Tutti i dettagli dei piani
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PIANI.map((p) => (
              <div
                key={p.id}
                className={`flex flex-col rounded-2xl border bg-bg p-6 ${p.evidenza ? "border-accent ring-1 ring-accent" : "border-line"}`}
              >
                <h3 className="text-lg font-semibold">{p.nome}</h3>
                <p className="mt-1 min-h-10 text-sm text-muted">{p.perChi}</p>
                <p className="mt-4">
                  <span className="tabular text-4xl font-bold tracking-tight">{euro(p.mensile)}</span>
                  <span className="ml-1.5 text-sm text-muted">al mese</span>
                </p>
                <ul className="mt-4 space-y-1.5 text-[15px] text-muted">
                  {p.include.slice(0, 4).map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent" aria-hidden="true">
                        ✓
                      </span>
                      {i}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Bottone href={`/prezzi#${p.id}`} secondario={!p.evidenza} className="w-full sm:w-full">
                    Scegli {p.nome}
                  </Bottone>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            {SISTEMAZIONE.nome}, {euro(SISTEMAZIONE.prezzo)} una tantum: {SISTEMAZIONE.testo}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="domande" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <h2 className="text-2xl font-bold sm:text-3xl">Domande frequenti</h2>
            <div className="divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.d} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.d}
                    <span className="mt-1 shrink-0 text-faint transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 max-w-prose text-[15px] text-muted">{f.r}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Scopri cosa dicono di te. Ci vuole un minuto.</h2>
            <div className="mt-6 text-left">
              <CercaAttivita />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
