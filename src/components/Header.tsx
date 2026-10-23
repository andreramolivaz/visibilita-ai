import { Suspense } from "react";
import Link from "next/link";
import { Marchio } from "./Marchio";
import { Bottone } from "./ui";
import { VociSito, VociSitoAttive } from "./VociSito";

/**
 * L'intestazione: il marchio, tre tab (Come funziona, Esempio, Prezzi),
 * Accedi e il bottone. Su telefono i tab vanno in una riga sotto, che
 * scorre via con la pagina; la riga del marchio resta in alto.
 * Altezze fisse (52 e 64 px più il bordo): i tab del report si attaccano lì sotto.
 */
export function Header() {
  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-[52px] max-w-6xl items-center gap-8 px-4 sm:px-6 md:h-16">
          <Marchio size={26} />
          <nav className="hidden h-full md:block" aria-label="Principale">
            <Suspense fallback={<VociSito />}>
              <VociSitoAttive />
            </Suspense>
          </nav>
          <div className="ml-auto flex items-center gap-4 sm:gap-5">
            <Link href="/accedi" className="text-[14px] text-muted hover:text-ink sm:text-[15px]">
              Accedi
            </Link>
            <Bottone href="/#test" className="!w-auto !px-3.5 !py-2 !text-[14px] sm:!px-4 sm:!text-[15px]">
              Avvia il report
            </Bottone>
          </div>
        </div>
      </header>
      <nav className="no-print border-b border-line md:hidden" aria-label="Principale">
        <Suspense fallback={<VociSito mobile />}>
          <VociSitoAttive mobile />
        </Suspense>
      </nav>
    </>
  );
}
