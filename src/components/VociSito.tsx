"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Le tre voci del sito, come tab: quella della pagina in cui sei è
 * sottolineata. Su schermo largo stanno nell'intestazione, su telefono in
 * una riga sotto, a tutta larghezza.
 */
export const VOCI = [
  { href: "/come-funziona", testo: "Come funziona" },
  { href: "/report/esempio", testo: "Esempio" },
  { href: "/prezzi", testo: "Prezzi" },
] as const;

export function VociSito({ mobile = false, attiva = null }: { mobile?: boolean; attiva?: string | null }) {
  if (mobile) {
    return (
      <div className="grid grid-cols-3">
        {VOCI.map((v) => {
          const si = v.href === attiva;
          return (
            <Link
              key={v.href}
              href={v.href}
              aria-current={si ? "page" : undefined}
              className={`-mb-px border-b-2 py-2.5 text-center text-[14px] font-medium transition-colors ${si ? "border-accent text-ink" : "border-transparent text-muted"}`}
            >
              {v.testo}
            </Link>
          );
        })}
      </div>
    );
  }
  return (
    <div className="-mb-px flex h-full items-stretch gap-7">
      {VOCI.map((v) => {
        const si = v.href === attiva;
        return (
          <Link
            key={v.href}
            href={v.href}
            aria-current={si ? "page" : undefined}
            className={`inline-flex items-center border-b-2 text-[15px] font-medium transition-colors ${si ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {v.testo}
          </Link>
        );
      })}
    </div>
  );
}

/** Le voci con quella attiva, letta dall'indirizzo. */
export function VociSitoAttive({ mobile = false }: { mobile?: boolean }) {
  const percorso = usePathname();
  const attiva = VOCI.find((v) => percorso === v.href || percorso.startsWith(`${v.href}/`))?.href ?? null;
  return <VociSito mobile={mobile} attiva={attiva} />;
}
