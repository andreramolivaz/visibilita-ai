import Link from "next/link";
import { Marchio } from "./Marchio";

const COLONNE = [
  {
    titolo: "Prodotto",
    voci: [
      { href: "/#come-funziona", testo: "Come funziona" },
      { href: "/report/esempio", testo: "Report di esempio" },
      { href: "/prezzi", testo: "Prezzi" },
      { href: "/#domande", testo: "Domande frequenti" },
    ],
  },
  {
    titolo: "Per chi lo rivende",
    voci: [
      { href: "/agenzie", testo: "Agenzie e freelance" },
      { href: "/prezzi#agenzia", testo: "Piano Agenzia" },
    ],
  },
  {
    titolo: "Account",
    voci: [
      { href: "/accedi", testo: "Accedi" },
      { href: "/privacy", testo: "Privacy" },
      { href: "mailto:ciao@visibilita-ai.it", testo: "Scrivici" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Marchio />
            <p className="mt-3 max-w-xs text-sm text-muted">
              Ti dice se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok consigliano te o i tuoi concorrenti, e cosa fare
              per cambiare le cose.
            </p>
          </div>
          {COLONNE.map((c) => (
            <div key={c.titolo}>
              <h2 className="text-sm font-semibold">{c.titolo}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {c.voci.map((v) => (
                  <li key={v.href}>
                    <Link href={v.href} className="hover:text-ink">
                      {v.testo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-faint">
          Funziona con ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok. Non siamo affiliati a OpenAI, Google, Anthropic, Perplexity o xAI;
          i marchi appartengono ai rispettivi proprietari. Le risposte dei motori cambiano nel tempo:
          mostriamo sempre quante volte compari su quante risposte. Usiamo solo dati pubblici della
          tua attività e la tua email.
        </p>
      </div>
    </footer>
  );
}
