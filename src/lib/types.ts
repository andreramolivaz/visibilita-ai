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
}

export interface RigaDomanda {
  domanda: Domanda;
  celle: CellaDomanda[];
}

export interface Fonte {
  nome: Portale | string;
  citazioni: number;
  ciSei: boolean;
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
  fatta?: boolean;
}

export interface Report {
  id: string;
  attivita: ProfiloAttivita;
  data: string;
  motori: EngineId[];
  domande: number;
  ripetizioni: number;
  punteggio: number;
  verdetto: Verdetto;
  perMotore: RisultatoMotore[];
  concorrenti: Concorrente[];
  righe: RigaDomanda[];
  fonti: Fonte[];
  descrizioneAI: string;
  errori: ErroreScheda[];
  azioni: Azione[];
  /** Solo abbonamento: punteggi degli ultimi mesi, dal più vecchio. */
  andamento?: { mese: string; punteggio: number }[];
}

export type Piano = "gratuito" | "base" | "pro" | "agenzia";
