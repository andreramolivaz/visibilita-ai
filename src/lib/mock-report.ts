import type {
  Report,
  ProfiloAttivita,
  Domanda,
  EngineId,
  Posizione,
  Risposta,
  RigaDomanda,
  RisultatoMotore,
  RisultatoTipo,
  TipoDomanda,
} from "./types";
import { motoriAttivi } from "./engines";
import { punteggio as calcolaPunteggio, verdetto as calcolaVerdetto } from "./score";

/**
 * Report di esempio, inventato: pizzeria a Bergamo, piano Base.
 * Serve per la landing ("un report vero come esempio") e per sviluppare
 * la pagina del report prima che esista la scansione.
 * Punteggio, per motore, per tipo e citazioni sono calcolati dalle
 * risposte con le formule vere, così i numeri tornano sempre.
 */
export const ATTIVITA_ESEMPIO: ProfiloAttivita = {
  id: "esempio",
  nome: "Pizzeria Da Gino",
  citta: "Bergamo",
  zona: "centro",
  indirizzo: "Via XX Settembre 48, 24122 Bergamo",
  telefono: "035 000000",
  sito: "https://pizzeriadagino.example",
  categoriaGoogle: "Pizzeria",
  categoria: "ristorante",
  specialita: ["forno a legna", "pizza napoletana", "senza glutine"],
  servizi: ["asporto", "dehors", "prenotazione telefonica"],
  fasciaPrezzo: "€€",
  lingue: ["italiano", "inglese"],
  prenotazioneOnline: false,
  orari: "Mar–Dom 12:00–14:30, 19:00–23:00",
  rating: 4.5,
  recensioni: 612,
  portaliPresenti: ["Google Maps", "TripAdvisor"],
  portaliAssenti: ["TheFork"],
  incoerenze: ["Il sito indica l'apertura anche il lunedì sera, Google no."],
};

export const DOMANDE_ESEMPIO: Domanda[] = [
  { id: "d1", testo: "Miglior pizzeria a Bergamo", tipo: "generica" },
  { id: "d2", testo: "Pizzeria consigliata in centro a Bergamo", tipo: "generica" },
  { id: "d3", testo: "Pizzeria in Città Alta a Bergamo", tipo: "generica" },
  { id: "d4", testo: "Dove mangiare una buona pizza a Bergamo stasera", tipo: "bisogno" },
  { id: "d5", testo: "Pizzeria con forno a legna a Bergamo", tipo: "specialita", modificabile: true },
  { id: "d6", testo: "Pizzeria senza glutine vicino a me", tipo: "specialita" },
  { id: "d7", testo: "Pizzeria napoletana a Bergamo", tipo: "specialita" },
  { id: "d8", testo: "Pizzeria con dehors a Bergamo", tipo: "bisogno" },
  { id: "d9", testo: "Pizzeria economica a Bergamo", tipo: "bisogno" },
  { id: "d10", testo: "Pizzeria aperta la domenica a Bergamo", tipo: "bisogno" },
  { id: "d11", testo: "Pizzeria con delivery a Bergamo", tipo: "bisogno" },
  { id: "d12", testo: "Pizzeria per famiglie con bambini a Bergamo", tipo: "bisogno" },
  { id: "d13", testo: "Pizza d'asporto a Bergamo", tipo: "bisogno" },
  { id: "d14", testo: "Pizzeria aperta a pranzo a Bergamo", tipo: "bisogno" },
  { id: "d15", testo: "Com'è la Pizzeria Da Gino a Bergamo?", tipo: "nome" },
];

const MOTORI: EngineId[] = motoriAttivi().map((m) => m.id);
const RIPETIZIONI = 3;

/**
 * Per ogni domanda, per ogni motore (nell'ordine di MOTORI):
 * [posizione quando compari, quante volte su 3]. null = mai.
 * Motori: ChatGPT, Gemini, Google AI, Claude, Perplexity, Grok.
 */
type Cella = [Posizione, number];
const RISULTATI: Cella[][] = [
  [[null, 0], [3, 2], [null, 0], [null, 0], [4, 1], [null, 0]], // d1 miglior pizzeria
  [[4, 1], [2, 3], [null, 0], [3, 2], [2, 2], [null, 0]], // d2 consigliata in centro
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // d3 Città Alta
  [[null, 0], [3, 2], [null, 0], [null, 0], [null, 0], [null, 0]], // d4 stasera
  [[2, 2], [1, 3], [null, 0], [2, 3], [1, 3], [3, 1]], // d5 forno a legna
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // d6 senza glutine
  [[null, 0], [2, 2], [null, 0], [3, 1], [2, 2], [null, 0]], // d7 napoletana
  [[null, 0], [4, 1], [null, 0], [null, 0], [5, 1], [null, 0]], // d8 dehors
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // d9 economica
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // d10 domenica
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // d11 delivery
  [[null, 0], [5, 1], [null, 0], [null, 0], [null, 0], [null, 0]], // d12 famiglie
  [[null, 0], [3, 1], [null, 0], [null, 0], [4, 1], [null, 0]], // d13 asporto
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // d14 pranzo
  [[1, 3], [1, 3], [1, 2], [1, 3], [1, 3], [1, 2]], // d15 sul nome
];

