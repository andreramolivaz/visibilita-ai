import type { Metadata } from "next";
import { Suspense } from "react";
import { Bottone, Pagina, Titolo } from "@/components/ui";
import { config } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { piano as pianoDi, type PianoId } from "@/lib/prezzi";

export const metadata: Metadata = { title: "Abbonamento attivo" };

export default function Grazie({ searchParams }: PageProps<"/abbonamento/grazie">) {
  return (
    <Pagina>
      <Suspense fallback={<p className="text-muted">Controllo il pagamento…</p>}>
        <Esito searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}

async function Esito({ searchParams }: { searchParams: PageProps<"/abbonamento/grazie">["searchParams"] }) {
  const { sessione } = await searchParams;
  let email: string | null = null;
  let nomePiano = "";

  if (config.stripe && typeof sessione === "string") {
    try {
      const s = await stripe().checkout.sessions.retrieve(sessione);
      email = s.customer_details?.email ?? s.customer_email ?? null;
      const id = s.metadata?.piano as PianoId | undefined;
      if (id) nomePiano = pianoDi(id).nome;
    } catch {
      // Sessione non trovata: mostriamo comunque il messaggio generico.
    }
  }

  return (
    <>
      <p className="text-sm font-semibold text-accent">Pagamento ricevuto</p>
      <Titolo>Grazie. Il piano {nomePiano || ""} è attivo.</Titolo>
      <div className="mt-5 space-y-3 text-[17px] text-muted">
        <p>
          {email ? (
            <>
              Ti abbiamo mandato a <span className="font-medium text-ink">{email}</span> la ricevuta e un
              link per entrare nell&apos;area personale: niente password, basta il link.
            </>
          ) : (
            <>Ti abbiamo mandato la ricevuta e un link per entrare nell&apos;area personale: niente password, basta il link.</>
          )}
        </p>
        <p>
          La prima scansione completa parte adesso e il report arriva via email appena pronto. Da
          allora, una sola email al mese: punteggio, variazione, due azioni e il link al report.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Bottone href="/accedi">Entra nell&apos;area personale</Bottone>
        <Bottone href="/report/esempio" secondario>
          Rivedi il report
        </Bottone>
      </div>
    </>
  );
}
