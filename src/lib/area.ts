import type { Report, TipoDomanda } from "./types";
import { TIPI_DOMANDA } from "./types";
import type { DatiArea } from "@/components/area/AreaPersonale";

const NOME_FAMIGLIA: Record<TipoDomanda, string> = {
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
  nome: "Sul nome",
  inglese: "In inglese",
};

/** Le famiglie del set di un report, con quante domande ciascuna. */
export function famiglieDi(r: Report): { nome: string; domande: number }[] {
  return TIPI_DOMANDA.map((tipo) => ({ nome: NOME_FAMIGLIA[tipo], domande: r.perTipo.find((t) => t.tipo === tipo)?.domande ?? 0 })).filter((f) => f.domande > 0);
}

/**
 * L'area personale dai report veri di un'email: l'ultimo report dà attività,
 * famiglie e concorrenti; lo storico sono tutti i report, dal più vecchio.
 */
export function datiAreaDaReport(email: string, report: Report[]): DatiArea | null {
  if (report.length === 0) return null;
  const ordinati = [...report].sort((a, b) => (a.data < b.data ? -1 : 1));
  const ultimo = ordinati[ordinati.length - 1];
  return {
    email,
    attivita: ultimo.attivita,
    pianoId: "base",
    periodo: "mensile",
    statoAbbonamento: "nessuno",
    scansioniExtra: 0,
    storico: ordinati.map((r) => ({ id: r.id, data: r.data, punteggio: r.punteggio, href: `/report/${r.id}`, domande: r.domande, motori: r.motori.length, ripetizioni: r.ripetizioni })),
    famiglie: famiglieDi(ultimo),
    concorrentiSeguiti: ultimo.concorrenti.filter((c) => !c.seiTu).slice(0, 5).map((c) => c.nome),
  };
}
