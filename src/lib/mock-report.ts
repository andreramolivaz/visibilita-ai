import type { Report, ProfiloAttivita, Domanda, EngineId, Posizione, Risposta, RigaDomanda, RisultatoMotore } from "./types";
import { motoriAttivi } from "./engines";
import { punteggio as calcolaPunteggio, verdetto as calcolaVerdetto } from "./score";

/**
 * Report di esempio, inventato: pizzeria a Bergamo.
 * Serve per la landing ("un report vero come esempio") e per sviluppare
 * la pagina del report prima che esista la scansione.
 * Il punteggio è calcolato dalle risposte con la formula vera.
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
  { id: "d3", testo: "Dove mangiare una buona pizza a Bergamo stasera", tipo: "bisogno" },
  { id: "d4", testo: "Pizzeria con forno a legna a Bergamo", tipo: "specialita", modificabile: true },
  { id: "d5", testo: "Pizzeria senza glutine vicino a me", tipo: "specialita" },
  { id: "d6", testo: "Pizzeria con dehors a Bergamo", tipo: "bisogno" },
  { id: "d7", testo: "Pizzeria economica a Bergamo", tipo: "bisogno" },
  { id: "d8", testo: "Pizzeria napoletana a Bergamo", tipo: "specialita" },
  { id: "d9", testo: "Pizzeria aperta la domenica a Bergamo", tipo: "bisogno" },
  { id: "d10", testo: "Com'è la Pizzeria Da Gino a Bergamo?", tipo: "nome" },
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
  [[null, 0], [3, 2], [null, 0], [null, 0], [4, 1], [null, 0]], // miglior pizzeria
  [[4, 1], [2, 3], [null, 0], [3, 2], [2, 2], [null, 0]], // consigliata in centro
  [[null, 0], [3, 2], [null, 0], [null, 0], [null, 0], [null, 0]], // stasera
  [[2, 2], [1, 3], [null, 0], [2, 3], [1, 3], [3, 1]], // forno a legna
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // senza glutine
  [[null, 0], [4, 1], [null, 0], [null, 0], [5, 1], [null, 0]], // dehors
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // economica
  [[null, 0], [2, 2], [null, 0], [3, 1], [2, 2], [null, 0]], // napoletana
  [[null, 0], [null, 0], [null, 0], [null, 0], [null, 0], [null, 0]], // domenica
  [[1, 3], [1, 3], [1, 2], [1, 3], [1, 3], [1, 2]], // sul nome
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
  })),
}));

const PER_MOTORE: RisultatoMotore[] = MOTORI.map((m, j) => ({
  motore: m,
  comparse: RISULTATI.filter((celle) => celle[j][1] > 0).length,
  totale: DOMANDE_ESEMPIO.length,
}));

const TOTALE_RISPOSTE = DOMANDE_ESEMPIO.length * MOTORI.length * RIPETIZIONI; // 180
const TUE_CITAZIONI = RISPOSTE.filter((r) => r.posizione !== null).length;
const PUNTEGGIO = calcolaPunteggio(RISPOSTE, MOTORI);

export const REPORT_ESEMPIO: Report = {
  id: "esempio",
  attivita: ATTIVITA_ESEMPIO,
  data: "2026-10-20",
  motori: MOTORI,
  domande: DOMANDE_ESEMPIO.length,
  ripetizioni: RIPETIZIONI,
  punteggio: PUNTEGGIO,
  verdetto: calcolaVerdetto(PUNTEGGIO),
  perMotore: PER_MOTORE,
  concorrenti: [
    { nome: "Pizzeria Fratelli Rossi", citazioni: 141, totale: TOTALE_RISPOSTE },
    { nome: "Al Forno Antico", citazioni: 112, totale: TOTALE_RISPOSTE },
    { nome: "La Margherita", citazioni: 86, totale: TOTALE_RISPOSTE },
    { nome: "Pizzeria Da Gino", citazioni: TUE_CITAZIONI, totale: TOTALE_RISPOSTE, seiTu: true },
    { nome: "Trattoria del Borgo", citazioni: 31, totale: TOTALE_RISPOSTE },
  ],
  righe: RIGHE,
  fonti: [
    { nome: "TheFork", citazioni: 74, ciSei: false },
    { nome: "TripAdvisor", citazioni: 63, ciSei: true },
    { nome: "Google Maps", citazioni: 58, ciSei: true },
    { nome: "L'Eco di Bergamo", citazioni: 21, ciSei: false },
    { nome: "Gambero Rosso", citazioni: 17, ciSei: false },
    { nome: "Sito ufficiale", citazioni: 12, ciSei: true },
    { nome: "Michelin", citazioni: 8, ciSei: false },
    { nome: "Instagram", citazioni: 6, ciSei: false },
  ],
  descrizioneAI:
    "Pizzeria in centro a Bergamo con forno a legna e impasto napoletano, apprezzata per il rapporto qualità-prezzo. Gemini la descrive come «bar pizzeria»; ChatGPT e Grok riportano la chiusura il lunedì.",
  errori: [
    { tipo: "categoria", testo: "Gemini ti chiama «bar pizzeria»", motore: "gemini" },
    { tipo: "orari", testo: "ChatGPT e Grok dicono che sei chiuso il lunedì, il tuo sito dice aperto", motore: "chatgpt" },
  ],
  azioni: [
    {
      titolo: "Apri la scheda su TheFork",
      dato: `È la fonte più citata (74 risposte su ${TOTALE_RISPOSTE}): 4 concorrenti su 5 ci sono, tu no.`,
      impatto: "alto",
    },
    {
      titolo: "Correggi la categoria su Google",
      dato: "Gemini ti descrive come «bar pizzeria»: la categoria sbagliata ti esclude dalle domande sulla pizza.",
      impatto: "medio",
    },
    {
      titolo: "Chiedi 10 recensioni che citino «forno a legna»",
      dato: "È il termine più usato nelle risposte dove compari (23 volte); nelle tue recensioni appare 3 volte.",
      impatto: "medio",
    },
  ],
  andamento: [
    { mese: "mag", punteggio: Math.max(0, PUNTEGGIO - 11) },
    { mese: "giu", punteggio: Math.max(0, PUNTEGGIO - 9) },
    { mese: "lug", punteggio: Math.max(0, PUNTEGGIO - 10) },
    { mese: "ago", punteggio: Math.max(0, PUNTEGGIO - 5) },
    { mese: "set", punteggio: Math.max(0, PUNTEGGIO - 3) },
    { mese: "ott", punteggio: PUNTEGGIO },
  ],
};
