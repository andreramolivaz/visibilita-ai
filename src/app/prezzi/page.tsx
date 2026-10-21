import type { Metadata } from "next";
import { Pagina, Titolo } from "@/components/ui";
import { Prezzi } from "@/components/Prezzi";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Prezzi" };

const CONFRONTO = [
  ["Otterly", "da 29 $ al mese", "in inglese, per chi fa SEO"],
  ["BrightLocal", "da 31 $ al mese", "suite per agenzie, decine di metriche"],
  ["SEOZoom", "da 56 € al mese", "suite SEO completa, non per il titolare"],
];

export default function PaginaPrezzi() {
  return (
    <Pagina larga>
      <div className="max-w-2xl">
        <Titolo>Un prezzo per attività, non per metrica</Titolo>
        <p className="mt-4 text-lg text-muted">
          Ogni mese: quanto sei visibile, chi citano al posto tuo, tre azioni. Niente da configurare,
          niente da imparare.
        </p>
      </div>
      <div className="mt-10">
        <Prezzi pagamentiAttivi={config.stripe} />
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="text-xl font-semibold">Perché non una suite SEO</h2>
        <p className="mt-2 text-muted">
          Gli strumenti esistenti parlano a chi fa SEO di mestiere. Noi parliamo al titolare, in
          italiano, con un report che si legge in due minuti sul telefono.
        </p>
        <ul className="mt-4 divide-y divide-line border-y border-line text-[15px]">
          {CONFRONTO.map(([nome, prezzo, nota]) => (
            <li key={nome} className="grid grid-cols-[1fr_auto] gap-x-4 py-3 sm:grid-cols-[160px_160px_1fr]">
              <span className="font-medium">{nome}</span>
              <span className="tabular text-muted">{prezzo}</span>
              <span className="col-span-2 text-sm text-muted sm:col-span-1">{nota}</span>
            </li>
          ))}
        </ul>
      </section>
    </Pagina>
  );
}
