import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pagina } from "@/components/ui";
import { Report } from "@/components/report/Report";
import { REPORT_ESEMPIO } from "@/lib/mock-report";
import { InvitoAbbonamento } from "@/components/InvitoAbbonamento";
import { config } from "@/lib/config";

// TODO: caricare il report dal database per id (link inviato via email).
function caricaReport(id: string) {
  if (id === "esempio" || id.startsWith("scan-")) return REPORT_ESEMPIO;
  return null;
}

export async function generateMetadata({ params }: PageProps<"/report/[id]">): Promise<Metadata> {
  const { id } = await params;
  const r = caricaReport(id);
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
  const report = caricaReport(id);
  if (!report) notFound();

  return (
    <>
      {nuovo && (
        <p className="no-print mb-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Il tuo test è pronto. In questa anteprima i dati sono di esempio: la scansione vera arriva
          con il collegamento ai motori.
        </p>
      )}
      <Report report={report} abbonato={abbonato === "1"} />
      <InvitoAbbonamento reportId={report.id} pagamentiAttivi={config.stripe} />
    </>
  );
}
