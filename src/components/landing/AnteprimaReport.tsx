import Link from "next/link";
import { engine } from "@/lib/engines";
import { REPORT_ESEMPIO } from "@/lib/mock-report";
import { Barra } from "@/components/ui";
import { ScalaPunteggio } from "@/components/report/ScalaPunteggio";

/** Il report di esempio, ridotto a quello che conta: punteggio, motori, concorrenti, azioni. */
export function AnteprimaReport() {
  const r = REPORT_ESEMPIO;
  return (
    <div className="grid gap-6 rounded-2xl border border-line p-5 sm:p-8 lg:grid-cols-2 lg:gap-10">
      <div>
        <p className="text-sm text-muted">
          {r.attivita.nome}, {r.attivita.citta} · {r.domande} domande, {r.motori.length} motori,{" "}
          {r.ripetizioni} ripetizioni
        </p>
        <div className="mt-3 flex items-end gap-4">
          <span className="punteggio text-warn">{r.punteggio}</span>
          <span className="pb-1">
            <span className="block text-xl font-semibold text-warn">{r.verdetto}</span>
            <span className="text-sm text-muted">su 100</span>
          </span>
        </div>
        <ScalaPunteggio punteggio={r.punteggio} compatta />

        <div className="mt-6">
          {r.perMotore.map((m) => (
            <Barra
              key={m.motore}
              etichetta={engine(m.motore).nome}
              valore={m.comparse}
              massimo={m.totale}
              testo={`${m.comparse} su ${m.totale}`}
              accento
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Chi consigliano al posto tuo</h3>
        <div className="mt-1">
          {r.concorrenti.slice(0, 4).map((c) => (
            <Barra
              key={c.nome}
              etichetta={c.nome}
              valore={c.citazioni}
              massimo={r.concorrenti[0].totale}
              testo={`${c.citazioni} su ${c.totale}`}
              tu={c.seiTu}
            />
          ))}
        </div>

        <h3 className="mt-6 font-semibold">Le tre azioni</h3>
        <ol className="mt-2 space-y-2">
          {r.azioni.map((a, i) => (
            <li key={a.titolo} className="flex gap-3 text-[15px]">
              <span className="tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>
                <span className="font-medium">{a.titolo}</span>
                <span className="block text-sm text-muted">{a.dato}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm">
          <Link href="/report/esempio" className="font-semibold text-accent underline underline-offset-2">
            Apri il report completo
          </Link>
          <span className="text-muted">, con la tabella domanda per domanda e le fonti.</span>
        </p>
      </div>
    </div>
  );
}
