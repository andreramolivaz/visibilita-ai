"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bottone, Campo } from "@/components/ui";

/**
 * Campo "Nome attività e città" (o link di Google Maps).
 * TODO: autocompletamento Google Places quando arriva la chiave API.
 */
export function CercaAttivita({ grande = false, id }: { grande?: boolean; id?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function invia(e: React.FormEvent) {
    e.preventDefault();
    const testo = q.trim();
    if (!testo) return;
    router.push(`/conferma?q=${encodeURIComponent(testo)}`);
  }

  return (
    <form id={id} onSubmit={invia} className="flex flex-col gap-2.5 sm:flex-row">
      <label className="sr-only" htmlFor={`q-${id ?? "cta"}`}>
        Nome attività e città, o link di Google Maps
      </label>
      <Campo
        id={`q-${id ?? "cta"}`}
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nome dell'attività e città"
        autoComplete="off"
        inputMode="search"
        className={grande ? "sm:py-3.5 sm:text-lg" : ""}
      />
      <Bottone type="submit" className={grande ? "sm:px-6 sm:py-3.5 sm:text-lg" : ""}>
        Avvia il report
      </Bottone>
    </form>
  );
}