const RISPOSTE: Risposta[] = RISULTATI.flatMap((celle, i) =>
  celle.flatMap(([pos, volte], j) =>
    Array.from({ length: RIPETIZIONI }, (_, r) => ({
      domandaId: DOMANDE_ESEMPIO[i].id,
      motore: MOTORI[j],
      ripetizione: r + 1,
      posizione: r < volte ? pos : null,
      citati: [],
      fonti: [],
    })),
  ),
);

const RIGHE: RigaDomanda[] = RISULTATI.map((celle, i) => ({
  domanda: DOMANDE_ESEMPIO[i],
  celle: celle.map(([pos, volte], j) => ({
    motore: MOTORI[j],
    posizione: volte > 0 ? pos : null,
    frequenza: `${volte} su ${RIPETIZIONI}`,
    volte,
  })),
}));

const PER_MOTORE: RisultatoMotore[] = MOTORI.map((m, j) => ({
  motore: m,
  comparse: RISULTATI.filter((celle) => celle[j][1] > 0).length,
  totale: DOMANDE_ESEMPIO.length,
}));

const TIPI: TipoDomanda[] = ["generica", "bisogno", "specialita", "nome"];
const PER_TIPO: RisultatoTipo[] = TIPI.map((tipo) => {
  const indici = DOMANDE_ESEMPIO.map((d, i) => (d.tipo === tipo ? i : -1)).filter((i) => i >= 0);
  const risposte = RISPOSTE.filter((r) => indici.some((i) => DOMANDE_ESEMPIO[i].id === r.domandaId));
  return {
    tipo,
    comparse: risposte.filter((r) => r.posizione !== null).length,
    totale: risposte.length,
    domande: indici.length,
  };
});

const TOTALE_RISPOSTE = DOMANDE_ESEMPIO.length * MOTORI.length * RIPETIZIONI; // 270
const TUE_CITAZIONI = RISPOSTE.filter((r) => r.posizione !== null).length;
const DOMANDE_IN_CUI_COMPARI = RISULTATI.filter((celle) => celle.some(([, v]) => v > 0)).length;
const PUNTEGGIO = calcolaPunteggio(RISPOSTE, MOTORI);
const PCT = Math.round((TUE_CITAZIONI / TOTALE_RISPOSTE) * 100);
const BISOGNO = PER_TIPO.find((t) => t.tipo === "bisogno")!;

/** Confronto diretto: entrambi + solo tu = domande in cui compari (9). */
const TESTA_A_TESTA = [
  { nome: "Pizzeria Fratelli Rossi", loroSenzaTe: 6, entrambi: DOMANDE_IN_CUI_COMPARI - 1, tuSenzaLoro: 1 },
  { nome: "Al Forno Antico", loroSenzaTe: 5, entrambi: DOMANDE_IN_CUI_COMPARI - 2, tuSenzaLoro: 2 },
  { nome: "La Margherita", loroSenzaTe: 4, entrambi: DOMANDE_IN_CUI_COMPARI - 4, tuSenzaLoro: 4 },
];

