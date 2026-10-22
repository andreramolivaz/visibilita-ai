import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pagina } from "@/components/ui";
import { Report } from "@/components/report/Report";
import { InvitoAbbonamento } from "@/components/InvitoAbbonamento";
import { config } from "@/lib/config";
import { caricaReport } from "@/lib/report/carica";

export async function generateMetadata({ params }: PageProps<"/report/[id]">): Promise<Metadata> {
  const { id } = await params;
  const r = await caricaReport(id);
  return { title: r ? `${r.attivita.nome}, ${r.attivita.citta}` : "Report" };
}

export default function PaginaReport(props: PageProps<"/report/[id]">) {
  return (
    <Pagina className="max-w-4xl">
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
  const vero = id.startsWith("scan-") && report.attivita.id !== "esempio";

  return (
    <>
      {nuovo && (
        <p className="no-print mb-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Il tuo report è pronto: {report.domande} domande, {report.motori.length} assistenti, {report.ripetizioni} ripetizioni.
          {vero ? " Salva il link: è il tuo report, e lo ritrovi nella tua area con la stessa email." : " In questa dimostrazione i dati sono di esempio: la scansione vera arriva con il collegamento agli assistenti."}
        </p>
      )}
      <Report report={report} abbonato={abbonato === "1"} />
      <InvitoAbbonamento reportId={report.id} pagamentiAttivi={config.stripe} />
    </>
  );
}
