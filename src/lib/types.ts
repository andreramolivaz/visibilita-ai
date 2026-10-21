/**
 * Modello dati del prodotto. Tutto parte da qui: profilo attività,
 * domande, risposte dei motori, report.
 */

export type EngineId =
  | "chatgpt"
  | "gemini"
  | "google-ai"
  | "copilot"
  | "claude"
  | "meta-ai"
  | "perplexity"
  | "grok";

export type Phase = "mvp" | "v2" | "v3";

export interface Engine {
  id: EngineId;
  nome: string;
  /** Utenti in Italia (milioni), luglio 2026, fonte Audicom/Comscore. */
  utentiMln: number;
  /** Peso nel punteggio: le quote attive devono sommare a 1. */
  peso: number;
  fase: Phase;
  come: string;
}

export type Verdetto = "Invisibile" | "Poco visibile" | "Visibile" | "Dominante";

export type Portale =
  | "Google Maps"
  | "TheFork"
  | "TripAdvisor"
  | "Booking"
  | "Google Hotels"
  | "Airbnb"
  | "MioDottore"
  | "Dottori.it"
  | "Treatwell"
  | "Fresha"
  | "PagineGialle"
  | "ProntoPro"
  | "Instapro"
  | "Habitissimo"
  | "Immobiliare.it"
  | "Idealista"
  | "Casa.it"
  | "LinkedIn"
  | "Instagram"
  | "Gambero Rosso"
  | "Michelin"
  | "Wikipedia"
  | "Europages"
  | "Kompass"
  | "Sito ufficiale"
  | "Giornale locale"
  | "Ordine professionale"
  | "Portale turistico del Comune";

export type TipoDomanda = "generica" | "bisogno" | "specialita" | "nome";

export interface Domanda {
  id: string;
  testo: string;
  tipo: TipoDomanda;
  /** Il titolare può cambiare una sola domanda. */
  modificabile?: boolean;
}

export interface ProfiloAttivita {
  id: string;
  nome: string;
  citta: string;
  zona?: string;
  indirizzo: string;
  telefono?: string;
  sito?: string;
  categoriaGoogle: string;
  /** Slug del profilo di categoria in src/data/profiles. */
  categoria: string;
  sottocategoria?: string;
  specialita: string[];
  servizi: string[];
  fasciaPrezzo?: "€" | "€€" | "€€€" | "€€€€";
  lingue?: string[];
  prenotazioneOnline?: boolean;
  orari?: string;
  rating?: number;
  recensioni?: number;
  portaliPresenti: Portale[];
  portaliAssenti: Portale[];
  incoerenze: string[];
}

/** Posizione in cui compari nella risposta: 1 = primo nome citato. */
export type Posizione = 1 | 2 | 3 | 4 | 5 | null;

export interface Risposta {
  domandaId: string;
  motore: EngineId;
  ripetizione: number;
  /** null = non compari. */
  posizione: Posizione;
  citati: string[];
  fonti: string[];
  testo?: string;
}

export interface RisultatoMotore {
  motore: EngineId;
  /** Domande in cui compari almeno una volta. */
  comparse: number;
  totale: number;
}

export interface Concorrente {
  nome: string;
  /** Risposte in cui viene citato. */
  citazioni: number;
  totale: number;
  seiTu?: boolean;
}

export interface CellaDomanda {
  motore: EngineId;
  /** Posizione media quando compari, null se mai. */
  posizione: Posizione;
  /** "2 su 3" */
  frequenza: string;
  /** Quante volte compari, su `ripetizioni`. */
  volte?: number;
}

export interface RigaDomanda {
  domanda: Domanda;
  celle: CellaDomanda[];
}

export interface Fonte {
  nome: Portale | string;
  citazioni: number;
  ciSei: boolean;
  /** Quanti dei 5 concorrenti più citati hanno una scheda qui. */
  concorrentiPresenti?: number;
}

export interface ErroreScheda {
  tipo: "categoria" | "orari" | "chiuso" | "indirizzo" | "telefono" | "altro";
  testo: string;
  motore: EngineId;
}

export interface Azione {
  titolo: string;
  dato: string;
  impatto: "alto" | "medio" | "basso";
  /** Punti di punteggio stimati se fatta. */
  impattoStimato?: number;
  fatta?: boolean;
}

/** Visibilità per tipo di domanda: dove compari e dove no. */
export interface RisultatoTipo {
  tipo: TipoDomanda;
  /** Risposte in cui compari. */
  comparse: number;
  totale: number;
  /** Domande di questo tipo nel set. */
  domande: number;
}

/** Confronto diretto con un concorrente, in numero di domande. */
export interface TestaATesta {
  nome: string;
  /** Domande in cui c'è lui e non tu. */
  loroSenzaTe: number;
  /** Domande in cui ci siete entrambi. */
  entrambi: number;
  /** Domande in cui ci sei tu e non lui. */
  tuSenzaLoro: number;
}

/** Parole che i motori usano quando consigliano nella tua categoria. */
export interface Termine {
  termine: string;
  volte: number;
  /** Compare nelle tue recensioni o sul tuo sito. */
  ceLHai: boolean;
  /** Quante volte compare nelle tue recensioni Google. */
  volteTue?: number;
}

/** Chi cita chi: per ogni attività, in quante domande ogni assistente la cita. */
export interface CitaChi {
  nome: string;
  seiTu?: boolean;
  perMotore: Partial<Record<EngineId, number>>;
}

/** Contesto: come stanno le altre attività della stessa categoria e città. */
export interface Contesto {
  categoria: string;
  citta: string;
  attivitaAnalizzate: number;
  /** Punteggio mediano delle attività analizzate. */
  mediana: number;
  /** Percentuale di attività con punteggio più basso del tuo. */
  percentile: number;
}

export interface DescrizioneMotore {
  motore: EngineId;
  testo: string;
}

export interface Metodo {
  /** Inizio e fine della scansione, ISO. */
  inizio: string;
  fine: string;
  /** Posizione impostata nelle API. */
  posizione: string;
  lingua: string;
  note: string[];
}

export interface Report {
  id: string;
  /** Piano con cui è stato prodotto: decide cosa mostrare. */
  piano: Piano;
  attivita: ProfiloAttivita;
  data: string;
  motori: EngineId[];
  domande: number;
  ripetizioni: number;
  punteggio: number;
  verdetto: Verdetto;
  /** In breve: tre o quattro frasi scritte dai dati. */
  sintesi: string;
  perMotore: RisultatoMotore[];
  perTipo: RisultatoTipo[];
  concorrenti: Concorrente[];
  testaATesta: TestaATesta[];
  citaChi: CitaChi[];
  contesto?: Contesto;
  righe: RigaDomanda[];
  termini: Termine[];
  fonti: Fonte[];
  descrizioneAI: string;
  descrizioniPerMotore: DescrizioneMotore[];
  errori: ErroreScheda[];
  azioni: Azione[];
  metodo: Metodo;
  /** Solo abbonamento: punteggi degli ultimi mesi, dal più vecchio. */
  andamento?: { mese: string; punteggio: number }[];
}

export type Piano = "gratuito" | "base" | "pro" | "agenzia";
