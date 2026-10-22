import type { Metadata } from "next";
import { Pagina, Titolo } from "@/components/ui";
import { Prezzi } from "@/components/Prezzi";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Prezzi" };

const FAQ = [
  {
    d: "Le risposte dell'AI cambiano: come fate a misurarle?",
    r: "Facciamo ogni domanda più volte e ti diciamo quante volte compari su quante risposte, con data e ora. Un numero come «2 su 3» è onesto; un sì o un no non lo sarebbe. Ogni famiglia di domande ha abbastanza risposte da avere un intervallo proprio. Ogni trimestre confrontiamo anche le risposte delle API con quelle dell'app vera.",
  },
  {
    d: "Da dove prendete le domande, e perché non le vedo prima?",
    r: "Da uno studio dei prompt reali: le domande agli assistenti sono frasi intere con un luogo e almeno un vincolo, non parole chiave. Le costruiamo dal tuo profilo per famiglie (generiche, per bisogno, per specialità, per requisito, per occasione, vicino a te, di confronto, sul nome), a più livelli di zoom e in più formulazioni. Il set è il metodo: resta lo stesso da una scansione all'altra, così il confronto nel tempo regge. Nel report le vedi tutte, domanda per domanda, con il risultato.",
  },
  {
    d: "Cosa compro con il report singolo?",
    r: "Una scansione completa oggi: il set di domande sui sei assistenti, ogni domanda ripetuta, punteggio, concorrenti, fonti, parole, cosa dicono di te, tre azioni, PDF. Se poi ti abboni entro 30 giorni, l'importo viene scalato dal primo mese.",
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

export default function PaginaPrezzi() {
  return (
    <Pagina larga>
      <div className="max-w-2xl">
        <Titolo>Un report quando vuoi, o ogni mese</Titolo>
        <p className="mt-4 text-lg text-muted">Quanto sei visibile, chi citano al posto tuo, tre azioni. Niente da configurare, niente da imparare. Prezzi IVA esclusa.</p>
      </div>
      <div className="mt-10">
        <Prezzi pagamentiAttivi={config.stripe} />
      </div>

      <section id="domande" className="mt-16 scroll-mt-20">
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
      </section>
    </Pagina>
  );
}
