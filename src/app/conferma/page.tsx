import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagina, Titolo } from "@/components/ui";
import { ConfermaProfilo } from "@/components/ConfermaProfilo";
import { TEST_GRATUITO } from "@/lib/prezzi";
import { costruisciProfilo } from "@/lib/profilo";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "È giusto?" };

export default function Conferma({ searchParams }: PageProps<"/conferma">) {
  return (
    <Pagina>
      <p className="text-sm text-muted">Passo 1 di 3</p>
      <Titolo>È giusto?</Titolo>
      <p className="mt-2 text-muted">
        Ecco cosa abbiamo trovato su di te e le domande che ne ricaviamo. Conferma con un tocco o correggi una voce.
      </p>
      <Suspense fallback={<p className="mt-6 text-muted">{config.places ? "Leggo la scheda Google, le recensioni, il sito e le ricerche nella tua città…" : "Preparo il profilo…"}</p>}>
        <Profilo searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}

async function Profilo({ searchParams }: { searchParams: PageProps<"/conferma">["searchParams"] }) {
  const { q } = await searchParams;
  const testo = typeof q === "string" ? q : "";
  const { attivita, domande, segnali, recensioni } = await costruisciProfilo(testo, TEST_GRATUITO.domande);
  return <ConfermaProfilo attivita={attivita} domande={domande} segnali={segnali} recensioni={recensioni} />;
}
