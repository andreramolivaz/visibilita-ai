"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProfiloAttivita, SegnaliProfilo } from "@/lib/types";
import { Bottone, Campo, Etichetta, Scheda } from "@/components/ui";
import { motoriAttivi } from "@/lib/engines";
import { REPORT_SINGOLO, euro } from "@/lib/prezzi";

const MOTORI = motoriAttivi().length;

/**
 * Passo 1: il profilo trovato e i segnali da cui costruiamo le domande.
 * Le domande non si vedono: sono il metodo. Si vede da dove vengono.
 * Poi il pagamento del report (Stripe) e la scansione; senza pagamenti
 * attivi, la dimostrazione.
 */
export function ConfermaProfilo({
  attivita,
  segnali,
  recensioni = [],
  pagamenti,
}: {
  attivita: ProfiloAttivita;
  segnali: SegnaliProfilo;
  recensioni?: string[];
  /** Pagamenti attivi sul server: il bottone porta a Stripe. */
  pagamenti: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [avvio, setAvvio] = useState<"fermo" | "invio" | "errore">("fermo");
  const [errore, setErrore] = useState("");

  const emailValida = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  /** Crea la scansione e, con i pagamenti attivi, apre il pagamento; altrimenti parte la dimostrazione. */
  async function avvia() {
    if (pagamenti && !emailValida) {
      setAvvio("errore");
      setErrore("Scrivi l'email a cui mandare il report.");
      return;
    }
    setAvvio("invio");
    setErrore("");
    try {
      const r = await fetch("/api/scansioni", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attivita, segnali, recensioni, email: email.trim() || undefined }),
      });
      const dati = (await r.json()) as { id?: string; url?: string; simulata?: boolean; errore?: string };
      if (!r.ok || !dati.id) throw new Error(dati.errore ?? "Non siamo riusciti ad avviare il report.");
      if (dati.url && /^https?:\/\//.test(dati.url)) {
        window.location.assign(dati.url);
        return;
      }
      sessionStorage.setItem(dati.id, JSON.stringify({ attivita, simulata: Boolean(dati.simulata) }));
      router.push(dati.url ?? `/scansione?id=${dati.id}`);
    } catch (e) {
      setAvvio("errore");
      setErrore(e instanceof Error ? e.message : "Non siamo riusciti ad avviare il report.");
    }
  }

  const voci: [string, string | undefined][] = [
    ["Categoria", attivita.categoriaGoogle],
    ["Specialità", attivita.specialita.join(", ")],
    ["Fascia di prezzo", attivita.fasciaPrezzo],
    ["Indirizzo", attivita.indirizzo],
    ["Orari", attivita.orari],
  ];

  return (
    <div className="mt-6 space-y-6">
      <Scheda>
        <h2 className="text-2xl font-bold">{attivita.nome}</h2>
        <p className="text-muted">{attivita.citta}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {voci
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        <div className="mt-4 text-sm">
          <p className="text-xs text-muted">Dove sei presente</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {attivita.portaliPresenti.map((p) => (
              <Etichetta key={p} tono="accento">
                {p}
              </Etichetta>
            ))}
            {attivita.portaliAssenti.map((p) => (
              <Etichetta key={p} tono="errore">
                {p}: assente
              </Etichetta>
            ))}
          </div>
        </div>
        {attivita.incoerenze.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm">
            {attivita.incoerenze.map((i) => (
              <li key={i} className="flex gap-2">
                <Etichetta tono="attenzione">da verificare</Etichetta>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        )}
      </Scheda>

      <Scheda>
        <h2 className="font-semibold">Da dove vengono le domande</h2>
        <p className="mt-1 text-sm text-muted">
          Le domande le costruiamo noi dal tuo profilo, per famiglie: generiche, per bisogno, per specialità, per requisito, per occasione, vicino a te, di
          confronto, sul nome. Ogni famiglia a più livelli di zoom e in più formulazioni. Il testo esatto resta nel metodo: nel report vedi il risultato,
          domanda per domanda.
        </p>
        <dl className="mt-3 space-y-2.5 text-sm">
          {segnali.recensioni.length > 0 && (
            <div>
              <dt className="text-xs text-muted">Dalle tue recensioni Google</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {segnali.recensioni.slice(0, 6).map((t) => (
                  <Etichetta key={t.termine} tono="accento">
                    {t.termine} <span className="tabular font-normal opacity-70">{t.volte}</span>
                  </Etichetta>
                ))}
              </dd>
            </div>
          )}
          {segnali.sito.length > 0 && (
            <div>
              <dt className="text-xs text-muted">Dal tuo sito</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {segnali.sito.slice(0, 6).map((t) => (
                  <Etichetta key={t.termine}>{t.termine}</Etichetta>
                ))}
              </dd>
            </div>
          )}
          {segnali.ricerche.length > 0 && (
            <div>
              <dt className="text-xs text-muted">Dalle ricerche Google a {attivita.citta}: i vincoli che la gente aggiunge</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {segnali.ricerche.map((r) => (
                  <Etichetta key={r}>{r}</Etichetta>
                ))}
              </dd>
            </div>
          )}
          {segnali.concorrenti.length > 0 && (
            <div>
              <dt className="text-xs text-muted">Confronto diretto con i concorrenti più noti vicino a te</dt>
              <dd className="mt-1">
                {segnali.concorrenti.slice(0, 3).map((c, i) => (
                  <span key={c.nome}>
                    {i > 0 && <span className="text-faint"> · </span>}
                    <span className="font-medium">{c.nome}</span>
                    <span className="tabular text-muted">{c.distanzaM ? ` (${c.distanzaM} m)` : ""}</span>
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
        {segnali.note.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {segnali.note.map((n) => (
              <li key={n} className="flex gap-2">
                <Etichetta tono={segnali.fonte === "esempio" ? "neutro" : "attenzione"}>{segnali.fonte === "esempio" ? "esempio" : "nota"}</Etichetta>
                <span className="text-muted">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </Scheda>

      <Scheda className="border-0 bg-soft">
        <h2 className="font-semibold">Cosa misuriamo</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>{MOTORI} assistenti AI, interrogati con la tua città e, per le domande vicino a te, con la posizione impostata in punti diversi intorno all&apos;attività.</li>
          <li>Ogni domanda ripetuta, perché le risposte cambiano: nel report vedi sempre quante volte compari su quante risposte.</li>
          <li>La posizione in cui ti nominano, chi citano al posto tuo, da quali fonti prendono le informazioni, cosa dicono di te e se i dati sono giusti.</li>
        </ul>
      </Scheda>

      <div className="rounded-2xl border border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">{REPORT_SINGOLO.nome}</h2>
          <p>
            <span className="tabular text-2xl font-bold">{euro(REPORT_SINGOLO.prezzo)}</span> <span className="text-sm text-muted">una tantum, IVA esclusa</span>
          </p>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {REPORT_SINGOLO.include.map((i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent" aria-hidden="true">
                ✓
              </span>
              {i}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <label className="block text-sm font-medium" htmlFor="email">
            La tua email
          </label>
          <Campo id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@attivita.it" autoComplete="email" className="mt-1.5" />
          <p className="mt-1.5 text-xs text-muted">Ti mandiamo il link del report e, se vuoi, lo ritrovi nella tua area con la stessa email.</p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Bottone onClick={avvia} disabled={avvio === "invio"}>
            {avvio === "invio" ? "Un momento…" : pagamenti ? `Paga ${euro(REPORT_SINGOLO.prezzo)} e avvia il report` : "Avvia la dimostrazione"}
          </Bottone>
          <Bottone href="/" secondario>
            Non sono io
          </Bottone>
        </div>
        {avvio === "errore" && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {errore}
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          {pagamenti ? "Pagamento sicuro con Stripe: carta, Apple Pay o Google Pay. Fattura in automatico." : "I pagamenti non sono ancora attivi su questo ambiente: la scansione è una dimostrazione con il report di esempio."}{" "}
          Usiamo solo dati pubblici della tua attività.
        </p>
      </div>
    </div>
  );
}
