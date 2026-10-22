import { REPORT_ESEMPIO } from "./mock-report";
import type { DatiArea } from "@/components/area/AreaPersonale";
import { famiglieDi } from "./area";

/** Area personale di esempio: sei mesi di report della pizzeria di prova. */
export function datiAreaEsempio(email: string, demo = false): DatiArea {
  const mesi = ["2026-05-20", "2026-06-20", "2026-07-20", "2026-08-20", "2026-09-20", "2026-10-20"];
  const andamento = REPORT_ESEMPIO.andamento ?? [];
  return {
    email,
    demo,
    attivita: REPORT_ESEMPIO.attivita,
    pianoId: "base",
    periodo: "mensile",
    statoAbbonamento: "attivo",
    rinnovoIl: "2026-11-20",
    prossimaScansione: "2026-11-20",
    scansioniExtra: 1,
    storico: mesi.map((data, i) => ({
      id: i === mesi.length - 1 ? "esempio" : `esempio-${data.slice(0, 7)}`,
      data,
      punteggio: andamento[i]?.punteggio ?? REPORT_ESEMPIO.punteggio,
      href: "/report/esempio?abbonato=1",
      domande: REPORT_ESEMPIO.domande,
      motori: REPORT_ESEMPIO.motori.length,
      ripetizioni: REPORT_ESEMPIO.ripetizioni,
    })),
    famiglie: famiglieDi(REPORT_ESEMPIO),
    concorrentiSeguiti: REPORT_ESEMPIO.concorrenti.filter((c) => !c.seiTu).map((c) => c.nome),
  };
}
