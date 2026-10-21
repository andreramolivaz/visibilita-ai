"use client";

import { useState } from "react";
import { Campo } from "@/components/ui";
import { Checkout } from "@/components/Checkout";
import { PIANI, euro, type Periodo, type PianoId } from "@/lib/prezzi";

/**
 * In fondo al report, un solo invito: "Ricevilo ogni mese".
 * Email + piano + periodo, poi Stripe Checkout con l'email già compilata.
 */
export function InvitoAbbonamento({ reportId, pagamentiAttivi }: { reportId: string; pagamentiAttivi: boolean }) {
  const [email, setEmail] = useState("");
  const [pianoId, setPianoId] = useState<PianoId>("base");
  const [periodo, setPeriodo] = useState<Periodo>("mensile");
  const piani = PIANI.filter((p) => p.id !== "agenzia");
  const emailValida = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <section className="no-print mt-10 rounded-2xl border border-accent p-5 sm:p-7">
      <h2 className="text-xl font-semibold sm:text-2xl">Ricevilo ogni mese</h2>
      <p className="mt-1.5 max-w-prose text-[15px] text-muted">
        Ogni mese una sola email: punteggio, variazione rispetto al mese prima, due azioni e il link
        al report. Vedi se le azioni hanno funzionato e se entra un concorrente nuovo.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {piani.map((p) => {
          const scelto = pianoId === p.id;
          return (
            <label
              key={p.id}
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                scelto ? "border-accent bg-accent-soft/50 ring-1 ring-accent" : "border-line hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name="piano"
                value={p.id}
                checked={scelto}
                onChange={() => setPianoId(p.id)}
                className="sr-only"
              />
              <span className="flex items-baseline justify-between">
                <span className="font-semibold">{p.nome}</span>
                <span className="tabular text-sm">
                  <span className="text-lg font-bold">{euro(periodo === "annuale" ? p.annuale : p.mensile)}</span>
                  <span className="text-muted"> {periodo === "annuale" ? "all'anno" : "al mese"}</span>
                </span>
              </span>
              <span className="mt-1 block text-sm text-muted">{p.include.slice(1, 4).join(". ")}.</span>
            </label>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <input
          id="annuale"
          type="checkbox"
          checked={periodo === "annuale"}
          onChange={(e) => setPeriodo(e.target.checked ? "annuale" : "mensile")}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <label htmlFor="annuale">Pago una volta all&apos;anno e ho due mesi gratis</label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <label htmlFor="email-report" className="sr-only">
            La tua email
          </label>
          <Campo
            id="email-report"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="La tua email"
          />
        </div>
        <Checkout piano={pianoId} periodo={periodo} email={emailValida ? email : undefined} reportId={reportId} attivo={pagamentiAttivi}>
          Attiva e paga
        </Checkout>
      </div>
      <p className="mt-3 text-xs text-muted">
        Prezzi IVA esclusa. Pagamento su Stripe, disdici quando vuoi. L&apos;email serve anche a
        rimandarti il link di questo report.
      </p>
    </section>
  );
}
