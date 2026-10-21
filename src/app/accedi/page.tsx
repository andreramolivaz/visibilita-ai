import type { Metadata } from "next";
import Link from "next/link";
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
      <p className="mt-6 text-sm text-muted">
        Vuoi vedere com&apos;è?{" "}
        <Link href="/area/demo" className="font-semibold text-accent underline underline-offset-2">
          Guarda l&apos;area personale di esempio
        </Link>
        .
      </p>
    </Pagina>
  );
}

/** Chi è già dentro va dritto all'area. Legge i cookie, quindi sta in Suspense. */
async function SeGiaDentro() {
  const utente = await utenteCorrente();
  if (utente) redirect("/area");
  return null;
}
