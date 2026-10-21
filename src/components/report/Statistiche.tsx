import type { Report } from "@/lib/types";
import { coerenzaDati, concentrazione, copertura, percentuale, posizioneMedia, stabilita, tassoCitazione } from "@/lib/stats";

/**
 * I numeri chiave del report, ciascuno con il suo campione e una riga su come leggerlo.
 * Tutto deriva dalla mappa domanda × assistente: si può rifare a mano.
 */
export function Statistiche({ report: r }: { report: Report }) {
  const cit = tassoCitazione(r.righe, r.ripetizioni);
  const cop = copertura(r.righe);
  const stab = stabilita(r.righe, r.ripetizioni);
  const pos = posizioneMedia(r.righe);
  const conc = concentrazione(r.concorrenti);
  const coer = coerenzaDati(r.attivita);
  const ic = `${percentuale(cit.ic.basso)}–${percentuale(cit.ic.alto)}`;

  const tiles: { valore: string; nome: string; nota: string; id: string }[] = [
    {
      valore: percentuale(cit.quota),
      nome: "Risposte in cui compari",
      nota: `${cit.k} su ${cit.n}. Intervallo al 95%: ${ic}.`,
      id: "citazione",
    },
    {
      valore: percentuale(cop.quota),
      nome: "Domande in cui compari",
      nota: `${cop.k} su ${cop.n}. Le altre ${cop.n - cop.k} sono vuote per tutti gli assistenti.`,
      id: "copertura",
    },
    {
      valore: pos ? `${pos.toLocaleString("it-IT", { maximumFractionDigits: 1 })}º` : "–",
      nome: "Posizione media quando compari",
      nota: "1º è il primo nome dell'elenco. I clienti leggono i primi due o tre.",
      id: "posizione",
    },
    {
      valore: percentuale(stab.quota),
      nome: "Stabilità delle risposte",
      nota: `${stab.concordi} celle su ${stab.totale} concordano su tutte le ${r.ripetizioni} ripetizioni.`,
      id: "stabilita",
    },
    {
      valore: percentuale(conc.quotaTop3),
      nome: "Concentrazione dei consigli",
      nota: "Quota delle citazioni che va ai tre nomi più citati. Alta: mercato di pochi nomi.",
      id: "concorrenti",
    },
    {
      valore: `${coer.coerenti}/${coer.totale}`,
      nome: "Dati di scheda coerenti",
      nota: coer.coerenti === coer.totale ? "Nome, indirizzo, telefono, orari, categoria e sito coincidono ovunque." : `Incoerenze: ${r.attivita.incoerenze.join(" ")}`,
      id: "dicono",
    },
  ];

  return (
    <section id="statistiche" className="scroll-mt-20 py-7 sm:py-9">
      <h2 className="text-xl font-semibold sm:text-2xl">Numeri chiave</h2>
      <p className="mt-1 max-w-prose text-[15px] text-muted">
        Ogni numero con il suo campione. Il significato di ciascuno è nella{" "}
        <a href="#guida" className="font-semibold text-accent underline underline-offset-2">
          guida alla lettura
        </a>
        .
      </p>
      <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.nome} className="bg-bg p-4 sm:p-5">
            <dt className="text-sm text-muted">{t.nome}</dt>
            <dd className="tabular mt-1 text-3xl font-bold tracking-tight">{t.valore}</dd>
            <dd className="mt-1 text-xs text-muted">{t.nota}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
