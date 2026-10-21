import type { Metadata } from "next";
import { Pagina } from "@/components/ui";
import { AreaPersonale } from "@/components/area/AreaPersonale";
import { datiAreaEsempio } from "@/lib/mock-area";

export const metadata: Metadata = { title: "Area personale di esempio" };

/** L'area personale com'è per chi ha un abbonamento, visibile senza accesso. */
export default function AreaDemo() {
  return (
    <Pagina larga>
      <AreaPersonale dati={datiAreaEsempio("titolare@pizzeriadagino.example", true)} esci={false} />
    </Pagina>
  );
}
