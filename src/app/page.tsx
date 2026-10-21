import Link from "next/link";
import { CercaAttivita } from "@/components/CercaAttivita";
import { ChatSimulata } from "@/components/landing/ChatSimulata";
import { AnteprimaReport } from "@/components/landing/AnteprimaReport";
import { Passi } from "@/components/landing/Passi";
import { StrisciaMotori } from "@/components/landing/StrisciaMotori";
import { Categorie } from "@/components/landing/Categorie";
import { Bottone } from "@/components/ui";
import { Pipeline } from "@/components/metodo/Pipeline";
import { GLOSSARIO } from "@/lib/glossario";
import { PIANI, SISTEMAZIONE, euro } from "@/lib/prezzi";
import { RIFERIMENTI } from "@/lib/riferimenti";

const FAQ = [
  {
    d: "Le risposte dell'AI cambiano: come fate a misurarle?",
    r: "Facciamo ogni domanda più volte e ti diciamo quante volte compari su quante risposte, con data e ora. Un numero come «2 su 3» è onesto; un sì o un no non lo sarebbe. Ogni trimestre confrontiamo anche le risposte delle API con quelle dell'app vera.",
  },
  {
    d: "Da dove prendete le domande?",
    r: "Da uno studio dei prompt reali: le domande agli assistenti sono frasi di 8–25 parole con un luogo e almeno un vincolo, non parole chiave. Sei tipi (generiche, per bisogno, per specialità, per requisito, di confronto, sul nome), con modelli scritti per 36 categorie e riempiti con la tua città, la tua zona o provincia, le tue specialità e i tuoi servizi. Una la scegli tu.",
  },
  {
    d: "Serve registrarsi per il test?",
    r: "No. Scrivi il nome, confermi il profilo e vedi il report. L'email serve solo se vuoi riceverlo ogni mese o ritrovare il link.",
  },
  {
    d: "Cosa succede se risulto invisibile?",
    r: "È la situazione più comune: ChatGPT raccomanda l'1,2% delle sedi monitorate da SOCi (2026) e il 40,9% delle attività locali non viene mai raccomandato (Insites, 10.000 attività, 2026). Il report ti dice chi citano al posto tuo, da quali fonti prendono le informazioni e le tre cose da fare, in ordine di impatto. Se preferisci, le facciamo noi.",
  },
  {
    d: "Come faccio a fidarmi dei numeri?",
    r: "Ogni numero ha il suo campione («51 su 270») e, dove è una quota, l'intervallo di confidenza. Le domande sono ripetute, la posizione è dichiarata, i pesi degli assistenti vengono da dati pubblici e si aggiornano ogni trimestre. In fondo a ogni report ci sono le definizioni, e nella pagina Metodo tutto il percorso dei dati.",
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

/** I tre riferimenti esterni da mettere in evidenza nella banda del metodo. */
const RIFERIMENTI_HOME = RIFERIMENTI.slice(0, 3);

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-14 sm:px-6 sm:pt-20 sm:pb-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0 max-w-xl">
              <h1 className="display">Quando un cliente chiede a ChatGPT, fa il tuo nome?</h1>
              <p className="mt-5 max-w-lg text-lg text-muted sm:text-xl">
                In 60 secondi sai se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok consigliano te o i tuoi concorrenti, e le tre cose da sistemare.
              </p>
              <div className="mt-8">
                <CercaAttivita grande id="test" />
              </div>
              <p className="mt-3 text-sm text-muted">Gratis, senza registrazione. Ristoranti e studi medici come carpenterie e logistica: le domande cambiano con il mestiere.</p>
            </div>
            <div className="flex min-w-0 justify-center pt-4 lg:justify-end">
              <ChatSimulata />
            </div>
          </div>
        </div>
      </section>

      {/* Sei assistenti */}
      <section className="border-y border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-10">
          <StrisciaMotori />
        </div>
      </section>

      {/* Come funziona */}
      <section id="come-funziona">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Come funziona</h2>
            <p className="mt-3 text-lg text-muted">Un minuto per te, qualche minuto per noi. Niente da configurare.</p>
          </div>
          <div className="mt-10">
            <Passi />
          </div>
        </div>
      </section>

      {/* Il report */}
      <section className="border-t border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Si può fare a mano. Non ogni mese.</h2>
            </div>
            <p className="text-lg text-muted">
              Aprire ChatGPT e chiedere <span className="domanda text-ink">miglior pizzeria a Bergamo</span> lo fai in un minuto. Farlo su sei assistenti, con quindici
              domande, tre volte ciascuna in giorni diversi, segnando posizione, concorrenti e fonti, è una giornata. E il mese dopo è già tutto diverso. Questo è un
              report vero, con i nomi cambiati.
            </p>
          </div>
          <div className="mt-10">
            <AnteprimaReport />
          </div>
        </div>
      </section>

      {/* Metodo */}
      <section id="metodo" className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Come raccogliamo i dati</h2>
              <p className="mt-4 text-white/75">
                Ogni numero del report si ricava dalla mappa domanda × assistente, e ogni metrica ha la sua definizione: cos&apos;è, come si calcola, come si legge.
                Le {GLOSSARIO.length} voci sono nelle note tecniche di ogni report. Nessuna previsione e nessuna stima senza campione.
              </p>
              <p className="mt-5">
                <Link href="/metodo" className="font-semibold text-[#9fe8c6] underline underline-offset-2">
                  Leggi il metodo per intero
                </Link>
              </p>
            </div>
            <dl className="divide-y divide-white/15 border-y border-white/15">
              {[
                ["Ogni domanda 2–3 volte", "in giorni diversi, perché le risposte cambiano più tra un giorno e l'altro che tra un minuto e l'altro"],
                ["Intervallo al 95%", "dichiarato su ogni quota: due scansioni sono diverse solo se gli intervalli non si sovrappongono"],
                ["Sei tipi di domanda", "dallo studio dei prompt reali: generiche, per bisogno, per specialità, per requisito, di confronto, sul nome"],
                ["Riconoscimento a regole", "nome, indirizzo e telefono nel testo; la posizione è l'ordine in cui compari, dichiarato"],
                ["Controllo trimestrale", "50 domande confrontate con le app vere, e i pesi degli assistenti aggiornati con le quote d'uso"],
                ["Zero previsioni", "mostriamo l'andamento, non il futuro"],
              ].map(([n, t]) => (
                <div key={n} className="grid gap-1 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt className="font-semibold text-[#9fe8c6]">{n}</dt>
                  <dd className="text-[15px] text-white/70">{t}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-12">
            <Pipeline scuro />
          </div>
          <div className="mt-10 border-t border-white/15 pt-8">
            <p className="text-sm text-white/55">Perché uno zero è la norma, non un difetto della misura: i riferimenti esterni, nel report e nel metodo.</p>
            <ul className="mt-4 grid gap-6 sm:grid-cols-3">
              {RIFERIMENTI_HOME.map((r) => (
                <li key={r.fonte} className="text-[15px]">
                  <p>{r.dato.split(";")[0].replace(/\.$/, "")}.</p>
                  <p className="mt-1 text-[13px] text-white/55">
                    {r.fonte}, {r.anno} · {r.campione}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Per chi */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Per qualsiasi attività che i clienti cercano, dal bar alla carpenteria</h2>
            <div>
              <p className="text-lg text-muted">
                Trentasei categorie con domande, fonti e azioni proprie: un ristorante si gioca su piatti e orari, un dentista sulle prestazioni, una carpenteria su
                lavorazioni, certificazioni, provincia e domande in inglese. Per i mestieri non previsti il profilo lo costruiamo dal tuo sito e dalla tua scheda
                Google.
              </p>
              <p className="mt-3 text-[13px] text-faint">Imprese attive per categoria: ISTAT, registro ASIA 2023 (via Eurostat).</p>
            </div>
          </div>
          <div className="mt-10">
            <Categorie />
          </div>
        </div>
      </section>

      {/* Prezzi */}
      <section id="prezzi" className="border-t border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">Il test è gratis. Il mese dopo costa meno di un coperto al giorno.</h2>
              <p className="mt-3 text-muted">Prezzi al mese, IVA esclusa. Con l&apos;annuale due mesi sono gratis.</p>
            </div>
            <Link href="/prezzi" className="font-semibold text-accent underline underline-offset-2">
              Tutti i dettagli dei piani
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PIANI.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-2xl p-6 ${p.evidenza ? "bg-ink text-white" : "border border-line bg-bg"}`}>
                <h3 className="text-lg font-semibold">{p.nome}</h3>
                <p className={`mt-1 min-h-10 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>{p.perChi}</p>
                <p className="mt-4">
                  <span className="tabular text-4xl font-bold tracking-tight">{euro(p.mensile)}</span>
                  <span className={`ml-1.5 text-sm ${p.evidenza ? "text-white/70" : "text-muted"}`}>al mese</span>
                </p>
                <ul className={`mt-4 space-y-1.5 text-[15px] ${p.evidenza ? "text-white/80" : "text-muted"}`}>
                  {p.include.slice(0, 4).map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className={p.evidenza ? "text-[#9fe8c6]" : "text-accent"} aria-hidden="true">
                        ✓
                      </span>
                      {i}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Bottone href={`/prezzi#${p.id}`} secondario={!p.evidenza} className={`w-full sm:w-full ${p.evidenza ? "!bg-[#9fe8c6] !text-ink hover:!bg-[#b8f0d6]" : ""}`}>
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Domande frequenti</h2>
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
            <p className="domanda text-2xl text-muted sm:text-3xl">Cosa mi consigli qui vicino, aperto adesso?</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Scopri se fanno il tuo nome. Ci vuole un minuto.</h2>
            <div className="mt-7 text-left">
              <CercaAttivita />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
