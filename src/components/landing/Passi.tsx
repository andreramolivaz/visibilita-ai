import { ATTIVITA_ESEMPIO, REPORT_ESEMPIO } from "@/lib/mock-report";
import { ScalaPunteggio } from "@/components/report/ScalaPunteggio";
import { Etichetta } from "@/components/ui";

/**
 * Come funziona, in tre passi. Sopra ogni passo c'è un pezzo vero
 * dell'interfaccia, non un'icona: la scheda trovata, le domande che faremo,
 * il punteggio che arriva.
 */

function Riquadro({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[172px] overflow-hidden rounded-xl border border-line bg-bg p-4 text-[13px] leading-snug md:h-[176px]">{children}</div>;
}

function MiniScheda() {
  const a = ATTIVITA_ESEMPIO;
  return (
    <Riquadro>
      <p className="text-[11px] text-faint">Trovata su Google</p>
      <p className="mt-0.5 text-[15px] font-semibold">
        {a.nome}, {a.citta}
      </p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted">
        <dt className="text-faint">Categoria</dt>
        <dd className="text-ink">{a.categoriaGoogle}</dd>
        <dt className="text-faint">Specialità</dt>
        <dd className="text-ink">{a.specialita.slice(0, 2).join(", ")}</dd>
        <dt className="text-faint">Orari</dt>
        <dd className="text-ink">{a.orari}</dd>
      </dl>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {a.portaliPresenti.map((p) => (
          <Etichetta key={p} tono="accento">
            {p}
          </Etichetta>
        ))}
        {a.portaliAssenti.map((p) => (
          <Etichetta key={p} tono="errore">
            {p}: assente
          </Etichetta>
        ))}
      </div>
    </Riquadro>
  );
}

const DOMANDE = [
  ["Pizzeria aperta la domenica a Bergamo", "per bisogno"],
  ["Pizzeria con forno a legna a Bergamo", "per specialità"],
  ["Meglio Da Gino o Fratelli Rossi a Bergamo?", "di confronto"],
];

function MiniDomande() {
  return (
    <Riquadro>
      <p className="text-[11px] text-faint">Domande come le scrive un cliente</p>
      <ul className="mt-1.5 space-y-1.5">
        {DOMANDE.map(([d, t]) => (
          <li key={d} className="flex items-baseline justify-between gap-3">
            <span className="text-[13.5px] font-medium leading-tight">{d}</span>
            <span className="shrink-0 text-[11px] text-faint">{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-line pt-2 text-[12px] text-muted">A sei assistenti AI, ognuna più volte</p>
    </Riquadro>
  );
}

function MiniPunteggio() {
  const r = REPORT_ESEMPIO;
  return (
    <Riquadro>
      <p className="text-[11px] text-faint">Il report</p>
      <div className="mt-0.5 flex items-baseline gap-2.5">
        <span className="tabular text-[40px] font-bold leading-none tracking-tight text-warn">{r.punteggio}</span>
        <span className="text-[15px] font-semibold text-warn">{r.verdetto}</span>
      </div>
      <ScalaPunteggio punteggio={r.punteggio} compatta />
      <p className="mt-2.5 line-clamp-2 text-[12.5px] text-muted">
        Davanti a te: <span className="text-ink">{r.concorrenti[0].nome}</span>. Prima azione: <span className="text-ink">{r.azioni[0].titolo}</span>.
      </p>
    </Riquadro>
  );
}

const PASSI = [
  {
    titolo: "Scrivi il nome della tua attività",
    testo: "La troviamo su Google, con categoria, orari e specialità. Tu confermi con un tocco.",
    figura: <MiniScheda />,
  },
  {
    titolo: "Facciamo le domande dei tuoi clienti",
    testo: "A ChatGPT, Gemini e agli altri assistenti, come le scriverebbe un cliente. Ognuna più volte, perché le risposte cambiano.",
    figura: <MiniDomande />,
  },
  {
    titolo: "Leggi dove sei e cosa fare",
    testo: "Il punteggio, chi consigliano al posto tuo, da dove prendono le informazioni e tre azioni in ordine di impatto.",
    figura: <MiniPunteggio />,
  },
];

export function Passi() {
  return (
    <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
      {PASSI.map((p, i) => (
        <li key={p.titolo}>
          {p.figura}
          <div className="mt-4 flex gap-3">
            <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">{i + 1}</span>
            <div>
              <h3 className="text-[17px] font-semibold leading-snug">{p.titolo}</h3>
              <p className="mt-1.5 text-[15px] text-muted">{p.testo}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
