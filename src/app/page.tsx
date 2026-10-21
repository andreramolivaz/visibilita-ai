import Link from "next/link";
import { Pagina, Titolo } from "@/components/ui";
import { Report } from "@/components/report/Report";
import { REPORT_ESEMPIO } from "@/lib/mock-report";
import { CercaAttivita } from "@/components/CercaAttivita";

export default function Landing() {
  return (
    <>
      <Pagina className="pb-4">
        <Titolo>ChatGPT consiglia te o i tuoi concorrenti?</Titolo>
        <p className="mt-4 text-lg text-muted">
          In 60 secondi sai se ChatGPT, Gemini e Google AI ti consigliano, chi ti passa davanti e le
          tre cose da sistemare. Gratis, senza registrazione.
        </p>
        <div className="mt-6">
          <CercaAttivita />
        </div>
        <ul className="mt-6 grid gap-2 text-sm text-muted sm:grid-cols-3">
          <li>✓ Un punteggio, non 40 metriche</li>
          <li>✓ Chi citano al posto tuo</li>
          <li>✓ Tre azioni, con il dato che le motiva</li>
        </ul>
      </Pagina>

      <div className="border-t border-line bg-soft/60">
        <Pagina>
          <p className="mb-2 text-sm font-medium text-muted">
            Un report vero, anonimizzato. Così sai cosa ricevi prima di darci qualsiasi cosa.
          </p>
          <div className="rounded-2xl border border-line bg-bg p-5 sm:p-8">
            <Report report={REPORT_ESEMPIO} />
          </div>
          <p className="mt-6 text-center">
            <Link href="#test" className="font-semibold text-accent underline">
              Fai il test sulla tua attività
            </Link>
          </p>
        </Pagina>
      </div>
    </>
  );
}
