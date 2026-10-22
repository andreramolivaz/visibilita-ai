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
 * Le famiglie di domanda, dallo studio dei prompt reali e dallo studio
 * «Domande e statistiche» (docs/studio-domande-statistiche.md):
 * generica (categoria + luogo), per bisogno (la prestazione cercata), per
 * specialità (il prodotto o la specialità dell'attività), per requisito
 * (servizio accessorio, orari, urgenza), per prezzo (convenienza, tariffe
 * chiare: il compito più frequente di chi decide con l'AI in Italia), per
 * occasione (chi chiede e perché: famiglia, lavoro, turisti), per recensioni
 * (affidabilità, voto, reputazione), vicino a te (zona nel testo o posizione
 * impostata in punti intorno all'attività), informativa (come scegliere,
 * quanto costa: spesso senza nomi, riportata a parte), di confronto («meglio X
 * o Y?»), sul nome (verifica dei dati), in inglese (per chi riceve stranieri).
 */
export type TipoDomanda = "generica" | "bisogno" | "specialita" | "requisito" | "prezzo" | "occasione" | "recensioni" | "vicino" | "informativa" | "confronto" | "nome" | "inglese";

export const TIPI_DOMANDA: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "prezzo", "occasione", "recensioni", "vicino", "informativa", "confronto", "nome", "inglese"];

/** Il livello di zoom geografico della domanda: il telescopio. */
export type Zoom = "citta" | "zona" | "vicino" | "provincia" | "regione" | "nazionale";

/**
 * Le due forme di ogni intento: breve, come si scrive davvero («pizzeria aperta
 * la domenica a Bergamo»), e a lista, con la richiesta esplicita di più
 * opzioni. Sono le ripetizioni della domanda, non domande diverse: il registro
 * non cambia i nomi, la richiesta di una lista sì (Peec 2026). Nei confronti
 * «meglio X o Y» la seconda forma è quella con i nomi invertiti, perché gli
 * assistenti preferiscono il primo nome che leggono.
 */
export type Formulazione = "breve" | "lista" | "invertita";

/** Un punto intorno all'attività in cui viene impostata la posizione: spostamento in metri verso nord ed est. */
export interface PuntoVicino {
  etichetta: "centro" | "nord" | "sud" | "est" | "ovest" | "nord-est" | "nord-ovest" | "sud-est" | "sud-ovest";
  nordM: number;
  estM: number;
}

/** Da dove viene una domanda: dal modello di categoria, da un segnale dell'attività (scheda Google, recensioni, sito, ricerche), dal titolare. */
export type OrigineDomanda = "modello" | "scheda" | "recensioni" | "sito" | "ricerche" | "titolare";

export interface Domanda {
  id: string;
  testo: string;
  tipo: TipoDomanda;
  /** Livello di zoom geografico. */
  zoom?: Zoom;
  /** La seconda forma dello stesso intento, chiesta come seconda ripetizione: a lista («…: consigliami 5 opzioni»), o con i nomi invertiti nei confronti. */
  secondaForma?: string;
  /** Gruppo di intento: le domande con lo stesso gruppo chiedono la stessa cosa a zoom diversi. */
  gruppo?: string;
  /** Per le domande per occasione: chi chiede e perché («famiglia», «lavoro», «turisti»…). */
  occasione?: string;
  /** Per le domande vicino a te: il punto in cui è impostata la posizione. */
  punto?: PuntoVicino;
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
  /** Le stesse volte divise per forma della domanda (breve, a lista), per la sensibilità alla forma. */
  perForma?: Partial<Record<Formulazione, { volte: number; totale: number }>>;
  /** Risposte della cella che fanno almeno un nome di attività (per le domande informative). */
  conNomi?: number;
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

/** Visibilità per livello di zoom: città, zona, vicino a te, provincia… */
export interface RisultatoZoom {
  zoom: Zoom;
  comparse: number;
  totale: number;
  domande: number;
}

/** Visibilità per occasione: chi chiede e perché. */
export interface RisultatoOccasione {
  occasione: string;
  comparse: number;
  totale: number;
  domande: number;
}

/** Un punto intorno all'attività: quante risposte ti citano quando la posizione è impostata lì. */
export interface RisultatoPunto {
  punto: PuntoVicino;
  comparse: number;
  totale: number;
  /** Stima ridotta verso la media dei punti (un punto ha poche risposte) e peso della media. */
  ridotta?: number;
  peso?: number;
}

/**
 * Quanto conta la forma della domanda, a livello di report: sulle domande
 * chieste sia in forma breve sia a lista, la quota di risposte in cui compari
 * con l'una e con l'altra, la differenza media per domanda e il suo errore.
 */
export interface SensibilitaForma {
  /** Domande chieste in entrambe le forme. */
  domande: number;
  breve: { comparse: number; totale: number };
  lista: { comparse: number; totale: number };
  /** Differenza media (lista meno breve) in punti percentuali, appaiata per domanda. */
  differenza: number;
  /** Errore standard della differenza, in punti: sotto due errori la differenza è rumore. */
  errore: number;
}

/** Le domande informative («come scegliere…»): spesso senza nomi; si contano sulle risposte che ne fanno almeno uno. */
export interface RisultatoInformativa {
  domande: number;
  risposte: number;
  /** Risposte che fanno almeno un nome di attività. */
  conNomi: number;
  /** Risposte in cui compari. */
  comparse: number;
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
  /** Il telescopio: per livello di zoom geografico. */
  perZoom?: RisultatoZoom[];
  /** Intorno a te: i punti in cui è stata impostata la posizione, sugli assistenti che la accettano. */
  intorno?: { punti: RisultatoPunto[]; motori: EngineId[] };
  perOccasione?: RisultatoOccasione[];
  sensibilitaForma?: SensibilitaForma;
  informativa?: RisultatoInformativa;
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

/** «singolo» è il report una tantum, a pagamento; «gratuito» resta per i report vecchi. */
export type Piano = "singolo" | "gratuito" | "base" | "pro" | "agenzia";
