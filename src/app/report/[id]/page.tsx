import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pagina } from "@/components/ui";
import { Report } from "@/components/report/Report";
import { InvitoAbbonamento } from "@/components/InvitoAbbonamento";
import { CercaAttivita } from "@/components/CercaAttivita";
import { config } from "@/lib/config";
import { caricaReport } from "@/lib/report/carica";

/** Gli esempi pubblici: chi li guarda non è il titolare, quindi l'invito è a fare il proprio report. */
const ESEMPI = new Set(["esempio", "singolo", "gratuito"]);

export async function generateMetadata({ params }: PageProps<"/report/[id]">): Promise<Metadata> {
  const { id } = await params;
  const r = await caricaReport(id);
  if (ESEMPI.has(id)) return { title: "Report di esempio" };
  return { title: r ? `${r.attivita.nome}, ${r.attivita.citta}` : "Report" };
}

export default function PaginaReport(props: PageProps<"/report/[id]">) {
  return (
    <Pagina className="max-w-4xl !pt-6 sm:!pt-10">
      <Suspense fallback={<p className="text-muted">Carico il report…</p>}>
        <Contenuto {...props} />
      </Suspense>
    </Pagina>
  );
}

async function Contenuto({ params, searchParams }: PageProps<"/report/[id]">) {
  const { id } = await params;
  const { nuovo, abbonato } = await searchParams;
  const report = await caricaReport(id);
  if (!report) notFound();
  const esempio = ESEMPI.has(id);
  const vero = id.startsWith("scan-") && report.attivita.id !== "esempio";

  return (
    <>
      {esempio && (
        <p className="no-print mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          <span>Questo è un report di esempio, su un&apos;attività inventata: è fatto come quello che ricevi.</span>
          <Link href="/#test" className="font-semibold underline underline-offset-2">
            Fai il tuo
          </Link>
        </p>
      )}
      {nuovo && (
        <p className="no-print mb-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Il tuo report è pronto.
          {vero ? " Salva il link: lo ritrovi anche nella tua area, con la stessa email." : " In questa dimostrazione i dati sono di esempio: la scansione vera arriva con il collegamento agli assistenti."}
        </p>
      )}
      <Report report={report} abbonato={abbonato === "1"} />
      {esempio ? (
        <section className="no-print mt-12 rounded-2xl border border-accent p-5 sm:p-7">
          <h2 className="text-xl font-semibold sm:text-2xl">Vuoi il tuo?</h2>
          <p className="mt-1.5 text-[15px] text-muted">Scrivi il nome della tua attività e la città: il report arriva in pochi minuti.</p>
          <div className="mt-5">
            <CercaAttivita />
          </div>
        </section>
      ) : (
        <InvitoAbbonamento reportId={report.id} pagamentiAttivi={config.stripe} />
      )}
    </>
  );
}
