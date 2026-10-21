import { GLOSSARIO } from "@/lib/glossario";

/** Guida alla lettura: ogni metrica e ogni visual, cos'è, come si calcola, come si legge. */
export function Guida() {
  return (
    <section id="guida" className="scroll-mt-20 py-7 sm:py-9">
      <h2 className="text-xl font-semibold sm:text-2xl">Guida alla lettura</h2>
      <p className="mt-1 max-w-prose text-[15px] text-muted">
        Cosa misura ogni numero di questo report, come lo calcoliamo e come usarlo. Nessun numero è stimato a occhio: tutto si ricava dalla
        mappa domanda × assistente.
      </p>
      <dl className="mt-5 divide-y divide-line border-y border-line">
        {GLOSSARIO.map((v) => (
          <details key={v.id} id={`guida-${v.id}`} className="group py-3">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              <dt>{v.nome}</dt>
              <span className="mt-1 shrink-0 text-faint transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <dd className="mt-2 grid max-w-3xl gap-2 text-[15px] sm:grid-cols-[110px_1fr] sm:gap-x-4">
              <span className="text-xs font-semibold text-muted sm:pt-1">Cos&apos;è</span>
              <span>{v.cosa}</span>
              <span className="text-xs font-semibold text-muted sm:pt-1">Come si calcola</span>
              <span>{v.come}</span>
              <span className="text-xs font-semibold text-muted sm:pt-1">Come si legge</span>
              <span>{v.lettura}</span>
              {v.nonE && (
                <>
                  <span className="text-xs font-semibold text-muted sm:pt-1">Cosa non è</span>
                  <span>{v.nonE}</span>
                </>
              )}
            </dd>
          </details>
        ))}
      </dl>
    </section>
  );
}
