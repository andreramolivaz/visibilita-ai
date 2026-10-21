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
  Piano,
  CitaChi,
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

const TIPI: TipoDomanda[] = ["generica", "bisogno", "specialita", "nome"];

/**
 * Nomi dei concorrenti, quota di citazioni rispetto al totale e profilo per
 * assistente (quanto ogni motore li cita rispetto alla media: 1 = nella media).
 */
const CONCORRENTI = [
  { nome: "Pizzeria Fratelli Rossi", quota: 0.75, profilo: [1.2, 1.1, 1.25, 0.9, 0.8, 1.0] },
  { nome: "Al Forno Antico", quota: 0.61, profilo: [1.1, 1.0, 1.1, 1.0, 0.9, 0.7] },
  { nome: "La Margherita", quota: 0.45, profilo: [0.9, 1.1, 0.8, 1.2, 1.2, 0.6] },
  { nome: "Trattoria del Borgo", quota: 0.16, profilo: [0.8, 1.2, 0.5, 1.3, 1.4, 0.4] },
];

/**
 * Costruisce un report dai risultati grezzi: tutto ciò che è un numero
 * viene calcolato, così le versioni (esempio Base, test gratuito) tornano.
 */
function costruisci(opzioni: {
  id: string;
  piano: Piano;
  indici: number[];
  ripetizioni: number;
}): Omit<Report, "sintesi" | "termini" | "descrizioneAI" | "descrizioniPerMotore" | "errori" | "azioni" | "metodo" | "andamento"> & {
  tueCitazioni: number;
  totaleRisposte: number;
  domandeInCuiCompari: number;
  pct: number;
} {
  const { id, piano, indici, ripetizioni } = opzioni;
  const domande = indici.map((i) => DOMANDE_ESEMPIO[i]);
  const risultati = indici.map((i) => RISULTATI[i].map(([pos, volte]) => [pos, Math.min(volte, ripetizioni)] as Cella));

  const risposte: Risposta[] = risultati.flatMap((celle, i) =>
    celle.flatMap(([pos, volte], j) =>
      Array.from({ length: ripetizioni }, (_, r) => ({
        domandaId: domande[i].id,
        motore: MOTORI[j],
        ripetizione: r + 1,
        posizione: r < volte ? pos : null,
        citati: [],
        fonti: [],
      })),
    ),
  );

  const righe: RigaDomanda[] = risultati.map((celle, i) => ({
    domanda: domande[i],
    celle: celle.map(([pos, volte], j) => ({
      motore: MOTORI[j],
      posizione: volte > 0 ? pos : null,
      frequenza: `${volte} su ${ripetizioni}`,
      volte,
    })),
  }));

  const perMotore: RisultatoMotore[] = MOTORI.map((m, j) => ({
    motore: m,
    comparse: risultati.filter((celle) => celle[j][1] > 0).length,
    totale: domande.length,
  }));

  const perTipo: RisultatoTipo[] = TIPI.map((tipo) => {
    const ids = domande.filter((d) => d.tipo === tipo).map((d) => d.id);
    const mie = risposte.filter((r) => ids.includes(r.domandaId));
    return { tipo, comparse: mie.filter((r) => r.posizione !== null).length, totale: mie.length, domande: ids.length };
  }).filter((t) => t.domande > 0);

  const totaleRisposte = domande.length * MOTORI.length * ripetizioni;
  const tueCitazioni = risposte.filter((r) => r.posizione !== null).length;
  const domandeInCuiCompari = risultati.filter((celle) => celle.some(([, v]) => v > 0)).length;
  const punteggio = calcolaPunteggio(risposte, MOTORI);

  const concorrenti = [
    ...CONCORRENTI.slice(0, 3).map((c) => ({ nome: c.nome, citazioni: Math.round(c.quota * totaleRisposte), totale: totaleRisposte })),
    { nome: ATTIVITA_ESEMPIO.nome, citazioni: tueCitazioni, totale: totaleRisposte, seiTu: true },
    ...CONCORRENTI.slice(3).map((c) => ({ nome: c.nome, citazioni: Math.round(c.quota * totaleRisposte), totale: totaleRisposte })),
  ];

  // Chi cita chi: domande (su N) in cui ogni assistente cita ciascuna attività.
  const citaChi: CitaChi[] = [
    ...CONCORRENTI.slice(0, 3).map((c) => ({
      nome: c.nome,
      perMotore: Object.fromEntries(MOTORI.map((m, j) => [m, Math.min(domande.length, Math.round(c.quota * c.profilo[j] * domande.length))])),
    })),
    {
      nome: ATTIVITA_ESEMPIO.nome,
      seiTu: true,
      perMotore: Object.fromEntries(MOTORI.map((m, j) => [m, risultati.filter((celle) => celle[j][1] > 0).length])),
    },
    ...CONCORRENTI.slice(3).map((c) => ({
      nome: c.nome,
      perMotore: Object.fromEntries(MOTORI.map((m, j) => [m, Math.min(domande.length, Math.round(c.quota * c.profilo[j] * domande.length))])),
    })),
  ];

  // Testa a testa: entrambi + solo tu = domande in cui compari.
  const senzaDiTe = domande.length - domandeInCuiCompari;
  const testaATesta = [
    { nome: CONCORRENTI[0].nome, loroSenzaTe: senzaDiTe, entrambi: domandeInCuiCompari - 1, tuSenzaLoro: 1 },
    { nome: CONCORRENTI[1].nome, loroSenzaTe: Math.max(0, senzaDiTe - 1), entrambi: domandeInCuiCompari - 2, tuSenzaLoro: 2 },
    { nome: CONCORRENTI[2].nome, loroSenzaTe: Math.max(0, senzaDiTe - 2), entrambi: Math.max(0, domandeInCuiCompari - 4), tuSenzaLoro: Math.min(4, domandeInCuiCompari) },
  ];

  return {
    id,
    piano,
    attivita: ATTIVITA_ESEMPIO,
    data: "2026-10-20",
    motori: MOTORI,
    domande: domande.length,
    ripetizioni,
    punteggio,
    verdetto: calcolaVerdetto(punteggio),
    perMotore,
    perTipo,
    concorrenti,
    testaATesta,
    citaChi,
    contesto: {
      categoria: "pizzerie",
      citta: ATTIVITA_ESEMPIO.citta,
      attivitaAnalizzate: 42,
      mediana: 21,
      percentile: punteggio >= 21 ? 55 : 38,
    },
    righe,
    fonti: [
      { nome: "TheFork", citazioni: Math.round(totaleRisposte * 0.41), ciSei: false, concorrentiPresenti: 4 },
      { nome: "TripAdvisor", citazioni: Math.round(totaleRisposte * 0.35), ciSei: true, concorrentiPresenti: 5 },
      { nome: "Google Maps", citazioni: Math.round(totaleRisposte * 0.32), ciSei: true, concorrentiPresenti: 5 },
      { nome: "L'Eco di Bergamo", citazioni: Math.round(totaleRisposte * 0.11), ciSei: false, concorrentiPresenti: 2 },
      { nome: "Gambero Rosso", citazioni: Math.round(totaleRisposte * 0.09), ciSei: false, concorrentiPresenti: 2 },
      { nome: "Sito ufficiale", citazioni: Math.round(totaleRisposte * 0.07), ciSei: true, concorrentiPresenti: 5 },
      { nome: "Michelin", citazioni: Math.round(totaleRisposte * 0.04), ciSei: false, concorrentiPresenti: 1 },
      { nome: "Instagram", citazioni: Math.round(totaleRisposte * 0.03), ciSei: false, concorrentiPresenti: 3 },
    ],
    tueCitazioni,
    totaleRisposte,
    domandeInCuiCompari,
    pct: Math.round((tueCitazioni / totaleRisposte) * 100),
  };
}

