import type { Domanda, EngineId, Formulazione, Piano, Posizione, ProfiloAttivita, SegnaliProfilo, TipoDomanda } from "../types";
import type { RispostaGrezza } from "../motori/tipi";

/** Cosa abbiamo letto in una risposta: la tua posizione, chi è citato, da quali fonti. */
export interface AnalisiCella {
  /** Posizione tua nell'elenco dei nomi riconosciuti (1–5), null se assente o oltre il quinto. */
  posizione: Posizione;
  /** Le attività riconosciute, nell'ordine in cui compaiono; tu compreso. */
  citati: { nome: string; posizione: number; seiTu?: boolean }[];
  /** Etichette delle fonti (portali o domini), senza doppioni. */
  fonti: string[];
}

export type StatoCella = "da fare" | "fatta" | "errore";

/** La forma della ripetizione r (da 1): la seconda è la seconda forma, se la domanda ce l'ha (a lista; invertita nei confronti); le altre sono brevi. */
export function formaDellaRipetizione(d: Domanda, r: number): Formulazione {
  if (r !== 2 || !d.secondaForma) return "breve";
  return d.tipo === "confronto" ? "invertita" : "lista";
}

/** Una domanda a un assistente, una volta. L'unità di lavoro della coda. */
export interface Cella {
  domandaId: string;
  motore: EngineId;
  ripetizione: number;
  /** La forma chiesta in questa ripetizione (breve o a lista); assente nelle scansioni vecchie. */
  forma?: Formulazione;
  /** Prima di questo momento non va eseguita: le ripetizioni stanno in giorni diversi. */
  eseguiDopo: string;
  stato: StatoCella;
  risposta?: RispostaGrezza;
  analisi?: AnalisiCella;
}

/** «in attesa di pagamento»: creata, parte quando Stripe conferma; «in attesa»: aspetta il giorno della ripetizione successiva. */
export type StatoScansione = "in attesa di pagamento" | "in corso" | "in attesa" | "completata";

export interface PagamentoScansione {
  /** Sessione Stripe Checkout. */
  sessioneId?: string;
  /** Importo in euro, IVA esclusa. */
  importo: number;
  pagatoIl?: string;
}

export interface Scansione {
  id: string;
  piano: Piano;
  email?: string;
  attivita: ProfiloAttivita;
  domande: Domanda[];
  motori: EngineId[];
  ripetizioni: number;
  segnali?: SegnaliProfilo;
  /** Testi delle recensioni Google, per contare i termini nelle tue recensioni. */
  recensioni: string[];
  /** Nomi dei concorrenti vicini (dalla scheda Google), per riconoscerli nelle risposte. */
  concorrentiNoti: string[];
  celle: Cella[];
  stato: StatoScansione;
  creataIl: string;
  aggiornataIl: string;
  /** Senza motori configurati la scansione è una dimostrazione con il report di esempio. */
  simulata?: boolean;
  reportId?: string;
  /** Report singolo: il pagamento che sblocca la scansione. */
  pagamento?: PagamentoScansione;
}

/** Una domanda, come la vede la pagina di scansione: il tipo, e il testo solo se l'ha scritta il titolare. */
export interface DomandaInScansione {
  id: string;
  tipo: TipoDomanda;
  testo?: string;
}

/** Una casella della griglia domanda × assistente: quante ripetizioni sono fatte, quante in errore. */
export interface CasellaAvanzamento {
  domandaId: string;
  motore: EngineId;
  fatte: number;
  errori: number;
  totale: number;
}

/** Avanzamento, per la pagina di scansione. */
export interface Avanzamento {
  id: string;
  stato: StatoScansione;
  fatte: number;
  totale: number;
  /** Celle che aspettano un giorno successivo. */
  inAttesa: number;
  prossimaIl?: string;
  corrente?: { motore: EngineId; domandaId: string };
  reportId?: string;
  simulata: boolean;
  domande: DomandaInScansione[];
  motori: EngineId[];
  ripetizioni: number;
  griglia: CasellaAvanzamento[];
}
