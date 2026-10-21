import Link from "next/link";
import { Marchio } from "./Marchio";
import { Bottone } from "./ui";

const VOCI = [
  { href: "/report/esempio", testo: "Report di esempio" },
  { href: "/metodo", testo: "Metodo" },
  { href: "/prezzi", testo: "Prezzi" },
  { href: "/agenzie", testo: "Agenzie" },
];

export function Header() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Marchio size={26} />
        <nav className="hidden items-center gap-6 text-[15px] text-muted md:flex" aria-label="Principale">
          {VOCI.map((v) => (
            <Link key={v.href} href={v.href} className="hover:text-ink">
              {v.testo}
            </Link>
          ))}
          <Link href="/accedi" className="hover:text-ink">
            Accedi
          </Link>
          <Bottone href="/#test" className="!w-auto !px-4 !py-2 !text-[15px]">
            Fai il test gratis
          </Bottone>
        </nav>
        <nav className="flex items-center gap-4 text-sm text-muted md:hidden" aria-label="Principale">
          <Link href="/prezzi" className="hover:text-ink">
            Prezzi
          </Link>
          <Link href="/accedi" className="hover:text-ink">
            Accedi
          </Link>
        </nav>
      </div>
    </header>
  );
}