export const REPORT_ESEMPIO: Report = {
  id: "esempio",
  attivita: ATTIVITA_ESEMPIO,
  data: "2026-10-20",
  motori: MOTORI,
  domande: DOMANDE_ESEMPIO.length,
  ripetizioni: RIPETIZIONI,
  punteggio: PUNTEGGIO,
  verdetto: calcolaVerdetto(PUNTEGGIO),
  sintesi: `Compari in ${TUE_CITAZIONI} risposte su ${TOTALE_RISPOSTE} (${PCT}%), in ${DOMANDE_IN_CUI_COMPARI} domande su ${DOMANDE_ESEMPIO.length}. Ti citano quasi solo quando la domanda riguarda il forno a legna o la pizza napoletana: sulle domande generiche compari poco, su quelle per bisogno (asporto, delivery, pranzo, domenica) quasi mai. Gemini e Perplexity sono i motori che ti conoscono meglio; ChatGPT e Google AI, i più usati, quasi non ti nominano. Pizzeria Fratelli Rossi compare in ${TESTA_A_TESTA[0].loroSenzaTe} domande dove tu non ci sei. La fonte più citata dai motori è TheFork, dove non hai una scheda: è la prima cosa da sistemare.`,
  perMotore: PER_MOTORE,
  perTipo: PER_TIPO,
  concorrenti: [
    { nome: "Pizzeria Fratelli Rossi", citazioni: 203, totale: TOTALE_RISPOSTE },
    { nome: "Al Forno Antico", citazioni: 164, totale: TOTALE_RISPOSTE },
    { nome: "La Margherita", citazioni: 121, totale: TOTALE_RISPOSTE },
    { nome: "Pizzeria Da Gino", citazioni: TUE_CITAZIONI, totale: TOTALE_RISPOSTE, seiTu: true },
    { nome: "Trattoria del Borgo", citazioni: 44, totale: TOTALE_RISPOSTE },
  ],
  testaATesta: TESTA_A_TESTA,
  righe: RIGHE,
  termini: [
    { termine: "forno a legna", volte: 61, ceLHai: true },
    { termine: "impasto a lunga lievitazione", volte: 38, ceLHai: false },
    { termine: "in centro", volte: 34, ceLHai: true },
    { termine: "pizza napoletana", volte: 29, ceLHai: true },
    { termine: "prenotazione consigliata", volte: 22, ceLHai: false },
    { termine: "ingredienti DOP", volte: 17, ceLHai: false },
    { termine: "dehors", volte: 14, ceLHai: true },
    { termine: "senza glutine", volte: 9, ceLHai: false },
  ],
  fonti: [
    { nome: "TheFork", citazioni: 112, ciSei: false },
    { nome: "TripAdvisor", citazioni: 94, ciSei: true },
    { nome: "Google Maps", citazioni: 87, ciSei: true },
    { nome: "L'Eco di Bergamo", citazioni: 31, ciSei: false },
    { nome: "Gambero Rosso", citazioni: 25, ciSei: false },
    { nome: "Sito ufficiale", citazioni: 18, ciSei: true },
    { nome: "Michelin", citazioni: 12, ciSei: false },
    { nome: "Instagram", citazioni: 9, ciSei: false },
  ],
  descrizioneAI:
    "Pizzeria in centro a Bergamo con forno a legna e impasto napoletano, apprezzata per il rapporto qualità-prezzo. Gemini la descrive come «bar pizzeria»; ChatGPT e Grok riportano la chiusura il lunedì.",
  descrizioniPerMotore: [
    { motore: "chatgpt", testo: "Pizzeria tradizionale in centro, forno a legna, chiusa il lunedì. Consigliata la prenotazione nel fine settimana." },
    { motore: "gemini", testo: "Bar pizzeria vicino a Via XX Settembre, con pizze napoletane e un piccolo dehors. Valutazione 4,5 su oltre 600 recensioni." },
    { motore: "google-ai", testo: "Pizzeria a Bergamo con forno a legna. Orari: 12–14:30 e 19–23." },
    { motore: "claude", testo: "Pizzeria napoletana in centro a Bergamo, nota per l'impasto e il forno a legna; prezzi medi, senza prenotazione online." },
    { motore: "perplexity", testo: "Una delle pizzerie più citate per il forno a legna in centro; recensioni positive su TripAdvisor e Google." },
    { motore: "grok", testo: "Pizzeria in centro, forno a legna, chiusa il lunedì. Non risultano menu senza glutine." },
  ],
  errori: [
    { tipo: "categoria", testo: "Gemini ti chiama «bar pizzeria»", motore: "gemini" },
    { tipo: "orari", testo: "ChatGPT e Grok dicono che sei chiuso il lunedì, il tuo sito dice aperto", motore: "chatgpt" },
    { tipo: "altro", testo: "Grok dice che non hai pizze senza glutine: nel tuo menu ci sono", motore: "grok" },
  ],
  azioni: [
    {
      titolo: "Apri la scheda su TheFork",
      dato: `È la fonte più citata (112 risposte su ${TOTALE_RISPOSTE}): 4 concorrenti su 5 ci sono, tu no.`,
      impatto: "alto",
    },
    {
      titolo: "Correggi la categoria su Google e gli orari del lunedì",
      dato: `Gemini ti descrive come «bar pizzeria» e due motori su sei ti danno chiuso il lunedì: i dati sbagliati ti escludono dalle domande per bisogno, dove oggi compari ${BISOGNO.comparse} volte su ${BISOGNO.totale}.`,
      impatto: "alto",
    },
    {
      titolo: "Metti «impasto a lunga lievitazione» e «senza glutine» nel menu sul sito e chiedi recensioni che li citino",
      dato: "Sono termini che i motori usano 38 e 9 volte quando consigliano, e non compaiono mai nelle tue recensioni né sul sito.",
      impatto: "medio",
    },
  ],
  metodo: {
    inizio: "2026-10-20T10:12:00+02:00",
    fine: "2026-10-20T10:14:30+02:00",
    posizione: "Bergamo, Lombardia, Italia",
    lingua: "italiano",
    note: [
      "Ogni domanda è stata posta 3 volte a ogni motore, con la posizione impostata su Bergamo.",
      "Compari quando il nome, l'indirizzo o il telefono coincidono con la tua scheda Google.",
      "Le risposte dei motori cambiano nel tempo: i numeri sono quelli del giorno e dell'ora della scansione.",
    ],
  },
  andamento: [
    { mese: "mag", punteggio: Math.max(0, PUNTEGGIO - 11) },
    { mese: "giu", punteggio: Math.max(0, PUNTEGGIO - 9) },
    { mese: "lug", punteggio: Math.max(0, PUNTEGGIO - 10) },
    { mese: "ago", punteggio: Math.max(0, PUNTEGGIO - 5) },
    { mese: "set", punteggio: Math.max(0, PUNTEGGIO - 3) },
    { mese: "ott", punteggio: PUNTEGGIO },
  ],
};
