import type { Metadata } from "next";
import { Bottone, Pagina, Titolo } from "@/components/ui";

export const metadata: Metadata = { title: "Per le agenzie" };

export default function Agenzie() {
  return (
    <Pagina>
      <Titolo>Vendi la visibilità AI con il tuo logo</Titolo>
      <p className="mt-3 text-muted">
        Per web agency e freelance: report GEO (ottimizzazione per i motori generativi) per i tuoi
        clienti locali, pronti da inviare, con il tuo marchio al posto del nostro.
      </p>
      <ul className="mt-6 space-y-2 text-[15px]">
        <li>✓ Elenco attività con punteggio e variazione mensile</li>
        <li>✓ PDF in white-label, due pagine, con il tuo logo</li>
        <li>✓ Un link cliente per ogni attività</li>
        <li>✓ Export CSV</li>
        <li>✓ 79 € al mese + IVA per 10 attività; +6 € per ognuna in più</li>
      </ul>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Bottone href="mailto:ciao@example.com?subject=Piano%20Agenzia">Scrivici</Bottone>
        <Bottone href="/report/esempio" secondario>
          Guarda un report
        </Bottone>
      </div>
    </Pagina>
  );
}
