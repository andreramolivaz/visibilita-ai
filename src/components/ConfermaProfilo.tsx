"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Domanda, OrigineDomanda, ProfiloAttivita, SegnaliProfilo, TipoDomanda } from "@/lib/types";
import { Bottone, Campo, Etichetta, Scheda } from "@/components/ui";
import { TIPI_SPONTANEI } from "@/lib/stats";
import { motoriAttivi } from "@/lib/engines";
import { TEST_GRATUITO } from "@/lib/prezzi";

const MOTORI = motoriAttivi().length;
const RIPETIZIONI = TEST_GRATUITO.ripetizioni;

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
  requisito: {
    titolo: "Domanda per requisito",
    descrizione: (a) => `un vincolo preciso: ${a.servizi[0] ?? "certificazione, convenzione, servizio"}`,
  },
  confronto: {
    titolo: "Domanda di confronto",
    descrizione: () => "tu contro il concorrente più noto vicino a te: chi preferiscono",
  },
  nome: {
    titolo: "Domanda sul tuo nome",
    descrizione: () => "cosa dice l'AI di te, e se i dati sono giusti",
  },
};

/** Da dove viene il contenuto di una domanda, detto al titolare. */
const ORIGINE: Record<OrigineDomanda, (a: ProfiloAttivita) => string> = {
  modello: () => "dal modello della categoria",
  scheda: () => "dalla scheda Google",
  recensioni: () => "dalle tue recensioni",
  sito: () => "dal tuo sito",
  ricerche: (a) => `dalle ricerche a ${a.citta}`,
  titolare: () => "la tua",
};

export function ConfermaProfilo({
  attivita,
  domande: iniziali,
  segnali,
}: {
  attivita: ProfiloAttivita;
  domande: Domanda[];
  segnali: SegnaliProfilo;
}) {
  const router = useRouter();
  const [domande, setDomande] = useState(iniziali);
  const [modifica, setModifica] = useState<string | null>(null);
  const [telefono, setTelefono] = useState("");

  /** La domanda che i clienti fanno al telefono diventa una delle domande del test. */
  function usaTelefono() {
    const testo = telefono.trim();
    if (!testo) return;
    setDomande((ds) => {
      const bersaglio = ds.find((d) => d.origine === "titolare") ?? ds.find((d) => d.modificabile) ?? [...ds].reverse().find((d) => TIPI_SPONTANEI.includes(d.tipo));
      if (!bersaglio) return ds;
      return ds.map((d) => (d.id === bersaglio.id ? { ...d, testo, origine: "titolare", modificabile: true } : d));
    });
  }

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
          I modelli della categoria vengono riempiti con quello che dicono di te i clienti, il tuo sito e le ricerche nella tua città.
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
              <dt className="text-xs text-muted">Confronto diretto con il concorrente più noto vicino a te</dt>
              <dd className="mt-1">
                <span className="font-medium">{segnali.concorrenti[0].nome}</span>
                <span className="tabular text-muted">
                  {segnali.concorrenti[0].recensioni ? ` · ${segnali.concorrenti[0].recensioni.toLocaleString("it-IT")} recensioni` : ""}
                  {segnali.concorrenti[0].rating ? ` · ${segnali.concorrenti[0].rating.toLocaleString("it-IT")}` : ""}
                  {segnali.concorrenti[0].distanzaM ? ` · a ${segnali.concorrenti[0].distanzaM} m` : ""}
                </span>
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

      <div>
        <h2 className="font-semibold">Le {domande.length} domande che faremo</h2>
        <p className="text-sm text-muted">
          Sei tipi, come le domande vere: generiche, per bisogno, per specialità, per requisito, di confronto, sul nome. Il testo esatto lo vedi nel report. Una la scegli tu.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="telefono">
            Cosa ti chiedono più spesso al telefono?
          </label>
          <Campo
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            onBlur={usaTelefono}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                usaTelefono();
              }
            }}
            placeholder="Cosa ti chiedono più spesso al telefono? Diventa una delle domande"
            className="sm:py-2.5 sm:text-[15px]"
          />
        </div>
        <ol className="mt-3 space-y-2">
          {domande.map((d, i) => (
            <li key={d.id} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="tabular mt-0.5 text-muted">{d.id.slice(1)}.</span>
              {!d.modificabile ? (
                <span className="flex-1">
                  <span className="font-medium">{TIPO[d.tipo].titolo}</span>
                  <span className="text-muted"> · {TIPO[d.tipo].descrizione(attivita, domande.slice(0, i).filter((x) => x.tipo === d.tipo).length)}</span>
                  {d.tipo === "confronto" && d.concorrente && <span className="text-muted"> ({d.concorrente})</span>}
                  {d.origine && d.origine !== "modello" && <span className="ml-2 text-xs text-faint">{ORIGINE[d.origine](attivita)}</span>}
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

      <Scheda className="border-0 bg-soft">
        <h2 className="font-semibold">Cosa misuriamo</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
          {[
            [`${domande.length * MOTORI * RIPETIZIONI}`, "risposte raccolte"],
            [`${MOTORI}`, "motori AI, interrogati con la tua città"],
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
