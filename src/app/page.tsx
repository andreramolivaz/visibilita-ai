import Link from "next/link";
import { CercaAttivita } from "@/components/CercaAttivita";
import { ChatSimulata } from "@/components/landing/ChatSimulata";
import { AnteprimaReport } from "@/components/landing/AnteprimaReport";
import { Passi } from "@/components/landing/Passi";
import { Impatto } from "@/components/landing/Impatto";
import { Bottone } from "@/components/ui";
import { PIANI, REPORT_SINGOLO, euro } from "@/lib/prezzi";

export default function Landing() {
  const base = PIANI[0];
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-14 sm:px-6 sm:pt-20 sm:pb-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0 max-w-xl">
              <h1 className="display">Quando un cliente chiede a ChatGPT, fa il tuo nome?</h1>
              <p className="mt-5 max-w-lg text-lg text-muted sm:text-xl">
                Scopri se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok consigliano te o i tuoi concorrenti, chi ti passa davanti e le tre cose da sistemare.
              </p>
              <div className="mt-8">
                <CercaAttivita grande id="test" />
              </div>
              <p className="mt-3 text-sm text-muted">
                Report singolo a {euro(REPORT_SINGOLO.prezzo)}, in pochi minuti. Ristoranti e studi medici come carpenterie e logistica: le domande cambiano con il mestiere.
              </p>
            </div>
            <div className="flex min-w-0 justify-center pt-4 lg:justify-end">
              <ChatSimulata />
            </div>
          </div>
        </div>
      </section>

      {/* Impatto */}
      <section className="border-t border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Impatto />
        </div>
      </section>

      {/* Come funziona */}
      <section id="come-funziona">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Come funziona</h2>
            <p className="mt-3 text-lg text-muted">Un minuto per te, qualche minuto per noi. Niente da configurare.</p>
          </div>
          <div className="mt-10">
            <Passi />
          </div>
        </div>
      </section>

      {/* Il report */}
      <section className="border-t border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Il report: dove sei, chi ti passa davanti, cosa fare</h2>
            <p className="text-lg text-muted">
              Sei assistenti, decine di domande per famiglia e per zoom, ogni domanda ripetuta, ogni numero con il suo campione. Questo è un report vero, con i nomi
              cambiati.{" "}
              <Link href="/report/esempio" className="font-semibold text-accent underline underline-offset-2">
                Aprilo per intero
              </Link>
              .
            </p>
          </div>
          <div className="mt-10">
            <AnteprimaReport />
          </div>
        </div>
      </section>

      {/* Prezzo */}
      <section id="prezzi" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Un report quando vuoi, o ogni mese.</h2>
              <p className="mt-4 text-lg text-muted">
                Il {REPORT_SINGOLO.nome.toLowerCase()} costa {euro(REPORT_SINGOLO.prezzo)} una tantum. Con l&apos;abbonamento, da {euro(base.mensile)} al mese, il report arriva ogni mese
                con l&apos;andamento e le azioni verificate. Prezzi IVA esclusa.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Bottone href="/#test">Avvia il report</Bottone>
                <Bottone href="/prezzi" secondario>
                  Tutti i piani
                </Bottone>
              </div>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {[
                [REPORT_SINGOLO.nome, `${euro(REPORT_SINGOLO.prezzo)} una tantum`, "Il set completo di domande, sei assistenti, PDF."],
                ...PIANI.map((p) => [p.nome, `${euro(p.mensile)} al mese`, p.perChi]),
              ].map(([nome, prezzo, testo]) => (
                <li key={nome} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <div>
                    <p className="font-semibold">{nome}</p>
                    <p className="tabular text-sm text-muted">{prezzo}</p>
                  </div>
                  <p className="text-[15px] text-muted">{testo}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Invito finale */}
      <section className="border-t border-line bg-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Scopri se fanno il tuo nome.</h2>
            <p className="mt-3 text-lg text-muted">Scrivi il nome della tua attività e la città. Il resto lo facciamo noi.</p>
            <div className="mt-7 text-left">
              <CercaAttivita />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
