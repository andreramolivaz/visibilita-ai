import Link from "next/link";
import { Bottone, Etichetta, Scheda, Titolo } from "@/components/ui";
import { Portale } from "@/components/Portale";
import { RichiediScansione } from "./RichiediScansione";
import { Andamento } from "@/components/report/Andamento";
import { piano as pianoDi, euro, prezzo, type PianoId, type Periodo } from "@/lib/prezzi";
import type { Report, Verdetto } from "@/lib/types";
import { verdetto as verdettoDi } from "@/lib/score";

export interface VoceStorico {
  id: string;
  data: string;
  punteggio: number;
  href: string;
  /** Com'era fatta la scansione. */
  domande?: number;
  motori?: number;
  ripetizioni?: number;
}

export interface DatiArea {
  email: string;
  demo?: boolean;
  attivita: Report["attivita"];
  pianoId: PianoId;
  periodo: Periodo;
  statoAbbonamento: "attivo" | "disdetto" | "nessuno";
  rinnovoIl?: string;
  prossimaScansione?: string;
  scansioniExtra: number;
  storico: VoceStorico[];
  /** Le famiglie del set di domande, con quante domande ciascuna: il testo resta nel metodo. */
  famiglie: { nome: string; domande: number }[];
  concorrentiSeguiti: string[];
}

const dataIt = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
const MESE = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("it-IT", { month: "short" }).replace(".", "");

function tonoVerdetto(v: Verdetto) {
  if (v === "Invisibile") return "errore" as const;
  if (v === "Poco visibile") return "attenzione" as const;
  return "accento" as const;
}

