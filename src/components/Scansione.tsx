"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { engine, motoriAttivi } from "@/lib/engines";
import { DOMANDE_ESEMPIO } from "@/lib/mock-report";
import type { Domanda, TipoDomanda } from "@/lib/types";
import type { Avanzamento } from "@/lib/scansione/tipi";

const TIPO: Record<TipoDomanda, string> = {
  generica: "domanda generica",
  bisogno: "domanda per bisogno",
  specialita: "domanda per specialità",
  requisito: "domanda per requisito",
  confronto: "domanda di confronto",
  nome: "domanda sul tuo nome",
};

/** In scansione si legge solo la domanda scelta dal titolare; le altre per tipo. */
function etichetta(d: Domanda) {
  return d.modificabile ? `«${d.testo}»` : TIPO[d.tipo];
}

const RIPETIZIONI_GRATIS = 2; // come TEST_GRATUITO.ripetizioni

const dataIt = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long" });

/**
 * Avanzamento in diretta: "Chiedo a ChatGPT: domanda per bisogno… 3 di 96".
 * Con i motori configurati segue la coda vera (stato ogni 3 secondi);
 * senza, mostra la dimostrazione e apre il report di esempio.
 */
export function Scansione() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const salvato = useMemo<{ domande: Domanda[]; simulata: boolean }>(() => {
    if (typeof window === "undefined") return { domande: DOMANDE_ESEMPIO.slice(0, 8), simulata: true };
    try {
      const s = sessionStorage.getItem(id);
      if (s) {
        const dati = JSON.parse(s) as { domande?: Domanda[]; simulata?: boolean };
        return { domande: dati.domande ?? DOMANDE_ESEMPIO.slice(0, 8), simulata: dati.simulata !== false };
      }
    } catch {
      /* niente */
    }
    return { domande: DOMANDE_ESEMPIO.slice(0, 8), simulata: true };
  }, [id]);

  const motori = motoriAttivi("mvp");
  const passi = useMemo(() => {
    const out: { motore: string; domanda: string }[] = [];
    for (const m of motori) {
      for (const d of salvato.domande) {
        for (let r = 0; r < RIPETIZIONI_GRATIS; r++) out.push({ motore: m.nome, domanda: etichetta(d) });
      }
    }
    return out;
  }, [motori, salvato.domande]);

  const [i, setI] = useState(0);
  const [stato, setStato] = useState<Avanzamento | null>(null);
  const [errore, setErrore] = useState("");

  // Dimostrazione: un passo ogni 180 ms, poi il report di esempio.
  useEffect(() => {
    if (!salvato.simulata) return;
    if (i >= passi.length) {
      const t = setTimeout(() => router.push(`/report/${id}?nuovo=1`), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((x) => x + 1), 180);
    return () => clearTimeout(t);
  }, [i, passi.length, router, id, salvato.simulata]);

  // Scansione vera: stato dalla coda.
  useEffect(() => {
    if (salvato.simulata || !id) return;
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
  }, [id, router, salvato.simulata]);

  const vera = !salvato.simulata;
  const totale = vera ? (stato?.totale ?? 0) : passi.length;
  const fatte = vera ? (stato?.fatte ?? 0) : Math.min(i, passi.length);
  const pct = totale ? Math.round((fatte / totale) * 100) : 0;
  const corrente = vera
    ? stato?.corrente
      ? { motore: engine(stato.corrente.motore).nome, domanda: etichetta(salvato.domande.find((d) => d.id === stato.corrente!.domandaId) ?? salvato.domande[0]) }
      : null
    : passi[i] ?? null;
  const finita = vera ? stato?.stato === "completata" : i >= passi.length;
  const inAttesa = vera && stato?.stato === "in attesa";

  return (
    <div>
      <p className="text-sm text-muted">Passo 2 di 3</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Sto chiedendo agli assistenti…</h1>
      <p className="mt-2 text-muted">
        {vera ? "Ogni domanda a ogni assistente, con la tua città impostata. Ci vogliono alcuni minuti: puoi restare qui." : "Dimostrazione: con i motori collegati vedrai qui le domande vere, una per una."}
      </p>

      <div className="mt-8">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-soft">
          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="tabular mt-2 text-sm text-muted">
          {fatte} di {totale} risposte
        </p>
      </div>

      <div className="mt-8 min-h-16" aria-live="polite">
        {errore ? (
          <p className="text-danger">{errore}</p>
        ) : finita ? (
          <p className="text-lg font-semibold text-accent">Fatto. Preparo il report…</p>
        ) : inAttesa ? (
          <p className="text-lg">
            Prima giornata completata. La prossima ripetizione è il <span className="font-semibold">{stato?.prossimaIl ? dataIt(stato.prossimaIl) : "giorno successivo"}</span>: il report arriva alla fine.
          </p>
        ) : corrente ? (
          <p className="text-lg">
            Chiedo a <span className="font-semibold">{corrente.motore}</span>: <span className="text-muted">{corrente.domanda}</span>
          </p>
        ) : (
          <p className="text-lg text-muted">Preparo le domande…</p>
        )}
      </div>

      <p className="mt-10 text-sm text-muted">
        Ogni domanda viene posta {RIPETIZIONI_GRATIS} volte, perché le risposte cambiano. Nel report vedrai sempre quante volte su quante compari, mai un sì o un no.
      </p>
    </div>
  );
}
