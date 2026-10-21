"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Domanda, ProfiloAttivita, TipoDomanda } from "@/lib/types";
import { Bottone, Etichetta, Scheda } from "@/components/ui";

const MOTORI = 3;
const RIPETIZIONI = 2;

/** Nella conferma mostriamo il tipo di domanda, non il testo: il testo è nel report. */
const TIPO: Record<TipoDomanda, { titolo: string; descrizione: (a: ProfiloAttivita, n: number) => string }> = {
  generica: {
    titolo: "Domanda generica",
    descrizione: (a, n) =>
      n === 0 ? `chi è il migliore nella tua categoria a ${a.citta}` : `chi consigliano in ${a.zona ?? "zona"}`,
  },
  bisogno: {
    titolo: "Domanda per bisogno",
    descrizione: () => "un'esigenza concreta: orario, prezzo, servizio",
  },
  specialita: {
    titolo: "Domanda per specialità",
    descrizione: (a) => `su ${a.specialita[1] ?? a.specialita[0] ?? "quello che fai meglio"}`,
  },
  nome: {
    titolo: "Domanda sul tuo nome",
    descrizione: () => "cosa dice l'AI di te, e se i dati sono giusti",
  },
};

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
      JSON.stringify({ attivita, domande }),
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
          Quelle che un cliente farebbe davvero, generate per la tua categoria e la tua zona. Il testo
          esatto lo vedi nel report. Una la scegli tu.
        </p>
        <ol className="mt-3 space-y-2">
          {domande.map((d, i) => (
            <li key={d.id} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="tabular mt-0.5 text-muted">{d.id.slice(1)}.</span>
              {!d.modificabile ? (
                <span className="flex-1">
                  <span className="font-medium">{TIPO[d.tipo].titolo}</span>
                  <span className="text-muted"> · {TIPO[d.tipo].descrizione(attivita, domande.slice(0, i).filter((x) => x.tipo === d.tipo).length)}</span>
                </span>
              ) : modifica === d.id ? (
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
                <span className="flex-1">
                  <span className="block text-xs text-muted">La tua domanda</span>
                  {d.testo}
                </span>
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

      <Scheda className="bg-soft">
        <h2 className="font-semibold">Cosa misuriamo</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
          {[
            [`${domande.length * MOTORI * RIPETIZIONI}`, "risposte raccolte"],
            [`${MOTORI}`, "motori, con la tua città"],
            [`${RIPETIZIONI}×`, "ogni domanda, perché le risposte cambiano"],
            ["1º–5º", "la posizione in cui compari"],
          ].map(([n, t]) => (
            <div key={t}>
              <dt className="tabular text-2xl font-bold tracking-tight">{n}</dt>
              <dd className="text-muted">{t}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-muted">
          Più i concorrenti citati al posto tuo, le fonti da cui l&apos;AI prende le informazioni e
          gli errori nei dati su di te. A mano sono 45 minuti di copia-incolla, e domani è già
          diverso.
        </p>
      </Scheda>

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
