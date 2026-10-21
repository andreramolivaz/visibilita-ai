import type { Report } from "../types";
import { REPORT_ESEMPIO, REPORT_GRATUITO } from "../mock-report";
import { deposito } from "../scansione/deposito";

/**
 * Il report da mostrare: quello prodotto dalla scansione, se c'è; altrimenti
 * gli esempi («esempio», «gratuito») e, per le scansioni dimostrative, il
 * report gratuito di esempio con l'identificativo richiesto.
 */
export async function caricaReport(id: string): Promise<Report | null> {
  if (id === "esempio") return REPORT_ESEMPIO;
  if (id === "gratuito") return REPORT_GRATUITO;
  if (id.startsWith("scan-")) {
    const vero = await deposito().leggiReport(id);
    if (vero) return vero;
    return { ...REPORT_GRATUITO, id };
  }
  return null;
}
