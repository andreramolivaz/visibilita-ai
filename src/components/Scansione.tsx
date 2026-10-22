"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { engine, motoriAttivi } from "@/lib/engines";
import { DOMANDE_ESEMPIO } from "@/lib/mock-report";
import { REPORT_SINGOLO } from "@/lib/prezzi";
import type { EngineId, TipoDomanda } from "@/lib/types";
import { TIPI_DOMANDA } from "@/lib/types";
import type { Avanzamento, DomandaInScansione } from "@/lib/scansione/tipi";

const FAMIGLIA: Record<TipoDomanda, string> = {
  generica: "Generiche",
  bisogno: "Per bisogno",
  specialita: "Per specialità",
  requisito: "Per requisito",
  prezzo: "Per prezzo",
  occasione: "Per occasione",
  recensioni: "Per recensioni",
  vicino: "Vicino a te",
  informativa: "Informative",
  confronto: "Di confronto",
  nome: "Sul tuo nome",
  inglese: "In inglese",
};

const dataIt = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long" });

/** Una casella: quante risposte su quante, per una famiglia e un assistente. */
interface Casella {
  fatte: number;
  errori: number;
  totale: number;
}

/**
 * La scansione, in diretta: la griglia famiglia di domande × assistente si
 * riempie man mano che le risposte arrivano. È la mappa del report prima
 * che dica dove sei; le singole domande restano il metodo.
 * Con i motori configurati segue la coda (stato ogni 3 s); senza, è una
 * dimostrazione che apre il report di esempio. Al ritorno da Stripe passa
 * la sessione, così la scansione parte anche se il webhook è in ritardo.
 */