const BASE = costruisci({ id: "esempio", piano: "base", indici: DOMANDE_ESEMPIO.map((_, i) => i), ripetizioni: 3 });
const { tueCitazioni: TUE_CITAZIONI, totaleRisposte: TOTALE_RISPOSTE, domandeInCuiCompari: DOMANDE_IN_CUI_COMPARI, pct: PCT, punteggio: PUNTEGGIO, testaATesta: TESTA_A_TESTA, perTipo: PER_TIPO } = BASE;
const BISOGNO = PER_TIPO.find((t) => t.tipo === "bisogno")!;

export const REPORT_ESEMPIO: Report = {
  ...BASE,
  sintesi: `Compari in ${TUE_CITAZIONI} risposte su ${TOTALE_RISPOSTE} (${PCT}%), in ${DOMANDE_IN_CUI_COMPARI} domande su ${DOMANDE_ESEMPIO.length}. Ti citano quasi solo quando la domanda riguarda il forno a legna o la pizza napoletana: sulle domande generiche compari poco, su quelle per bisogno (asporto, delivery, pranzo, domenica) quasi mai. Gemini e Perplexity ti conoscono; ChatGPT e Google AI, i più usati, quasi non ti nominano. Due assistenti riportano dati sbagliati su di te (categoria e orari del lunedì), e questo ti esclude proprio dalle domande per bisogno.`,
  termini: [
    { termine: "forno a legna", volte: 61, ceLHai: true, volteTue: 3 },
    { termine: "impasto a lunga lievitazione", volte: 38, ceLHai: false, volteTue: 0 },
    { termine: "in centro", volte: 34, ceLHai: true, volteTue: 27 },
    { termine: "pizza napoletana", volte: 29, ceLHai: true, volteTue: 11 },
    { termine: "prenotazione consigliata", volte: 22, ceLHai: false, volteTue: 0 },
    { termine: "ingredienti DOP", volte: 17, ceLHai: false, volteTue: 0 },
    { termine: "dehors", volte: 14, ceLHai: true, volteTue: 6 },
    { termine: "senza glutine", volte: 9, ceLHai: false, volteTue: 0 },
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
      dato: `È la fonte più citata (${BASE.fonti[0].citazioni} risposte su ${TOTALE_RISPOSTE}): 4 concorrenti su 5 ci sono, tu no.`,
      impatto: "alto",
      impattoStimato: 9,
    },
    {
      titolo: "Correggi la categoria su Google e gli orari del lunedì",
      dato: `Gemini ti descrive come «bar pizzeria» e due motori su sei ti danno chiuso il lunedì: i dati sbagliati ti escludono dalle domande per bisogno, dove oggi compari ${BISOGNO.comparse} volte su ${BISOGNO.totale}.`,
      impatto: "alto",
      impattoStimato: 6,
    },
    {
      titolo: "Metti «impasto a lunga lievitazione» e «senza glutine» nel menu sul sito e chiedi recensioni che li citino",
      dato: "Sono termini che i motori usano 38 e 9 volte quando consigliano, e non compaiono mai nelle tue recensioni né sul sito.",
      impatto: "medio",
      impattoStimato: 4,
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

/**
 * Il report del test gratuito: 8 domande (come le genera il profilo:
 * generica, specialità, bisogno, …, nome), 2 ripetizioni, senza sintesi,
 * parole e PDF. Quelli arrivano con il piano Base.
 */
const INDICI_GRATUITO = [0, 4, 3, 1, 6, 9, 2, 14];
const GRATUITO = costruisci({ id: "gratuito", piano: "gratuito", indici: INDICI_GRATUITO, ripetizioni: 2 });

export const REPORT_GRATUITO: Report = {
  ...GRATUITO,
  sintesi: "",
  termini: [],
  descrizioneAI: REPORT_ESEMPIO.descrizioneAI,
  descrizioniPerMotore: REPORT_ESEMPIO.descrizioniPerMotore,
  errori: REPORT_ESEMPIO.errori,
  azioni: REPORT_ESEMPIO.azioni.map((a, i) =>
    i === 1
      ? {
          ...a,
          dato: `Gemini ti descrive come «bar pizzeria» e due motori su sei ti danno chiuso il lunedì: i dati sbagliati ti escludono dalle domande per bisogno, dove oggi compari ${GRATUITO.perTipo.find((t) => t.tipo === "bisogno")?.comparse ?? 0} volte su ${GRATUITO.perTipo.find((t) => t.tipo === "bisogno")?.totale ?? 0}.`,
        }
      : i === 0
        ? { ...a, dato: `È la fonte più citata (${GRATUITO.fonti[0].citazioni} risposte su ${GRATUITO.totaleRisposte}): 4 concorrenti su 5 ci sono, tu no.` }
        : a,
  ),
  metodo: {
    ...REPORT_ESEMPIO.metodo,
    fine: "2026-10-20T10:13:20+02:00",
    note: [
      "Ogni domanda è stata posta 2 volte a ogni motore, con la posizione impostata su Bergamo.",
      "Compari quando il nome, l'indirizzo o il telefono coincidono con la tua scheda Google.",
      "Le risposte dei motori cambiano nel tempo: i numeri sono quelli del giorno e dell'ora della scansione.",
    ],
  },
};
