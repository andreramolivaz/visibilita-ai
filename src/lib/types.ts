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

/**
 * Sei tipi di domanda, dallo studio dei prompt reali (Semrush 2025-26,
 * Otterly, Citations.press, BrightLocal): generica (categoria + luogo),
 * per bisogno (urgenza, orario, prezzo), per specialità (la prestazione),
 * per requisito (certificazione, convenzione, servizio accessorio),
 * di confronto («meglio X o Y?»), sul nome (verifica dell'attività).
 */
export type TipoDomanda = "generica" | "bisogno" | "specialita" | "requisito" | "confronto" | "nome";

export const TIPI_DOMANDA: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "confronto", "nome"];

/** Da dove viene una domanda: dal modello di categoria, da un segnale dell'attività (scheda Google, recensioni, sito, ricerche), dal titolare. */
export type OrigineDomanda = "modello" | "scheda" | "recensioni" | "sito" | "ricerche" | "titolare";

export interface Domanda {
  id: string;
  testo: string;
  tipo: TipoDomanda;
  /** Il titolare può cambiare una sola domanda. */
  modificabile?: boolean;
  /** Per le domande di confronto: il concorrente nominato. */
  concorrente?: string;
  /** Da dove viene il contenuto della domanda (specialità, requisito, testo). */
  origine?: OrigineDomanda;
  /** Nei set grandi: domanda che può ruotare da una scansione all'altra; le altre restano fisse per il confronto nel tempo. */
  esplora?: boolean;
}

export interface ProfiloAttivita {
  id: string;
  nome: string;
  citta: string;
  zona?: string;
  /** Per le attività B2B le domande si fanno per provincia e regione. */
  provincia?: string;
  regione?: string;
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
  /** Coordinate della scheda Google, per la posizione nelle API e i concorrenti vicini. */
  coordinate?: { lat: number; lng: number };
  /** Identificativo Google Places, quando il profilo viene da lì. */
  placeId?: string;
}

/** Un termine ricorrente e in quanti documenti (recensioni, pagine) compare. */
export interface TermineRicorrente {
  termine: string;
  volte: number;
}

/** Un concorrente vicino, dalla scheda Google. */
export interface ConcorrenteVicino {
  nome: string;
  rating?: number;
  recensioni?: number;
  distanzaM?: number;
}

/**
 * I segnali raccolti per costruire le domande: da dove vengono specialità,
 * requisiti e concorrente. Si mostrano al titolare nella conferma.
 */
export interface SegnaliProfilo {
  /** Termini ricorrenti nelle recensioni Google, in ordine di frequenza. */
  recensioni: TermineRicorrente[];
  /** Termini ricorrenti nelle pagine chiave del sito. */
  sito: TermineRicorrente[];
  /** Modificatori usati nelle ricerche Google per categoria e città («senza glutine», «aperta ora»). */
  ricerche: string[];
  /** Concorrenti vicini della stessa categoria, dal più noto. */
  concorrenti: ConcorrenteVicino[];
  /** Note sul sito: menu o listino solo in PDF, sito assente. */
  note: string[];
  /** Fonte del profilo. */
  fonte: "google" | "esempio";
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
  /** Citazioni in cui è tra i primi tre nomi dell'elenco. */
  primiTre?: number;
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
  /** Concorrenti distinti citati per questa domanda, su tutti gli assistenti. 0 = nessuno. */
  concorrentiCitati?: number;
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

/** Tono della descrizione: conta solo quando è critico (Insites 2026: positivo nel 79,8% dei casi). */
export type Tono = "positivo" | "neutro" | "critico";

export interface DescrizioneMotore {
  motore: EngineId;
  testo: string;
  tono?: Tono;
  /** Dati dell'attività riportati correttamente (categoria, orari, indirizzo, telefono, servizi). */
  datiCorretti?: boolean;
}

export interface Metodo {
  /** Inizio e fine della scansione, ISO. Nell'abbonamento le ripetizioni sono su giorni diversi. */
  inizio: string;
  fine: string;
  /** Posizione impostata nelle API. */
  posizione: string;
  lingua: string;
  /** Canale di raccolta dichiarato: interfacce ufficiali (API) o app. */
  canale?: string;
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
  /** Domande in cui il cliente non fa il tuo nome: su queste si calcolano punteggio e numeri chiave. */
  domandeSpontanee: number;
  ripetizioni: number;
  punteggio: number;
  verdetto: Verdetto;
  /** In breve: tre o quattro frasi scritte dai dati. */
  sintesi: string;
  perMotore: RisultatoMotore[];
  perTipo: RisultatoTipo[];
  concorrenti: Concorrente[];
  /** Citazioni di tutte le attività nelle risposte (anche fuori dai primi cinque): base della quota di voce. */
  citazioniTotali?: number;
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
