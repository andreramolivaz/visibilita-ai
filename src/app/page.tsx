import Link from "next/link";
import { CercaAttivita } from "@/components/CercaAttivita";
import { ChatSimulata } from "@/components/landing/ChatSimulata";
import { Apertura } from "@/components/landing/Apertura";
import { AnteprimaReport } from "@/components/landing/AnteprimaReport";
import { Impatto } from "@/components/landing/Impatto";
import { PIANI, REPORT_SINGOLO, euro } from "@/lib/prezzi";
import { REPORT_SINGOLO as ESEMPIO } from "@/lib/mock-report";
import { punteggioDelPrimo, stimaRichieste } from "@/lib/impatto";

/** La simulazione dell'impatto usa l'attività di esempio: una pizzeria a Bergamo (120.000 abitanti), sei adulti su cento cercano una pizzeria in un mese. */
const ABITANTI_BERGAMO = 120_000;
const IMPATTO_ESEMPIO = {
  oggi: ESEMPIO.punteggio,
  primo: punteggioDelPrimo(ESEMPIO),
  richiesteMese: stimaRichieste(ABITANTI_BERGAMO, 0.06),
  ricavoCliente: 28,
  cosa: "una pizzeria",
  citta: ESEMPIO.attivita.citta,
  abitanti: ABITANTI_BERGAMO,
  quotaCerca: "sei adulti su cento",
};

const PASSI = [
  ["Scrivi il nome della tua attività", "La troviamo su Google. Tu confermi."],
  ["Chiediamo agli assistenti AI", "Le domande che fanno i tuoi clienti, a sei assistenti."],
  ["Leggi il report", "Dove sei, chi ti passa davanti e le tre cose da fare."],
];

/**
 * La home, in cinque blocchi e senza doppioni: la domanda (con la chat),
 * quanto vale, come funziona in tre righe, il report, l'invito con il prezzo.
 * I dettagli stanno nelle pagine Come funziona e Prezzi, e nel white paper.
 */
export default function Landing() {
  const base = PIANI[0];
  return (
    <>
      <Apertura />
      {/* La domanda */}
      <section>
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-14 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0 max-w-xl">
              <h1 className="display">Quando un cliente chiede a ChatGPT, fa il tuo nome?</h1>
              <p className="mt-5 max-w-lg text-lg text-muted sm:text-xl">Scopri se gli assistenti AI consigliano te o i tuoi concorrenti, e cosa fare per comparire.</p>
              <div className="mt-8">
                <CercaAttivita grande id="test" />
              </div>
              <p className="mt-3 text-sm text-muted">Il report arriva in pochi minuti, a {euro(REPORT_SINGOLO.prezzo)}. Per ogni tipo di attività.</p>
            </div>
            <div className="flex min-w-0 justify-center pt-4 lg:justify-end">
              <ChatSimulata />
            </div>
          </div>
        </div>
      </section>

      {/* Quanto vale */}
      <section className="border-t border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Impatto dati={IMPATTO_ESEMPIO} />
        </div>
      </section>

      {/* Come funziona, in tre righe */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold sm:text-4xl">Come funziona</h2>
            <Link href="/come-funziona" className="font-semibold text-accent underline underline-offset-2">
              Scopri di più
            </Link>
          </div>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {PASSI.map(([titolo, testo], i) => (
              <li key={titolo} className="flex gap-4">
                <span className="tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white">{i + 1}</span>
                <span>
                  <span className="block text-lg font-semibold leading-snug">{titolo}</span>
                  <span className="mt-1 block text-[15px] text-muted">{testo}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Il report */}
      <section className="border-t border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Ecco cosa ricevi</h2>
            <p className="mt-3 text-lg text-muted">Dove sei, chi consigliano al posto tuo, cosa fare. Questo è un esempio, fatto come il report che ricevi.</p>
          </div>
          <div className="mt-10">
            <AnteprimaReport />
          </div>
        </div>
      </section>

      {/* Invito, con il prezzo */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Scopri se fanno il tuo nome.</h2>
            <p className="mt-3 text-lg text-muted">Scrivi il nome della tua attività e la città. Il resto lo facciamo noi.</p>
            <div className="mt-7 text-left">
              <CercaAttivita />
            </div>
            <p className="mt-4 text-sm text-muted">
              Report singolo {euro(REPORT_SINGOLO.prezzo)} una tantum, oppure un report ogni mese da {euro(base.mensile)} al mese.{" "}
              <Link href="/prezzi" className="font-semibold text-accent underline underline-offset-2">
                Vedi i prezzi
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
