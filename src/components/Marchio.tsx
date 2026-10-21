import Link from "next/link";

/**
 * Il marchio: una risposta di un assistente (la bolla con l'elenco) la cui
 * coda è un segnaposto (il locale). La riga accesa con il punto è la tua.
 */
export function Simbolo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path
        d="M14 6h36a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10H40l-8 9-8-9H14A10 10 0 0 1 4 42V16A10 10 0 0 1 14 6z"
        fill="var(--accent)"
      />
      <circle cx="17" cy="19" r="3" fill="#fff" opacity=".4" />
      <rect x="24" y="16.5" width="18" height="5" rx="2.5" fill="#fff" opacity=".4" />
      <circle cx="17" cy="29" r="3.5" fill="#9fe8c6" />
      <rect x="24" y="26" width="26" height="6" rx="3" fill="#fff" />
      <circle cx="17" cy="39" r="3" fill="#fff" opacity=".4" />
      <rect x="24" y="36.5" width="14" height="5" rx="2.5" fill="#fff" opacity=".4" />
    </svg>
  );
}

export function Marchio({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-semibold tracking-[-0.01em] ${className}`}>
      <Simbolo size={size} />
      <span>Visibilità AI</span>
    </Link>
  );
}
