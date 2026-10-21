"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motoriAttivi } from "@/lib/engines";
import { DOMANDE_ESEMPIO } from "@/lib/mock-report";
import type { Domanda, TipoDomanda } from "@/lib/types";

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

/**
 * Avanzamento in diretta: "Chiedo a ChatGPT: miglior pizzeria a Bergamo… 3 di 30".
 * Mai uno spinner muto.
 *
 * TODO: sostituire la simulazione con lo stato reale della coda
 * (polling o SSE su /api/scansioni/[id]).
 */
export function Scansione() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const domande = useMemo<Domanda[]>(() => {
    if (typeof window === "undefined") return DOMANDE_ESEMPIO.slice(0, 8);
    try {
      const salvato = sessionStorage.getItem(id);
      if (salvato) return JSON.parse(salvato).domande as Domanda[];
    } catch {
      /* niente */
    }
    return DOMANDE_ESEMPIO.slice(0, 8);
  }, [id]);

  const motori = motoriAttivi("mvp");
  const passi = useMemo(() => {
    const out: { motore: string; domanda: string }[] = [];
    for (const m of motori) {
      for (const d of domande) {
        for (let r = 0; r < RIPETIZIONI_GRATIS; r++) out.push({ motore: m.nome, domanda: etichetta(d) });
      }
    }
    return out;
  }, [motori, domande]);

  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= passi.length) {
      const t = setTimeout(() => router.push(`/report/${id || "gratuito"}?nuovo=1`), 700);
      return () => clearTimeout(t);
    }
    // 60–90 s in totale: ~0,8 s a passo con 96 passi.
    const t = setTimeout(() => setI((x) => x + 1), 550 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [i, passi.length, router]);

  const corrente = passi[Math.min(i, passi.length - 1)];
  const pct = Math.round((i / passi.length) * 100);

  return (
    <div className="py-10">
      <p className="text-sm text-muted">Passo 2 di 3</p>
      <h1 className="mt-1 text-3xl font-bold">Sto chiedendo ai motori…</h1>

      <div className="mt-8">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-soft">
          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="tabular mt-2 text-sm text-muted">
          {Math.min(i, passi.length)} di {passi.length} risposte
        </p>
      </div>

      <div className="mt-8 min-h-16" aria-live="polite">
        {i < passi.length ? (
          <p className="text-lg">
            Chiedo a <span className="font-semibold">{corrente.motore}</span>:{" "}
            <span className="text-muted">{corrente.domanda}</span>
          </p>
        ) : (
          <p className="text-lg font-semibold text-accent">Fatto. Preparo il report…</p>
        )}
      </div>

      <p className="mt-10 text-sm text-muted">
        Ogni domanda viene posta {RIPETIZIONI_GRATIS} volte, perché le risposte cambiano. Nel report
        vedrai sempre quante volte su quante compari, mai un sì o un no.
      </p>
    </div>
  );
}
