"use client";

import { useState } from "react";
import { Bottone } from "@/components/ui";

/**
 * In fondo al report, un solo invito: "Ricevilo ogni mese".
 * Email + scelta del piano, poi checkout Stripe (TODO).
 */
export function InvitoAbbonamento() {
  const [email, setEmail] = useState("");
  const [piano, setPiano] = useState<"base" | "pro">("base");
  const [inviato, setInviato] = useState(false);

  function invia(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /api/checkout → Stripe; intanto conferma a schermo.
    setInviato(true);
  }

  if (inviato) {
    return (
      <section className="no-print mt-8 rounded-2xl bg-accent-soft p-6">
        <h2 className="text-xl font-semibold text-accent">Quasi fatto</h2>
        <p className="mt-2 text-sm">
          Ti abbiamo mandato un link a <strong>{email}</strong>. Il pagamento arriva con il
          collegamento a Stripe.
        </p>
      </section>
    );
  }

  return (
    <section className="no-print mt-8 rounded-2xl border border-accent bg-accent-soft/40 p-6">
      <h2 className="text-xl font-semibold">Ricevilo ogni mese</h2>
      <p className="mt-1 text-sm text-muted">
        Ogni mese una sola email: punteggio, variazione rispetto al mese prima, due azioni e il link
        al report completo. Nessun&apos;altra notifica.
      </p>
      <form onSubmit={invia} className="mt-4 space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <label
            className={`cursor-pointer rounded-lg border p-3 text-sm ${
              piano === "base" ? "border-accent bg-bg" : "border-line"
            }`}
          >
            <input
              type="radio"
              name="piano"
              value="base"
              checked={piano === "base"}
              onChange={() => setPiano("base")}
              className="sr-only"
            />
            <span className="block font-semibold">
              Base · 9 €/mese <span className="font-normal text-muted">+ IVA</span>
            </span>
            <span className="text-muted">10 domande, 3 motori, scansione mensile, storico.</span>
          </label>
          <label
            className={`cursor-pointer rounded-lg border p-3 text-sm ${
              piano === "pro" ? "border-accent bg-bg" : "border-line"
            }`}
          >
            <input
              type="radio"
              name="piano"
              value="pro"
              checked={piano === "pro"}
              onChange={() => setPiano("pro")}
              className="sr-only"
            />
            <span className="block font-semibold">
              Pro · 19 €/mese <span className="font-normal text-muted">+ IVA</span>
            </span>
            <span className="text-muted">
              Settimanale, 20 domande, tutti i motori, 5 concorrenti, PDF.
            </span>
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="La tua email"
            className="w-full flex-1 rounded-lg border border-line bg-bg px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <Bottone type="submit">Continua</Bottone>
        </div>
        <p className="text-xs text-muted">
          L&apos;email serve anche a rimandarti il link di questo report. Annuale: due mesi gratis.
        </p>
      </form>
    </section>
  );
}
