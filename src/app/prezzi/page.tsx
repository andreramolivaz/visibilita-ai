import type { Metadata } from "next";
import { Bottone, Pagina, Scheda, Titolo } from "@/components/ui";

export const metadata: Metadata = { title: "Prezzi" };

const PIANI = [
  {
    nome: "Test gratuito",
    prezzo: "0 €",
    periodo: "",
    include: [
      "5 domande × 3 motori × 2 ripetizioni",
      "Un test per attività ogni 30 giorni",
      "Senza registrazione",
    ],
    azione: { testo: "Fai il test", href: "/#test" },
  },
  {
    nome: "Base",
    prezzo: "9 €",
    periodo: "al mese + IVA, o 79 €/anno",
    include: [
      "1 attività",
      "10 domande × 3 motori × 3 ripetizioni",
      "Scansione mensile, email, storico",
    ],
    azione: { testo: "Inizia dal test gratuito", href: "/#test" },
    evidenza: true,
  },
  {
    nome: "Pro",
    prezzo: "19 €",
    periodo: "al mese + IVA, o 169 €/anno",
    include: [
      "Scansione settimanale",
      "20 domande × tutti i motori attivi × 2 ripetizioni",
      "5 concorrenti seguiti, PDF",
    ],
    azione: { testo: "Inizia dal test gratuito", href: "/#test" },
  },
  {
    nome: "Agenzia",
    prezzo: "79 €",
    periodo: "al mese + IVA",
    include: [
      "10 attività con report Pro e scansione mensile",
      "PDF con il tuo logo, link cliente, CSV",
      "+6 € per attività in più, +5 € per passare a settimanale",
    ],
    azione: { testo: "Per le agenzie", href: "/agenzie" },
  },
];

export default function Prezzi() {
  return (
    <Pagina>
      <Titolo>Prezzi</Titolo>
      <p className="mt-3 text-muted">
        Semplice, in italiano, per la singola attività. Annuale = due mesi gratis. Nessun piano
        gratuito permanente: solo il test.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PIANI.map((p) => (
          <Scheda key={p.nome} className={p.evidenza ? "border-accent" : ""}>
            <h2 className="font-semibold">{p.nome}</h2>
            <p className="mt-1">
              <span className="text-3xl font-bold tracking-tight">{p.prezzo}</span>
              {p.periodo && <span className="ml-2 text-sm text-muted">{p.periodo}</span>}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {p.include.map((i) => (
                <li key={i}>✓ {i}</li>
              ))}
            </ul>
            <div className="mt-4">
              <Bottone href={p.azione.href} secondario={!p.evidenza} className="w-full">
                {p.azione.testo}
              </Bottone>
            </div>
          </Scheda>
        ))}
      </div>

      <Scheda className="mt-6 bg-soft">
        <h2 className="font-semibold">Sistemazione · 149–299 € una tantum</h2>
        <p className="mt-1 text-sm text-muted">
          Le tre azioni del report le facciamo noi: schede sui portali, categorie, descrizioni,
          foto. Verifica dopo 30 giorni.
        </p>
      </Scheda>
    </Pagina>
  );
}
