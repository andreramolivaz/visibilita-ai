import type { Metadata } from "next";
import { Pagina, Titolo } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <Pagina className="max-w-xl">
      <Titolo>Privacy, in breve</Titolo>
      <div className="mt-5 space-y-4 text-[16px]">
        <p>
          <strong>Cosa raccogliamo.</strong> Solo la tua email, se decidi di abbonarti o di ricevere
          il link del report. I dati della tua attività (nome, indirizzo, orari, recensioni) sono
          pubblici: li leggiamo da Google, dal tuo sito e dai portali di categoria.
        </p>
        <p>
          <strong>Cosa ne facciamo.</strong> Interroghiamo ChatGPT, Gemini e Google AI con domande
          sulla tua categoria e città e ti mostriamo le risposte. Niente profilazione, niente
          pubblicità, nessuna cessione a terzi.
        </p>
        <p>
          <strong>Pagamenti.</strong> Gestiti da Stripe. Noi non vediamo la tua carta.
        </p>
        <p>
          <strong>Cancellazione.</strong> Scrivi all&apos;indirizzo in fondo alle email e cancelliamo
          tutto entro 30 giorni.
        </p>
        <p className="text-muted">Informativa completa in arrivo prima del lancio.</p>
      </div>
    </Pagina>
  );
}
