/**
 * Listino. Unico posto dove vivono i prezzi: li leggono la pagina prezzi,
 * l'invito nel report e il checkout Stripe.
 * Prezzi in euro, IVA esclusa. Annuale = due mesi gratis.
 *
 * Il set di domande è il «telescopio» (docs/studio-domande-telescopio.md):
 * famiglie di domande con almeno sei domande ciascuna, così ogni famiglia ha
 * abbastanza risposte per un intervallo stretto, e paraphrasi e zoom come
 * repliche dello stesso intento. Il numero esatto non si mostra sul sito.
 */

export type PianoId = "base" | "pro" | "agenzia";
export type Periodo = "mensile" | "annuale";

export interface Piano {
  id: PianoId;
  nome: string;
  perChi: string;
  mensile: number;
  annuale: number;
  /** Domande per scansione. */
  domande: number;
  /** Ripetizioni di ogni domanda, in giorni diversi. */
  ripetizioni: number;
  /** Ogni quanto si ripete la scansione. */
  cadenza: string;
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
    domande: 48,
    ripetizioni: 3,
    cadenza: "ogni mese",
    include: [
      "1 attività",
      "Set completo di domande su 6 assistenti AI, ogni domanda ripetuta in tre giorni diversi",
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
    domande: 72,
    ripetizioni: 2,
    cadenza: "ogni due settimane",
    include: [
      "1 attività",
      "Set esteso di domande: più occasioni, più zoom, nove punti intorno a te",
      "Scansione ogni due settimane",
      "5 concorrenti seguiti, avviso se ne entra uno nuovo",
      "Azioni spuntate e verificate alla scansione dopo",
      "PDF del report",
    ],
    stripeNome: "Visibilità AI · Pro",
    evidenza: true,
  },
  {
    id: "agenzia",
    nome: "Agenzia",
    perChi: "Per chi segue più attività e consegna il report con il proprio logo.",
    mensile: 179,
    annuale: 1790,
    domande: 72,
    ripetizioni: 2,
    cadenza: "ogni due settimane",
    include: ["10 attività con report Pro", "PDF con il tuo logo", "Un link cliente per ogni attività", "Export CSV", "Attività in più: 15 € al mese ciascuna"],
    stripeNome: "Visibilità AI · Agenzia",
  },
];

/** Il primo report: una tantum, a pagamento, stessa scansione del piano Base in un giorno solo. */
export const REPORT_SINGOLO = {
  id: "singolo" as const,
  nome: "Report singolo",
  prezzo: 49,
  domande: 36,
  motori: 6,
  ripetizioni: 2,
  stripeNome: "Visibilità AI · Report singolo",
  include: ["Set completo di domande su 6 assistenti AI, ogni domanda ripetuta", "Punteggio, concorrenti, fonti, parole, cosa dicono di te", "Tre azioni in ordine di impatto", "PDF del report", "Scalato dal primo mese se poi ti abboni"],
};

export const SISTEMAZIONE = {
  nome: "Sistemazione",
  prezzo: 490,
  testo: "Le tre azioni del report le facciamo noi: schede sui portali, categorie, descrizioni, foto. Verifica dopo 30 giorni.",
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
