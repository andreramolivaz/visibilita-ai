"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Domanda, ProfiloAttivita } from "@/lib/types";
import { Bottone, Etichetta, Scheda } from "@/components/ui";

export function ConfermaProfilo({
  attivita,
  domande: iniziali,
}: {
  attivita: ProfiloAttivita;
  domande: Domanda[];
}) {
  const router = useRouter();
  const [domande, setDomande] = useState(iniziali);
  const [modifica, setModifica] = useState<string | null>(null);

  function avvia() {
    // TODO: POST /api/scansioni con profilo e domande; qui si simula.
    const id = `scan-${Date.now().toString(36)}`;
    sessionStorage.setItem(
      id,
      JSON.stringify({ attivita, domande: domande.map((d) => d.testo) }),
    );
    router.push(`/scansione?id=${id}`);
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
        <h2 className="text-xl font-semibold">{attivita.nome}</h2>
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

      <div>
        <h2 className="font-semibold">Le {domande.length} domande che faremo</h2>
        <p className="text-sm text-muted">
          Quelle che un cliente farebbe davvero. Puoi cambiarne una.
        </p>
        <ol className="mt-3 space-y-2">
          {domande.map((d) => (
            <li key={d.id} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="tabular mt-0.5 text-muted">{d.id.slice(1)}.</span>
              {modifica === d.id ? (
                <input
                  autoFocus
                  defaultValue={d.testo}
                  onBlur={(e) => {
                    const testo = e.target.value.trim() || d.testo;
                    setDomande((ds) => ds.map((x) => (x.id === d.id ? { ...x, testo } : x)));
                    setModifica(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                  className="flex-1 border-b border-accent bg-transparent outline-none"
                />
              ) : (
                <span className="flex-1">{d.testo}</span>
              )}
              {d.modificabile && modifica !== d.id && (
                <button
                  type="button"
                  onClick={() => setModifica(d.id)}
                  className="text-xs font-medium text-accent underline"
                >
                  cambia
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Bottone onClick={avvia}>Avvia il test</Bottone>
        <Bottone href="/" secondario>
          Non sono io
        </Bottone>
      </div>
      <p className="text-xs text-muted">
        Usiamo solo dati pubblici della tua attività. Un test gratuito per attività ogni 30 giorni.
      </p>
    </div>
  );
}
