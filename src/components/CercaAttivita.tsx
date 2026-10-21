"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bottone } from "@/components/ui";

/**
 * Campo "Nome attività e città" (o link di Google Maps).
 * TODO: autocompletamento Google Places quando arriva la chiave API.
 * Per ora passa il testo alla schermata di conferma.
 */
export function CercaAttivita() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function invia(e: React.FormEvent) {
    e.preventDefault();
    const testo = q.trim();
    if (!testo) return;
    router.push(`/conferma?q=${encodeURIComponent(testo)}`);
  }

  return (
    <form id="test" onSubmit={invia} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="q">
        Nome attività e città, o link di Google Maps
      </label>
      <input
        id="q"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pizzeria Da Gino, Bergamo — o il link di Google Maps"
        autoComplete="off"
        inputMode="search"
        className="w-full flex-1 rounded-lg border border-line px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <Bottone type="submit">Fai il test gratis</Bottone>
    </form>
  );
}
