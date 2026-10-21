import Link from "next/link";
import type { ReactNode } from "react";

export function Pagina({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-2xl px-4 py-8 ${className}`}>{children}</div>;
}

export function Titolo({ children }: { children: ReactNode }) {
  return <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{children}</h1>;
}

export function Sezione({
  numero,
  titolo,
  children,
}: {
  numero?: number;
  titolo: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line py-6">
      <h2 className="mb-4 text-lg font-semibold">
        {numero !== undefined && <span className="mr-2 text-muted">{numero}.</span>}
        {titolo}
      </h2>
      {children}
    </section>
  );
}

type BottoneProps = {
  children: ReactNode;
  href?: string;
  secondario?: boolean;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Bottone({ children, href, secondario, className = "", ...rest }: BottoneProps) {
  const base =
    "inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-base font-semibold transition sm:w-auto disabled:opacity-50";
  const stile = secondario
    ? "border border-line bg-bg text-fg hover:bg-soft"
    : "bg-accent text-white hover:opacity-90";
  const cls = `${base} ${stile} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/**
 * Barra orizzontale: l'unico grafico del prodotto.
 * `tu` colora la barra con l'accento.
 */
export function Barra({
  etichetta,
  valore,
  massimo,
  testo,
  tu,
  accento,
}: {
  etichetta: string;
  valore: number;
  massimo: number;
  testo?: string;
  /** Sei tu: accento + etichetta "tu". */
  tu?: boolean;
  /** Solo il colore d'accento, senza etichetta. */
  accento?: boolean;
}) {
  const pct = massimo > 0 ? Math.max(0, Math.min(100, (valore / massimo) * 100)) : 0;
  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className={tu ? "font-semibold text-accent" : ""}>
          {etichetta}
          {tu && <span className="ml-1.5 rounded bg-accent-soft px-1.5 py-0.5 text-xs">tu</span>}
        </span>
        <span className="tabular shrink-0 text-muted">{testo ?? valore}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-soft">
        <div
          className={`h-full rounded-full ${tu || accento ? "bg-accent" : "bg-neutral-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Etichetta({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: "neutro" | "accento" | "errore" | "attenzione";
}) {
  const cls = {
    neutro: "bg-soft text-fg",
    accento: "bg-accent-soft text-accent",
    errore: "bg-danger-soft text-danger",
    attenzione: "bg-warn-soft text-warn",
  }[tono];
  return (
    <span className={`inline-block shrink-0 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

export function Scheda({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line p-4 ${className}`}>{children}</div>;
}
