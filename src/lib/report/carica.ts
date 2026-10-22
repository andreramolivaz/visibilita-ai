import type { Report } from "../types";
import { REPORT_ESEMPIO, REPORT_SINGOLO } from "../mock-report";
import { deposito } from "../scansione/deposito";

/**
 * Il report da mostrare: quello prodotto dalla scansione, se c'è; altrimenti
 * gli esempi («esempio» = piano Base, «singolo» = report singolo; «gratuito»
 * resta come alias per i link vecchi) e, per le scansioni dimostrative, il
 * report singolo di esempio con l'identificativo richiesto.
 */
export async function caricaReport(id: string): Promise<Report | null> {
  if (id === "esempio") return REPORT_ESEMPIO;
  if (id === "singolo" || id === "gratuito") return REPORT_SINGOLO;
  if (id.startsWith("scan-")) {
    const vero = await deposito().leggiReport(id);
    if (vero) return vero;
    return { ...REPORT_SINGOLO, id };
  }
  return null;
}
