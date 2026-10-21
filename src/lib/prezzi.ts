/**
 * Listino. Unico posto dove vivono i prezzi: li leggono la pagina prezzi,
 * l'invito nel report e il checkout Stripe.
 * Prezzi in euro, IVA esclusa. Annuale = due mesi gratis.
 */

export type PianoId = "base" | "pro" | "agenzia";
export type Periodo = "mensile" | "annuale";

export interface Piano {
  id: PianoId;
  nome: string;
  perChi: string;
  mensile: number;
  annuale: number;
  include: string[];
  /** Nome prodotto su Stripe e in fattura. */
  stripeNome: string;
  evidenza?: boolean;
}

export const PIANI: Piano[] = [
  {
    id: "base",
    nome: "Base",
    perChi: "Per una sola attività che vuole sapere ogni mese dove sta.",
    mensile: 29,
    annuale: 290,
    include: [
      "1 attività",
      "10 domande su 6 motori, 3 ripetizioni ciascuna",
      "Scansione ogni mese",
      "Email mensile con punteggio e variazione",
      "Storico dei report",
      "PDF del report",
    ],
    stripeNome: "Visibilità AI · Base",
  },
  {
    id: "pro",
    nome: "Pro",
    perChi: "Per chi vuole muoversi in fretta e tenere d'occhio i concorrenti.",
    mensile: 59,
    annuale: 590,
    include: [
      "1 attività",
      "20 domande su 6 motori, 3 ripetizioni ciascuna",
      "Scansione ogni settimana",
      "5 concorrenti seguiti, avviso se ne entra uno nuovo",
      "Azioni spuntate e verificate il mese dopo",
      "PDF del report",
    ],
    stripeNome: "Visibilità AI · Pro",
    evidenza: true,
  },
  {
    id: "agenzia",
    nome: "Agenzia",
    perChi: "Per web agency e freelance che lo rivendono con il proprio logo.",
    mensile: 179,
    annuale: 1790,
    include: [
      "10 attività con report Pro",
      "PDF con il tuo logo",
      "Un link cliente per ogni attività",
      "Export CSV",
      "Attività in più: 15 € al mese ciascuna",
    ],
    stripeNome: "Visibilità AI · Agenzia",
  },
];

export const SISTEMAZIONE = {
  nome: "Sistemazione",
  prezzo: 490,
  testo:
    "Le tre azioni del report le facciamo noi: schede sui portali, categorie, descrizioni, foto. Verifica dopo 30 giorni.",
};

export const TEST_GRATUITO = {
  domande: 5,
  motori: 6,
  ripetizioni: 2,
  ogniGiorni: 30,
};

export function piano(id: PianoId): Piano {
  const p = PIANI.find((x) => x.id === id);
  if (!p) throw new Error(`Piano sconosciuto: ${id}`);
  return p;
}

export function prezzo(p: Piano, periodo: Periodo): number {
  return periodo === "annuale" ? p.annuale : p.mensile;
}

/** "29 €" */
export function euro(n: number): string {
  return `${n.toLocaleString("it-IT")} €`;
}
