import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Pagina, Titolo } from "@/components/ui";
import { Accesso } from "@/components/Accesso";
import { config } from "@/lib/config";
import { utenteCorrente } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Accedi" };

export default function Accedi() {
  return (
    <Pagina className="max-w-md">
      <Suspense fallback={null}>
        <SeGiaDentro />
      </Suspense>
      <Titolo>Accedi</Titolo>
      <p className="mt-3 text-muted">
        Per chi ha un abbonamento: storico dei report, domande, concorrenti seguiti, fatture.
      </p>
      <div className="mt-8">
        <Accesso attivo={config.supabase} />
      </div>
    </Pagina>
  );
}

/** Chi è già dentro va dritto all'area. Legge i cookie, quindi sta in Suspense. */
async function SeGiaDentro() {
  const utente = await utenteCorrente();
  if (utente) redirect("/area");
  return null;
}
