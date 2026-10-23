import type { Metadata } from "next";
import { CercaAttivita } from "@/components/CercaAttivita";
import { Simbolo } from "@/components/Marchio";
import { Passi } from "@/components/landing/Passi";
import { StrisciaMotori } from "@/components/landing/StrisciaMotori";
import { Pagina, Titolo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Come funziona",
  description: "Facciamo agli assistenti AI le domande dei tuoi clienti e contiamo quante volte ti nominano. Tre passi, nessuna configurazione.",
};

const FIDUCIA = [
  ["Domande vere", "Corte, come le scrive un cliente: «pizzeria aperta la domenica a Bergamo». Cambiano con il tuo mestiere."],
  ["Fatte più volte", "Le risposte dell'AI cambiano da una volta all'altra: ogni domanda la facciamo più volte e contiamo quante volte compari."],
  ["Sempre le stesse", "Le domande restano uguali da un report all'altro, così vedi se stai salendo davvero."],
];

const ATTIVITA = [
  "Ristoranti e pizzerie",
  "Bar e pasticcerie",
  "Negozi",
  "Dentisti",
  "Studi medici",
  "Fisioterapisti",
  "Parrucchieri",
  "Centri estetici",
  "Hotel e B&B",
  "Palestre",
  "Idraulici ed elettricisti",
  "Imprese edili",
  "Autofficine",
  "Agenzie immobiliari",
  "Avvocati",
  "Commercialisti",
  "Architetti",
  "Carpenterie e manifattura",
  "Logistica",
  "Software house",
];

/**
 * Come funziona, per chi deve decidere: tre passi, gli assistenti, perché
 * fidarsi, per chi. Niente formule: il metodo completo è nel white paper.
 */
export default function ComeFunziona() {
  return (
    <Pagina larga>
      <div className="max-w-2xl">
        <Titolo>Come funziona</Titolo>
        <p className="mt-4 text-lg text-muted">
          Facciamo agli assistenti AI le domande che fanno i tuoi clienti e contiamo quante volte ti nominano. Tu scrivi solo il nome della tua attività.
        </p>
      </div>

      <section className="mt-12">
        <Passi />
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-bold sm:text-3xl">Sei assistenti, quelli che usano gli italiani</h2>
        <p className="mt-2 max-w-2xl text-muted">Nel punteggio conta di più chi ha più utenti: non comparire su ChatGPT pesa più che non comparire su Grok.</p>
        <div className="mt-8">
          <StrisciaMotori />
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-bold sm:text-3xl">Perché puoi fidarti dei numeri</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FIDUCIA.map(([titolo, testo]) => (
            <div key={titolo} className="rounded-2xl border border-line p-6">
              <h3 className="text-lg font-semibold">{titolo}</h3>
              <p className="mt-2 text-[15px] text-muted">{testo}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-bold sm:text-3xl">Per ogni attività</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Le domande cambiano con il mestiere: un ristorante si gioca su piatti e orari, un dentista sulle prestazioni, un&apos;azienda su lavorazioni e zona.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {ATTIVITA.map((a) => (
            <li key={a} className="rounded-full border border-line px-3.5 py-1.5 text-[15px]">
              {a}
            </li>
          ))}
          <li className="rounded-full px-3.5 py-1.5 text-[15px] text-muted">e molte altre</li>
        </ul>
      </section>

      <a
        href="/white-paper-visibilita-ai.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-20 flex items-center gap-4 rounded-2xl bg-soft p-5 transition-colors hover:bg-line/60 sm:p-6"
      >
        <Simbolo size={44} className="shrink-0" />
        <span className="min-w-0">
          <span className="block font-semibold">Vuoi tutti i dettagli?</span>
          <span className="block text-[15px] text-muted">Metodo, statistiche e fonti sono nel white paper, in PDF.</span>
        </span>
        <span className="ml-auto shrink-0 text-sm font-semibold text-accent">Scarica</span>
      </a>

      <section className="mx-auto mt-20 max-w-2xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Prova con la tua attività</h2>
        <p className="mt-2 text-muted">Scrivi il nome e la città. Il report arriva in pochi minuti.</p>
        <div className="mt-6 text-left">
          <CercaAttivita />
        </div>
      </section>
    </Pagina>
  );
}
