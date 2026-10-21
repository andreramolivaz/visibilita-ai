import { engine } from "@/lib/engines";
import { frequenza } from "@/lib/score";
import type { Report as ReportT, Verdetto } from "@/lib/types";
import { Barra, Etichetta, Scheda, Sezione } from "@/components/ui";
import { Andamento } from "./Andamento";

const dataIt = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function coloreVerdetto(v: Verdetto) {
  switch (v) {
    case "Invisibile":
      return "text-danger";
    case "Poco visibile":
      return "text-warn";
    default:
      return "text-accent";
  }
}

function spiegazioneVerdetto(v: Verdetto) {
  switch (v) {
    case "Invisibile":
      return "Quando un cliente chiede all'AI, tu non ci sei.";
    case "Poco visibile":
      return "Compari ogni tanto, quasi mai per primo.";
    case "Visibile":
      return "Ti consigliano spesso. Si può salire ancora.";
    case "Dominante":
      return "Sei tra i nomi che l'AI fa quasi sempre.";
  }
}

export function Report({ report, abbonato = false }: { report: ReportT; abbonato?: boolean }) {
  const r = report;
  const totaleRisposte = r.domande * r.motori.length * r.ripetizioni;
  const posizioneTesto = (p: number | null) => (p === null ? "—" : `${p}º`);

  return (
    <article>
      {/* 1. Intestazione */}
      <header className="pb-6">
        <p className="text-sm text-muted">Report di visibilità AI · {dataIt(r.data)}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {r.attivita.nome}, {r.attivita.citta}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {r.domande} domande × {r.motori.length} motori × {r.ripetizioni} ripetizioni ={" "}
          <span className="tabular">{totaleRisposte}</span> risposte. Motori:{" "}
          {r.motori.map((m) => engine(m).nome).join(", ")}.
        </p>
      </header>

      {/* 2. Punteggio */}
      <Sezione numero={2} titolo="Punteggio di visibilità AI">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div className={`punteggio ${coloreVerdetto(r.verdetto)}`}>{r.punteggio}</div>
          <div className="pb-1">
            <div className={`text-xl font-semibold ${coloreVerdetto(r.verdetto)}`}>{r.verdetto}</div>
            <div className="text-sm text-muted">{spiegazioneVerdetto(r.verdetto)}</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          Su 100. Percentuale di risposte in cui compari, pesata per posizione (1º posto vale 1, 5º
          vale 0,4) e per quanti italiani usano ogni motore.
        </p>
        {abbonato && r.andamento && <Andamento punti={r.andamento} />}
      </Sezione>

      {/* 3. Per motore */}
      <Sezione numero={3} titolo="Per motore">
        {r.perMotore.map((m) => (
          <Barra
            key={m.motore}
            etichetta={engine(m.motore).nome}
            valore={m.comparse}
            massimo={m.totale}
            testo={`${frequenza(m.comparse, m.totale)} domande`}
            accento
          />
        ))}
        <p className="mt-2 text-sm text-muted">
          Domande in cui compari almeno una volta, su {r.domande}. In ordine di quota d&apos;uso in
          Italia.
        </p>
      </Sezione>

      {/* 4. Concorrenti */}
      <Sezione numero={4} titolo="Chi consigliano al posto tuo">
        {r.concorrenti.map((c) => (
          <Barra
            key={c.nome}
            etichetta={c.nome}
            valore={c.citazioni}
            massimo={r.concorrenti[0]?.totale ?? 1}
            testo={`${c.citazioni} su ${c.totale}`}
            tu={c.seiTu}
          />
        ))}
        <p className="mt-2 text-sm text-muted">
          I 5 nomi più citati nelle {totaleRisposte} risposte.
        </p>
      </Sezione>

      {/* 5. Domanda per domanda */}
      <Sezione numero={5} titolo="Domanda per domanda">
        {/* Telefono: schede */}
        <ul className="space-y-3 sm:hidden">
          {r.righe.map((riga) => (
            <li key={riga.domanda.id}>
              <Scheda>
                <p className="font-medium">{riga.domanda.testo}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  {riga.celle.map((c) => (
                    <div key={c.motore}>
                      <dt className="text-xs text-muted">{engine(c.motore).nome}</dt>
                      <dd className="tabular">
                        {c.posizione === null ? (
                          <span className="text-muted">✕</span>
                        ) : (
                          <span className="font-semibold text-accent">{posizioneTesto(c.posizione)}</span>
                        )}{" "}
                        <span className="text-xs text-muted">{c.frequenza}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Scheda>
            </li>
          ))}
        </ul>
        {/* Schermo largo: tabella */}
        <table className="hidden w-full text-sm sm:table">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="pb-2 font-medium">Domanda</th>
              {r.motori.map((m) => (
                <th key={m} className="pb-2 font-medium">
                  {engine(m).nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.righe.map((riga) => (
              <tr key={riga.domanda.id} className="border-t border-line">
                <td className="py-2 pr-3">{riga.domanda.testo}</td>
                {riga.celle.map((c) => (
                  <td key={c.motore} className="tabular py-2 pr-3">
                    {c.posizione === null ? (
                      <span className="text-muted">✕</span>
                    ) : (
                      <span className="font-semibold text-accent">{posizioneTesto(c.posizione)}</span>
                    )}
                    <span className="ml-1.5 text-xs text-muted">{c.frequenza}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-muted">
          Posizione in cui compari e quante volte su {r.ripetizioni} ripetizioni. ✕ = mai.
        </p>
      </Sezione>

      {/* 6. Fonti */}
      <Sezione numero={6} titolo="Da dove prendono le informazioni">
        <ul className="divide-y divide-line">
          {r.fonti.map((f) => (
            <li key={f.nome} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                {f.nome}
                <span className="tabular ml-2 text-muted">{f.citazioni}</span>
              </span>
              {f.ciSei ? (
                <Etichetta tono="accento">ci sei</Etichetta>
              ) : (
                <Etichetta tono="errore">non ci sei</Etichetta>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">Le 8 fonti più citate dai motori per la tua categoria.</p>
      </Sezione>

      {/* 7. Cosa dicono di te */}
      <Sezione numero={7} titolo="Cosa dicono di te">
        <blockquote className="rounded-xl bg-soft p-4 text-[15px]">{r.descrizioneAI}</blockquote>
        {r.errori.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {r.errori.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Etichetta tono="errore">errore</Etichetta>
                <span>{e.testo}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Nessun errore trovato nei dati che l&apos;AI riporta su di te.</p>
        )}
      </Sezione>

      {/* 8. Tre azioni */}
      <Sezione numero={8} titolo="Tre azioni, in ordine di impatto">
        <ol className="space-y-3">
          {r.azioni.map((a, i) => (
            <li key={i}>
              <Scheda className={a.fatta ? "border-accent bg-accent-soft" : ""}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {a.fatta ? "✓" : i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{a.titolo}</p>
                    <p className="mt-1 text-sm text-muted">{a.dato}</p>
                  </div>
                </div>
              </Scheda>
            </li>
          ))}
        </ol>
      </Sezione>
    </article>
  );
}