export function Scansione() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const sessione = params.get("sessione") ?? "";

  const salvato = useMemo<{ simulata: boolean }>(() => {
    if (typeof window === "undefined") return { simulata: true };
    try {
      const s = sessionStorage.getItem(id);
      if (s) {
        const dati = JSON.parse(s) as { simulata?: boolean };
        return { simulata: dati.simulata !== false };
      }
    } catch {
      /* niente */
    }
    // Senza memoria locale (altro dispositivo, ritorno da Stripe) si chiede al server.
    return { simulata: !sessione && !id.startsWith("scan-") };
  }, [id, sessione]);

  const [stato, setStato] = useState<Avanzamento | null>(null);
  const [errore, setErrore] = useState("");
  const [passo, setPasso] = useState(0);

  /* ---- Dimostrazione: le celle si riempiono una dopo l'altra. ---- */
  const motoriDemo = useMemo(() => motoriAttivi("mvp").map((m) => m.id), []);
  const domandeDemo = useMemo<DomandaInScansione[]>(() => DOMANDE_ESEMPIO.map((d) => ({ id: d.id, tipo: d.tipo })), []);
  const ordineDemo = useMemo(() => {
    const out: { d: string; m: EngineId }[] = [];
    for (let r = 0; r < REPORT_SINGOLO.ripetizioni; r++) for (const d of domandeDemo) for (const m of motoriDemo) out.push({ d: d.id, m });
    return out;
  }, [domandeDemo, motoriDemo]);

  // La dimostrazione è tale solo se il server lo conferma (o se non c'è un server da chiedere).
  const simulata = stato ? stato.simulata : salvato.simulata;

  useEffect(() => {
    if (!simulata || (stato && stato.stato === "in attesa di pagamento")) return;
    if (passo >= ordineDemo.length) {
      const t = setTimeout(() => router.push(`/report/${id}?nuovo=1`), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPasso((x) => x + 1), 40 + Math.random() * 50);
    return () => clearTimeout(t);
  }, [passo, ordineDemo.length, router, id, simulata, stato]);

  /* ---- Stato dalla coda (scansione vera, o dimostrazione in attesa di pagamento). ---- */
  useEffect(() => {
    if (!id || (salvato.simulata && !sessione)) return;
    let fermo = false;
    const leggi = async () => {
      try {
        const r = await fetch(`/api/scansioni/${encodeURIComponent(id)}${sessione ? `?sessione=${encodeURIComponent(sessione)}` : ""}`, { cache: "no-store" });
        if (!r.ok) throw new Error("Scansione non trovata.");
        const a = (await r.json()) as Avanzamento;
        if (fermo) return;
        setStato(a);
        if (a.stato === "completata" && a.reportId) router.push(`/report/${a.reportId}?nuovo=1`);
        else if (a.stato === "completata" && a.simulata) router.push(`/report/${id}?nuovo=1`);
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
  }, [id, router, salvato.simulata, sessione]);

  /* ---- La griglia per famiglia. ---- */
  const domande: DomandaInScansione[] = !simulata && stato ? stato.domande : domandeDemo;
  const motori: EngineId[] = !simulata && stato ? stato.motori : motoriDemo;
  const ripetizioni = !simulata && stato ? stato.ripetizioni : REPORT_SINGOLO.ripetizioni;
  const famiglie = TIPI_DOMANDA.filter((t) => domande.some((d) => d.tipo === t));
  const caselle = useMemo(() => {
    const map = new Map<string, Casella>();
    const somma = (tipo: TipoDomanda, m: EngineId, fatte: number, errori: number, totale: number) => {
      const k = `${tipo}|${m}`;
      const v = map.get(k) ?? { fatte: 0, errori: 0, totale: 0 };
      v.fatte += fatte;
      v.errori += errori;
      v.totale += totale;
      map.set(k, v);
    };
    const tipoDi = new Map(domande.map((d) => [d.id, d.tipo]));
    if (!simulata && stato) {
      for (const c of stato.griglia) somma(tipoDi.get(c.domandaId) ?? "generica", c.motore, c.fatte, c.errori, c.totale);
    } else {
      for (const d of domande) for (const m of motori) somma(d.tipo, m, 0, 0, ripetizioni);
      for (const { d, m } of ordineDemo.slice(0, passo)) somma(tipoDi.get(d) ?? "generica", m, 1, 0, 0);
    }
    return map;
  }, [simulata, stato, domande, motori, ripetizioni, ordineDemo, passo]);

  const totale = !simulata && stato ? stato.totale : ordineDemo.length;
  const fatte = !simulata && stato ? stato.fatte : Math.min(passo, ordineDemo.length);
  const pct = totale ? Math.round((fatte / totale) * 100) : 0;
  const inAttesaPagamento = stato?.stato === "in attesa di pagamento";
  const finita = !inAttesaPagamento && (!simulata && stato ? stato.stato === "completata" : passo >= ordineDemo.length);
  const inAttesa = !simulata && stato?.stato === "in attesa";
  const correnteDemo = ordineDemo[passo];
  const corrente = !simulata && stato ? stato.corrente : correnteDemo ? { motore: correnteDemo.m, domandaId: correnteDemo.d } : undefined;
  const famigliaCorrente = corrente ? domande.find((d) => d.id === corrente.domandaId)?.tipo : undefined;

  return (
    <div>
      <p className="text-sm text-muted">Passo 2 di 3</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{inAttesaPagamento ? "Confermo il pagamento" : "Sto chiedendo agli assistenti"}</h1>
      <p className="mt-2 text-muted">
        {inAttesaPagamento
          ? "Un momento: aspetto la conferma da Stripe, poi la scansione parte da sola."
          : simulata
            ? "Dimostrazione: con gli assistenti collegati vedrai qui le risposte vere arrivare, famiglia per famiglia."
            : "Ogni domanda a ogni assistente, con la tua città impostata. Ci vogliono alcuni minuti: puoi restare qui, o tornare con il link che ti mandiamo via email."}
      </p>

      {/* La griglia per famiglia */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1.5 text-[13px]">
          <thead>
            <tr className="text-faint">
              <th className="w-[30%] pb-1 text-left align-bottom font-normal sm:w-[34%]">Famiglia di domande</th>
              {motori.map((m) => (
                <th key={m} className="pb-1 text-center align-bottom font-normal">
                  <span className="inline-block [writing-mode:vertical-rl] rotate-180 text-[11px] sm:[writing-mode:horizontal-tb] sm:rotate-0 sm:text-[13px]">{engine(m).nome}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {famiglie.map((tipo) => (
              <tr key={tipo}>
                <td className="pr-3 align-middle text-muted">{FAMIGLIA[tipo]}</td>
                {motori.map((m) => {
                  const c = caselle.get(`${tipo}|${m}`);
                  const fatteQui = c ? c.fatte + c.errori : 0;
                  const piena = c ? fatteQui >= c.totale && c.totale > 0 : false;
                  const quota = c && c.totale ? fatteQui / c.totale : 0;
                  const attiva = !finita && !inAttesaPagamento && famigliaCorrente === tipo && corrente?.motore === m;
                  return (
                    <td key={m} className="px-1 text-center align-middle">
                      <span
                        className={`tabular mx-auto flex h-9 w-full max-w-16 items-center justify-center rounded-md text-[11px] font-semibold ${
                          piena ? "cella-accesa bg-accent text-white" : attiva ? "bg-soft ring-2 ring-accent/60" : "bg-soft"
                        }`}
                        style={!piena && quota > 0 ? { background: `color-mix(in oklab, var(--accent) ${Math.round(quota * 70)}%, var(--soft))`, color: quota > 0.5 ? "#fff" : "var(--ink)" } : undefined}
                        aria-label={`${FAMIGLIA[tipo]}, ${engine(m).nome}: ${c ? `${fatteQui} su ${c.totale}` : "in attesa"}`}
                      >
                        {c && fatteQui > 0 ? `${fatteQui}/${c.totale}` : ""}
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
            ) : inAttesaPagamento ? (
              "In attesa della conferma del pagamento"
            ) : finita ? (
              <span className="font-semibold text-accent">Fatto. Preparo il report.</span>
            ) : inAttesa ? (
              <>
                Prima giornata completata. La prossima ripetizione è il <span className="font-semibold text-ink">{stato?.prossimaIl ? dataIt(stato.prossimaIl) : "giorno successivo"}</span>.
              </>
            ) : corrente ? (
              <>
                Chiedo a <span className="font-semibold text-ink">{engine(corrente.motore).nome}</span>
                {famigliaCorrente ? `: domanda ${FAMIGLIA[famigliaCorrente].toLowerCase()}` : ""}
              </>
            ) : (
              "Preparo le domande"
            )}
          </span>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted">
        Ogni domanda viene posta {ripetizioni} volte, perché le risposte cambiano. Nel report vedrai sempre quante volte compari su quante risposte, mai un sì o un no.
        {!simulata ? " Le celle in errore non entrano nei conteggi e sono dichiarate nel metodo." : ""}
      </p>
    </div>
  );
}
