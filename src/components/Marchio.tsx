import Link from "next/link";

/** Marchio: tre barre crescenti e il punto di "tu". */
export function Marchio({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="var(--accent)" />
        <rect x="14" y="36" width="36" height="7" rx="3.5" fill="#fff" opacity=".45" />
        <rect x="14" y="25" width="24" height="7" rx="3.5" fill="#fff" opacity=".7" />
        <rect x="14" y="14" width="14" height="7" rx="3.5" fill="#fff" />
        <circle cx="46" cy="17.5" r="4" fill="#fff" />
      </svg>
      <span>Visibilità AI</span>
    </Link>
  );
}
