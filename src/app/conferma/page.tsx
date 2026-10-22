import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagina, Titolo } from "@/components/ui";
import { ConfermaProfilo } from "@/components/ConfermaProfilo";
import { costruisciProfilo } from "@/lib/profilo";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "È giusto?" };

export default function Conferma({ searchParams }: PageProps<"/conferma">) {
  return (
    <Pagina>
      <p className="text-sm text-muted">Passo 1 di 3</p>
      <Titolo>È giusto?</Titolo>
      <p className="mt-2 text-muted">Ecco cosa abbiamo trovato su di te. Conferma, scrivi l&apos;email e il report parte.</p>
      <Suspense fallback={<p className="mt-6 text-muted">{config.places ? "Leggo la scheda Google, le recensioni, il sito e le ricerche nella tua città…" : "Preparo il profilo…"}</p>}>
        <Profilo searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}

async function Profilo({ searchParams }: { searchParams: PageProps<"/conferma">["searchParams"] }) {
  const { q } = await searchParams;
  const testo = typeof q === "string" ? q : "";
  // Le domande si generano di nuovo sul server quando parte la scansione: qui servono solo profilo e segnali.
  const { attivita, segnali, recensioni } = await costruisciProfilo(testo, "singolo");
  return <ConfermaProfilo attivita={attivita} segnali={segnali} recensioni={recensioni} pagamenti={config.stripe} />;
}
