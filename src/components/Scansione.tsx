"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { engine, motoriAttivi } from "@/lib/engines";
import { DOMANDE_ESEMPIO } from "@/lib/mock-report";
import { TEST_GRATUITO } from "@/lib/prezzi";
import type { Domanda, EngineId, TipoDomanda } from "@/lib/types";
import type { Avanzamento, DomandaInScansione } from "@/lib/scansione/tipi";

const TIPO: Record<TipoDomanda, string> = {
  generica: "Generica",
  bisogno: "Per bisogno",
  specialita: "Per specialità",
  requisito: "Per requisito",
  confronto: "Di confronto",
  nome: "Sul tuo nome",
};

const dataIt = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long" });

/** Una casella: quante risposte su quante, per una domanda e un assistente. */
interface Casella {
  fatte: number;
  errori: number;
  totale: number;
}

/**
 * La scansione, in diretta: la griglia domanda × assistente si riempie man
 * mano che le risposte arrivano. È la stessa mappa del report, prima che
 * dica dove sei. Con i motori configurati segue la coda (stato ogni 3 s);
 * senza, è una dimostrazione che apre il report di esempio.
 */
export function Scansione() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const salvato = useMemo<{ domande: DomandaInScansione[]; simulata: boolean }>(() => {
    const esempio = DOMANDE_ESEMPIO.slice(0, TEST_GRATUITO.domande).map((d) => ({ id: d.id, tipo: d.tipo, testo: d.modificabile ? d.testo : undefined }));
    if (typeof window === "undefined") return { domande: esempio, simulata: true };
    try {
      const s = sessionStorage.getItem(id);
      if (s) {
        const dati = JSON.parse(s) as { domande?: Domanda[]; simulata?: boolean };
        const domande = (dati.domande ?? []).map((d) => ({ id: d.id, tipo: d.tipo, testo: d.modificabile ? d.testo : undefined }));
        return { domande: domande.length ? domande : esempio, simulata: dati.simulata !== false };
      }
    } catch {
      /* niente */
    }
    return { domande: esempio, simulata: true };
  }, [id]);

  const vera = !salvato.simulata;
  const [stato, setStato] = useState<Avanzamento | null>(null);
  const [errore, setErrore] = useState("");

  /* ---- Dimostrazione: le celle si riempiono una dopo l'altra, per domanda, assistenti in parallelo. ---- */
  const motoriDemo = useMemo(() => motoriAttivi("mvp").map((m) => m.id), []);
  const domandeDemo = salvato.domande;
  const ordineDemo = useMemo(() => {
    const out: { d: string; m: EngineId }[] = [];
    for (let r = 0; r < TEST_GRATUITO.ripetizioni; r++) for (const d of domandeDemo) for (const m of motoriDemo) out.push({ d: d.id, m });
    return out;
  }, [domandeDemo, motoriDemo]);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    if (vera) return;
    if (passo >= ordineDemo.length) {
      const t = setTimeout(() => router.push(`/report/${id}?nuovo=1`), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPasso((x) => x + 1), 70 + Math.random() * 90);
    return () => clearTimeout(t);
  }, [passo, ordineDemo.length, router, id, vera]);

  /* ---- Scansione vera: stato dalla coda. ---- */
  useEffect(() => {
    if (!vera || !id) return;
    let fermo = false;
    const leggi = async () => {
      try {
        const r = await fetch(`/api/scansioni/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!r.ok) throw new Error("Scansione non trovata.");
        const a = (await r.json()) as Avanzamento;
        if (fermo) return;
        setStato(a);
        if (a.stato === "completata" && a.reportId) router.push(`/report/${a.reportId}?nuovo=1`);
      } catch (e) {
        if (!fermo) setErrore(e instanceof Error ? e.message : "Errore di rete.");
      }
    };
    leggi();
    const t = setInterval(leggi, 3000);
    return () => {
      fermo = true;
      clearInterval(t);
    };
  }, [id, router, vera]);

  /* ---- La griglia, da una fonte o dall'altra. ---- */
  const domande: DomandaInScansione[] = vera ? (stato?.domande ?? salvato.domande) : domandeDemo;
  const motori: EngineId[] = vera ? (stato?.motori ?? motoriDemo) : motoriDemo;
  const ripetizioni = vera ? (stato?.ripetizioni ?? TEST_GRATUITO.ripetizioni) : TEST_GRATUITO.ripetizioni;
  const caselle = useMemo(() => {
    const map = new Map<string, Casella>();
    if (vera) {
      for (const c of stato?.griglia ?? []) map.set(`${c.domandaId}|${c.motore}`, { fatte: c.fatte, errori: c.errori, totale: c.totale });
    } else {
      for (const { d, m } of ordineDemo.slice(0, passo)) {
        const k = `${d}|${m}`;
        const v = map.get(k) ?? { fatte: 0, errori: 0, totale: ripetizioni };
        v.fatte++;
        map.set(k, v);
      }
    }
    return map;
  }, [vera, stato, ordineDemo, passo, ripetizioni]);

  const totale = vera ? (stato?.totale ?? domande.length * motori.length * ripetizioni) : ordineDemo.length;
  const fatte = vera ? (stato?.fatte ?? 0) : Math.min(passo, ordineDemo.length);
  const pct = totale ? Math.round((fatte / totale) * 100) : 0;
  const finita = vera ? stato?.stato === "completata" : passo >= ordineDemo.length;
  const inAttesa = vera && stato?.stato === "in attesa";
  const correnteDemo = ordineDemo[passo];
  const corrente = vera ? stato?.corrente : correnteDemo ? { motore: correnteDemo.m, domandaId: correnteDemo.d } : undefined;
  const domandaCorrente = corrente ? domande.find((d) => d.id === corrente.domandaId) : undefined;

  return (
    <div>
      <p className="text-sm text-muted">Passo 2 di 3</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Sto chiedendo agli assistenti</h1>
      <p className="mt-2 text-muted">
        {vera
          ? "Ogni domanda a ogni assistente, con la tua città impostata. Ci vogliono alcuni minuti: puoi restare qui o tornare con il link."
          : "Dimostrazione: con gli assistenti collegati vedrai qui le risposte vere arrivare una per una."}
      </p>

      {/* La griglia */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1.5 text-[13px]">
          <thead>
            <tr className="text-faint">
              <th className="w-[30%] pb-1 text-left align-bottom font-normal sm:w-[38%]">Domanda</th>
              {motori.map((m) => (
                <th key={m} className="pb-1 text-center align-bottom font-normal">
                  <span className="inline-block [writing-mode:vertical-rl] rotate-180 text-[11px] sm:[writing-mode:horizontal-tb] sm:rotate-0 sm:text-[13px]">{engine(m).nome}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domande.map((d) => (
              <tr key={d.id}>
                <td className="pr-3 align-middle">
                  {d.testo ? <span className="font-medium text-[14px] text-ink">{d.testo}</span> : <span className="text-muted">{TIPO[d.tipo]}</span>}
                </td>
                {motori.map((m) => {
                  const c = caselle.get(`${d.id}|${m}`);
                  const piena = c ? c.fatte + c.errori >= c.totale : false;
                  const parziale = c ? c.fatte + c.errori > 0 && !piena : false;
                  const attiva = !finita && corrente?.domandaId === d.id && corrente.motore === m;
                  return (
                    <td key={m} className="px-1 text-center align-middle">
                      <span
                        className={`mx-auto flex h-8 w-full max-w-14 items-center justify-center rounded-md text-[11px] font-semibold tabular ${
                          piena ? "cella-accesa bg-accent text-white" : parziale ? "bg-accent/45 text-white" : attiva ? "bg-soft ring-2 ring-accent/60" : "bg-soft"
                        }`}
                        aria-label={`${engine(m).nome}: ${c ? `${c.fatte} su ${c.totale}` : "in attesa"}`}
                      >
                        {c && c.fatte + c.errori > 0 ? `${c.fatte}/${c.totale}` : ""}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <div className="h-2 w-full overflow-hidden rounded-full bg-soft">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4 text-sm">
          <span className="tabular text-muted">
            {fatte} di {totale} risposte
          </span>
          <span className="min-w-0 truncate text-right text-muted" aria-live="polite">
            {errore ? (
              <span className="text-danger">{errore}</span>
            ) : finita ? (
              <span className="font-semibold text-accent">Fatto. Preparo il report.</span>
            ) : inAttesa ? (
              <>
                Prima giornata completata. La prossima ripetizione è il <span className="font-semibold text-ink">{stato?.prossimaIl ? dataIt(stato.prossimaIl) : "giorno successivo"}</span>.
              </>
            ) : corrente ? (
              <>
                Chiedo a <span className="font-semibold text-ink">{engine(corrente.motore).nome}</span>:{" "}
                {domandaCorrente?.testo ? <span className="font-medium text-ink">{domandaCorrente.testo}</span> : (domandaCorrente ? TIPO[domandaCorrente.tipo].toLowerCase() : "")}
              </>
            ) : (
              "Preparo le domande"
            )}
          </span>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted">
        Ogni domanda viene posta {ripetizioni} volte, perché le risposte cambiano. Nel report vedrai sempre quante volte compari su quante risposte, mai un sì o un no.
        {vera ? " Le celle in errore non entrano nei conteggi e sono dichiarate nel metodo." : ""}
      </p>
    </div>
  );
}
