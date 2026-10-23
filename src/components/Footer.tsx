import Link from "next/link";
import { Marchio } from "./Marchio";

const VOCI = [
  { href: "/come-funziona", testo: "Come funziona" },
  { href: "/report/esempio", testo: "Report di esempio" },
  { href: "/prezzi", testo: "Prezzi" },
  { href: "/white-paper-visibilita-ai.pdf", testo: "White paper (PDF)" },
  { href: "/accedi", testo: "Accedi" },
  { href: "/area/demo", testo: "Area di esempio" },
  { href: "/privacy", testo: "Privacy" },
  { href: "mailto:ciao@visibilita-ai.it", testo: "Scrivici" },
];

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Marchio />
            <p className="mt-2 max-w-xs text-sm text-muted">Scopri se gli assistenti AI consigliano te o i tuoi concorrenti.</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-muted sm:grid-cols-4 md:gap-x-8">
            {VOCI.map((v) => (
              <li key={v.href}>
                {v.href.endsWith(".pdf") || v.href.startsWith("mailto:") ? (
                  <a href={v.href} className="hover:text-ink" {...(v.href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {v.testo}
                  </a>
                ) : (
                  <Link href={v.href} className="hover:text-ink">
                    {v.testo}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 text-xs text-faint">
          Non siamo affiliati a OpenAI, Google, Anthropic, Perplexity o xAI: i marchi appartengono ai rispettivi proprietari.
        </p>
      </div>
    </footer>
  );
}
