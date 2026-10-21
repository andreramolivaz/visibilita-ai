import { profiliPerNumerosita, type FamigliaProfilo } from "@/lib/profiles";

/** «532 mila», «1.282». */
const migliaia = (n: number) => (n >= 10000 ? `${Math.round(n / 1000)} mila` : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."));

const FAMIGLIE: { id: FamigliaProfilo; nome: string }[] = [
  { id: "locale", nome: "Attività locali e artigiani" },
  { id: "b2b", nome: "Aziende e B2B" },
  { id: "professionista", nome: "Professionisti" },
  { id: "sanita", nome: "Sanità" },
  { id: "ricettivo", nome: "Ricettivo" },
  { id: "cultura", nome: "Cultura" },
];

/**
 * Le 36 categorie, per famiglia e in ordine di numerosità, su tre colonne.
 * Ogni voce porta le imprese attive in Italia: è il motivo per cui esiste un profilo.
 */
export function Categorie() {
  const tutti = profiliPerNumerosita();
  return (
    <div className="columns-1 gap-12 sm:columns-2 lg:columns-3">
      {FAMIGLIE.map((f) => {
        const voci = tutti.filter((p) => p.famiglia === f.id);
        if (voci.length === 0) return null;
        return (
          <div key={f.id} className="mb-6 break-inside-avoid-column">
            <h3 className="text-[13px] font-semibold text-faint">{f.nome}</h3>
            <ul className="mt-1.5 divide-y divide-line border-t border-line">
              {voci.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3 py-1.5 text-[14.5px]">
                  <span>{p.nome}</span>
                  <span className="tabular shrink-0 text-[13px] text-faint">{migliaia(p.imprese)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