export function AreaPersonale({ dati, esci = true }: { dati: DatiArea; esci?: boolean }) {
  const p = pianoDi(dati.pianoId);
  const ultimo = dati.storico[dati.storico.length - 1];
  const prec = dati.storico[dati.storico.length - 2];
  const delta = ultimo && prec ? ultimo.punteggio - prec.punteggio : null;
  const andamento = dati.storico.map((v) => ({ mese: MESE(v.data), punteggio: v.punteggio }));

  return (
    <>
      {dati.demo && (
        <p className="mb-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Questa è l&apos;area personale di esempio, con i dati della pizzeria di prova. Con un abbonamento attivo vedi qui le tue attività e i tuoi report.
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{dati.email}</p>
          <Titolo>La tua area</Titolo>
        </div>
        {esci && (
          <form action="/esci" method="post">
            <button type="submit" className="text-sm text-muted underline underline-offset-2 hover:text-ink">
              Esci
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Attività e ultimo report */}
          <Scheda className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{dati.attivita.categoriaGoogle}</p>
                <h2 className="text-2xl font-bold">
                  {dati.attivita.nome}, {dati.attivita.citta}
                </h2>
                <p className="mt-1 text-sm text-muted">{dati.attivita.indirizzo}</p>
              </div>
              {ultimo && (
                <div className="text-right">
                  <p className="text-sm text-muted">Ultimo punteggio</p>
                  <p className="tabular text-4xl font-bold leading-none">{ultimo.punteggio}</p>
                  <p className="mt-1">
                    <Etichetta tono={tonoVerdetto(verdettoDi(ultimo.punteggio))}>{verdettoDi(ultimo.punteggio)}</Etichetta>
                    {delta !== null && (
                      <span className={`tabular ml-2 text-sm ${delta >= 0 ? "text-accent" : "text-danger"}`}>
                        {delta >= 0 ? "+" : ""}
                        {delta} sul mese prima
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
            {andamento.length >= 3 && <Andamento punti={andamento} />}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {ultimo && (
                <Bottone href={ultimo.href} className="w-full sm:w-full">
                  Apri l&apos;ultimo report
                </Bottone>
              )}
              <RichiediScansione attivitaId={dati.attivita.id} disponibili={dati.scansioniExtra} />
            </div>
            {dati.prossimaScansione && <p className="mt-3 text-xs text-muted">Prossima scansione programmata: {dataIt(dati.prossimaScansione)}. Il report arriva via email.</p>}
          </Scheda>

          {/* Storico */}
          <section>
            <h2 className="text-lg font-semibold">Tutti i report</h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {[...dati.storico].reverse().map((v, i, arr) => {
                const prima = arr[i + 1];
                const d = prima ? v.punteggio - prima.punteggio : null;
                return (
                  <li key={v.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <Link href={v.href} className="font-medium hover:underline">
                        Report del {dataIt(v.data)}
                      </Link>
                      <p className="tabular text-sm text-muted">
                        {v.domande ?? p.domande} domande · {v.motori ?? 6} assistenti · {v.ripetizioni ?? p.ripetizioni} ripetizioni
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {d !== null && (
                        <span className={`tabular text-sm ${d >= 0 ? "text-accent" : "text-danger"}`}>
                          {d >= 0 ? "+" : ""}
                          {d}
                        </span>
                      )}
                      <span className="tabular w-10 text-right text-2xl font-bold">{v.punteggio}</span>
                      <Link href={`${v.href.split("?")[0]}/pdf`} className="hidden text-sm text-muted underline underline-offset-2 hover:text-ink sm:inline" target="_blank">
                        PDF
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Domande e concorrenti */}
          <div className="grid gap-6 md:grid-cols-2">
            <Scheda>
              <h2 className="font-semibold">Le tue domande</h2>
              <p className="mt-1 text-sm text-muted">Restano le stesse da un report all&apos;altro, così vedi se sali davvero. Le trovi tutte nel report.</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {dati.famiglie.map((f) => (
                  <li key={f.nome} className="flex items-baseline justify-between gap-3">
                    <span>{f.nome}</span>
                    <span className="tabular text-muted">{f.domande}</span>
                  </li>
                ))}
              </ul>
            </Scheda>
            <Scheda>
              <h2 className="font-semibold">Concorrenti seguiti</h2>
              <p className="mt-1 text-sm text-muted">{dati.pianoId === "base" ? "Nel piano Pro segui fino a 5 concorrenti e ricevi un avviso quando ne entra uno nuovo." : "Ricevi un avviso quando un nome nuovo entra tra i più citati."}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {dati.concorrentiSeguiti.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Scheda>
          </div>
        </div>

        <aside className="space-y-6">
          <Scheda>
            <h2 className="font-semibold">Abbonamento</h2>
            {dati.statoAbbonamento === "nessuno" ? (
              <>
                <p className="mt-2 text-sm text-muted">Nessun abbonamento collegato a questa email.</p>
                <div className="mt-4">
                  <Bottone href="/prezzi" className="w-full sm:w-full">
                    Scegli un piano
                  </Bottone>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-[15px]">
                  Piano <span className="font-medium">{p.nome}</span>, {dati.periodo}: <span className="tabular">{euro(prezzo(p, dati.periodo))}</span> + IVA.
                </p>
                <p className="mt-1 text-sm text-muted">
                  {dati.statoAbbonamento === "disdetto" ? "Disdetto." : dati.rinnovoIl ? `Si rinnova il ${dataIt(dati.rinnovoIl)}.` : "Attivo."}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted">
                  {p.include.slice(0, 4).map((i) => (
                    <li key={i}>✓ {i}</li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2">
                  {dati.demo ? (
                    <Bottone href="/prezzi" secondario className="w-full sm:w-full">
                      Fatture, carta e disdetta
                    </Bottone>
                  ) : (
                    <Portale />
                  )}
                  {dati.pianoId === "base" && (
                    <Link href="/prezzi#pro" className="block text-center text-sm font-semibold text-accent underline underline-offset-2">
                      Passa a Pro: un report ogni due settimane e i concorrenti seguiti
                    </Link>
                  )}
                </div>
              </>
            )}
          </Scheda>
          <Scheda>
            <h2 className="font-semibold">Dati dell&apos;attività</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Specialità", dati.attivita.specialita.join(", ")],
                ["Orari", dati.attivita.orari],
                ["Telefono", dati.attivita.telefono],
                ["Sito", dati.attivita.sito?.replace(/^https?:\/\//, "")],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            <p className="mt-3 text-xs text-muted">Il profilo si rifà ogni tre mesi, o quando lo chiedi.</p>
          </Scheda>
          <p className="text-xs text-muted">
            Come funziona:{" "}
            <Link href="/come-funziona" className="underline underline-offset-2">
              in breve
            </Link>{" "}
            o, con tutti i dettagli,{" "}
            <a href="/white-paper-visibilita-ai.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              nel white paper
            </a>
            .
          </p>
        </aside>
      </div>
    </>
  );
}
