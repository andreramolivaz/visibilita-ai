import type { Metadata } from "next";
import { Pagina, Titolo } from "@/components/ui";
import { Prezzi } from "@/components/Prezzi";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Prezzi" };

/** Domande frequenti: risposte brevi, in parole semplici. Il metodo completo è nel white paper. */
const FAQ = [
  {
    d: "Cosa ricevo?",
    r: "Il tuo punteggio da 0 a 100, chi consigliano gli assistenti al posto tuo, da dove prendono le informazioni e le tre cose da fare, in ordine di impatto. Online e in PDF, in pochi minuti.",
  },
  {
    d: "Le risposte dell'AI cambiano ogni volta: come fate a misurarle?",
    r: "Facciamo ogni domanda più volte e contiamo quante volte compari. Per questo il report dice sempre «su quante risposte»: un numero vero, non un sì o un no.",
  },
  {
    d: "E se risulto invisibile?",
    r: "Succede alla maggior parte delle attività. Il report ti dice chi citano al posto tuo e cosa fare per comparire. Se preferisci, lo facciamo noi.",
  },
  {
    d: "Quali assistenti controllate?",
    r: "ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok. Non siamo affiliati a nessuno di loro.",
  },
  {
    d: "Posso disdire quando voglio?",
    r: "Sì, dall'area personale, in un clic. Il mensile si ferma a fine mese, l'annuale a fine anno.",
  },
];

export default function PaginaPrezzi() {
  return (
    <Pagina larga>
      <div className="max-w-2xl">
        <Titolo>Prezzi</Titolo>
        <p className="mt-4 text-lg text-muted">Parti con un report. Se vuoi seguire i progressi, ricevilo ogni mese.</p>
      </div>
      <div className="mt-10">
        <Prezzi pagamentiAttivi={config.stripe} />
      </div>

      <section id="domande" className="mt-16 scroll-mt-24">
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
