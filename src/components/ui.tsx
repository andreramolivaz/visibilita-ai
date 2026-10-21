import Link from "next/link";
import type { ReactNode } from "react";

/** Colonna di lettura: 680 px. Per le pagine larghe usa `larga`. */
export function Pagina({
  children,
  className = "",
  larga = false,
}: {
  children: ReactNode;
  className?: string;
  larga?: boolean;
}) {
  return (
    <div className={`mx-auto w-full px-4 py-10 sm:px-6 sm:py-14 ${larga ? "max-w-6xl" : "max-w-2xl"} ${className}`}>
      {children}
    </div>
  );
}

export function Titolo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-3xl font-bold sm:text-4xl ${className}`}>{children}</h1>;
}

export function Sezione({
  numero,
  titolo,
  children,
  id,
}: {
  numero?: number;
  titolo: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="border-t border-line py-7 sm:py-8">
      <h2 className="mb-4 text-lg font-semibold sm:text-xl">
        {numero !== undefined && <span className="tabular mr-2 text-faint">{numero}.</span>}
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
  target?: string;
};

export function Bottone({ children, href, secondario, className = "", ...rest }: BottoneProps) {
  const base =
    "inline-flex w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-5 py-3 text-base font-semibold transition-colors sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed";
  const stile = secondario
    ? "border border-line bg-bg text-ink hover:border-ink"
    : "bg-accent text-white hover:bg-accent-ink";
  const cls = `${base} ${stile} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} target={rest.target}>
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
 * `tu` colora la barra con l'accento e aggiunge l'etichetta "tu".
 */
export function Barra({
  etichetta,
  valore,
  massimo,
  testo,
  tu,
  accento,
  sotto,
}: {
  etichetta: string;
  valore: number;
  massimo: number;
  testo?: string;
  tu?: boolean;
  accento?: boolean;
  /** Riga piccola sotto l'etichetta. */
  sotto?: string;
}) {
  const pct = massimo > 0 ? Math.max(0, Math.min(100, (valore / massimo) * 100)) : 0;
  const pieno = tu || accento;
  return (
    <div className="py-2">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[15px]">
        <span className={tu ? "font-semibold text-accent" : ""}>
          {etichetta}
          {tu && (
            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-[11px] font-semibold text-white">
              tu
            </span>
          )}
          {sotto && <span className="ml-2 text-sm text-faint">{sotto}</span>}
        </span>
        <span className="tabular shrink-0 text-sm text-muted">{testo ?? valore}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-soft">
        <div
          className={`h-full rounded-full ${pieno ? "bg-accent" : "bg-[#b9c2be]"}`}
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
    neutro: "bg-soft text-ink",
    accento: "bg-accent-soft text-accent-ink",
    errore: "bg-danger-soft text-danger",
    attenzione: "bg-warn-soft text-warn",
  }[tono];
  return (
    <span className={`inline-block shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

export function Scheda({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function Campo(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-line bg-bg px-4 py-3 text-base text-ink placeholder:text-faint outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 ${props.className ?? ""}`}
    />
  );
}
