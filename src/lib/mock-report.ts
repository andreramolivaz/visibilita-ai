import type { Report, ProfiloAttivita, Domanda } from "./types";

/**
 * Report di esempio, inventato: pizzeria a Bergamo.
 * Serve per la landing ("un report vero come esempio") e per sviluppare
 * la pagina del report prima che esista la scansione.
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

export const REPORT_ESEMPIO: Report = {
  id: "esempio",
  attivita: ATTIVITA_ESEMPIO,
  data: "2026-10-20",
  motori: ["chatgpt", "gemini", "google-ai"],
  domande: 10,
  ripetizioni: 3,
  punteggio: 23,
  verdetto: "Poco visibile",
  perMotore: [
    { motore: "chatgpt", comparse: 2, totale: 10 },
    { motore: "gemini", comparse: 6, totale: 10 },
    { motore: "google-ai", comparse: 0, totale: 10 },
  ],
  concorrenti: [
    { nome: "Pizzeria Fratelli Rossi", citazioni: 71, totale: 90 },
    { nome: "Al Forno Antico", citazioni: 58, totale: 90 },
    { nome: "La Margherita", citazioni: 44, totale: 90 },
    { nome: "Pizzeria Da Gino", citazioni: 21, totale: 90, seiTu: true },
    { nome: "Trattoria del Borgo", citazioni: 17, totale: 90 },
  ],
  righe: [
    {
      domanda: DOMANDE_ESEMPIO[0],
      celle: [
        { motore: "chatgpt", posizione: null, frequenza: "0 su 3" },
        { motore: "gemini", posizione: 3, frequenza: "2 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[1],
      celle: [
        { motore: "chatgpt", posizione: 4, frequenza: "1 su 3" },
        { motore: "gemini", posizione: 2, frequenza: "3 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[2],
      celle: [
        { motore: "chatgpt", posizione: null, frequenza: "0 su 3" },
        { motore: "gemini", posizione: 3, frequenza: "2 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[3],
      celle: [
        { motore: "chatgpt", posizione: 2, frequenza: "2 su 3" },
        { motore: "gemini", posizione: 1, frequenza: "3 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[4],
      celle: [
        { motore: "chatgpt", posizione: null, frequenza: "0 su 3" },
        { motore: "gemini", posizione: null, frequenza: "0 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[5],
      celle: [
        { motore: "chatgpt", posizione: null, frequenza: "0 su 3" },
        { motore: "gemini", posizione: 4, frequenza: "1 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[6],
      celle: [
        { motore: "chatgpt", posizione: null, frequenza: "0 su 3" },
        { motore: "gemini", posizione: null, frequenza: "0 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[7],
      celle: [
        { motore: "chatgpt", posizione: null, frequenza: "0 su 3" },
        { motore: "gemini", posizione: 2, frequenza: "2 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[8],
      celle: [
        { motore: "chatgpt", posizione: null, frequenza: "0 su 3" },
        { motore: "gemini", posizione: null, frequenza: "0 su 3" },
        { motore: "google-ai", posizione: null, frequenza: "0 su 3" },
      ],
    },
    {
      domanda: DOMANDE_ESEMPIO[9],
      celle: [
        { motore: "chatgpt", posizione: 1, frequenza: "3 su 3" },
        { motore: "gemini", posizione: 1, frequenza: "3 su 3" },
        { motore: "google-ai", posizione: 1, frequenza: "2 su 3" },
      ],
    },
  ],
  fonti: [
    { nome: "TheFork", citazioni: 38, ciSei: false },
    { nome: "TripAdvisor", citazioni: 31, ciSei: true },
    { nome: "Google Maps", citazioni: 27, ciSei: true },
    { nome: "L'Eco di Bergamo", citazioni: 12, ciSei: false },
    { nome: "Gambero Rosso", citazioni: 9, ciSei: false },
    { nome: "Sito ufficiale", citazioni: 6, ciSei: true },
    { nome: "Michelin", citazioni: 4, ciSei: false },
    { nome: "Instagram", citazioni: 3, ciSei: false },
  ],
  descrizioneAI:
    "Pizzeria in centro a Bergamo con forno a legna e impasto napoletano, apprezzata per il rapporto qualità-prezzo. Gemini la descrive come «bar pizzeria» e riporta la chiusura il lunedì.",
  errori: [
    { tipo: "categoria", testo: "Gemini ti chiama «bar pizzeria»", motore: "gemini" },
    { tipo: "orari", testo: "ChatGPT dice che sei chiuso il lunedì, il tuo sito dice aperto", motore: "chatgpt" },
  ],
  azioni: [
    {
      titolo: "Apri la scheda su TheFork",
      dato: "È la fonte più citata (38 risposte su 90): 4 concorrenti su 5 ci sono, tu no.",
      impatto: "alto",
    },
    {
      titolo: "Correggi la categoria su Google",
      dato: "Gemini ti descrive come «bar pizzeria»: la categoria sbagliata ti esclude dalle domande sulla pizza.",
      impatto: "medio",
    },
    {
      titolo: "Chiedi 10 recensioni che citino «forno a legna»",
      dato: "È il termine più usato nelle risposte dove compari (12 volte); nelle tue recensioni appare 3 volte.",
      impatto: "medio",
    },
  ],
  andamento: [
    { mese: "mag", punteggio: 12 },
    { mese: "giu", punteggio: 14 },
    { mese: "lug", punteggio: 13 },
    { mese: "ago", punteggio: 18 },
    { mese: "set", punteggio: 20 },
    { mese: "ott", punteggio: 23 },
  ],
};
