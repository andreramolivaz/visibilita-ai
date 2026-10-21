import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagina, Titolo } from "@/components/ui";
import { ATTIVITA_ESEMPIO } from "@/lib/mock-report";
import { generaDomande, profilo } from "@/lib/profiles";
import { ConfermaProfilo } from "@/components/ConfermaProfilo";
import { TEST_GRATUITO } from "@/lib/prezzi";

export const metadata: Metadata = { title: "È giusto?" };

export default function Conferma({ searchParams }: PageProps<"/conferma">) {
  return (
    <Pagina>
      <p className="text-sm text-muted">Passo 1 di 3</p>
      <Titolo>È giusto?</Titolo>
      <p className="mt-2 text-muted">
        Ecco cosa abbiamo trovato su di te. Conferma con un tocco o correggi una voce.
      </p>
      <Suspense fallback={<p className="mt-6 text-muted">Cerco la tua attività…</p>}>
        <Profilo searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}

async function Profilo({ searchParams }: { searchParams: PageProps<"/conferma">["searchParams"] }) {
  const { q } = await searchParams;
  const testo = typeof q === "string" ? q : "";

  // TODO: ricavare il profilo da Google Places + sito + portali (20–30 s).
  // Per ora usiamo il profilo di esempio, con il nome digitato se c'è.
  const [nome, citta] = testo.split(",").map((s) => s.trim());
  const attivita = {
    ...ATTIVITA_ESEMPIO,
    nome: nome || ATTIVITA_ESEMPIO.nome,
    citta: citta || ATTIVITA_ESEMPIO.citta,
  };
  const p = profilo(attivita.categoria);
  const domande = generaDomande(
    p,
    {
      nome: attivita.nome,
      categoria: attivita.categoriaGoogle,
      citta: attivita.citta,
      zona: attivita.zona,
      specialita: attivita.specialita,
    },
    TEST_GRATUITO.domande,
  );

  return <ConfermaProfilo attivita={attivita} domande={domande} />;
}
