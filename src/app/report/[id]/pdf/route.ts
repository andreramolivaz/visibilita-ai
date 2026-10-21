import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ReportPdf } from "@/components/pdf/ReportPdf";
import { REPORT_ESEMPIO } from "@/lib/mock-report";


// TODO: caricare il report dal database e, per le agenzie, il logo white-label.
function caricaReport(id: string) {
  if (id === "esempio" || id.startsWith("scan-")) return REPORT_ESEMPIO;
  return null;
}

export async function GET(_req: Request, ctx: RouteContext<"/report/[id]/pdf">) {
  const { id } = await ctx.params;
  const report = caricaReport(id);
  if (!report) return new Response("Report non trovato", { status: 404 });

  const documento = createElement(ReportPdf, { report }) as unknown as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(documento);
  const nome = `visibilita-ai-${report.attivita.nome}-${report.data}.pdf`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${nome}"`,
      "cache-control": "private, max-age=0",
    },
  });
}
