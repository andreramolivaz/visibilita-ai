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
import { TIPI_DOMANDA } from "./types";
import { motoriAttivi } from "./engines";
import { punteggio as calcolaPunteggio, verdetto as calcolaVerdetto } from "./score";
import { TIPI_SPONTANEI } from "./stats";

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
  { id: "d8", testo: "Pizzeria con dehors a Bergamo", tipo: "requisito" },
  { id: "d9", testo: "Pizzeria economica a Bergamo", tipo: "bisogno" },
  { id: "d10", testo: "Pizzeria aperta la domenica a Bergamo", tipo: "bisogno" },
  { id: "d11", testo: "Pizzeria con delivery a Bergamo", tipo: "bisogno" },
  { id: "d12", testo: "Pizzeria per famiglie con bambini a Bergamo", tipo: "bisogno" },
  { id: "d13", testo: "Pizza d'asporto a Bergamo", tipo: "bisogno" },
  { id: "d14", testo: "Meglio Pizzeria Da Gino o Pizzeria Fratelli Rossi a Bergamo?", tipo: "confronto", concorrente: "Pizzeria Fratelli Rossi" },
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
  [[2, 3], [2, 3], [2, 2], [2, 3], [1, 2], [2, 2]], // d14 confronto con Fratelli Rossi: quasi sempre secondo
  [[1, 3], [1, 3], [1, 2], [1, 3], [1, 3], [1, 2]], // d15 sul nome
];

/**
 * Per ogni domanda, quanti concorrenti distinti (tra i cinque più citati)
 * compaiono nelle risposte di tutti gli assistenti. 0 = la domanda è «libera»:
 * nessuna attività viene consigliata in modo riconoscibile.
 */
const CONCORRENTI_PER_DOMANDA = [3, 4, 3, 3, 4, 0, 3, 2, 2, 3, 1, 2, 2, 1, 0];

const TIPI: TipoDomanda[] = TIPI_DOMANDA;

/**
 * Nomi dei concorrenti, quota di citazioni rispetto al totale delle risposte,
 * quota delle loro citazioni nei primi tre posti e profilo per assistente
 * (quanto ogni motore li cita rispetto alla media: 1 = nella media).
 */
const CONCORRENTI = [
  { nome: "Pizzeria Fratelli Rossi", quota: 0.75, primiTre: 0.82, profilo: [1.2, 1.1, 1.25, 0.9, 0.8, 1.0] },
  { nome: "Al Forno Antico", quota: 0.61, primiTre: 0.71, profilo: [1.1, 1.0, 1.1, 1.0, 0.9, 0.7] },
  { nome: "La Margherita", quota: 0.45, primiTre: 0.56, profilo: [0.9, 1.1, 0.8, 1.2, 1.2, 0.6] },
  { nome: "Trattoria del Borgo", quota: 0.16, primiTre: 0.3, profilo: [0.8, 1.2, 0.5, 1.3, 1.4, 0.4] },
];

/** Citazioni di attività fuori dai cinque nomi più citati, in quota del totale delle risposte. */
const QUOTA_ALTRE_ATTIVITA = 0.39;

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
    concorrentiCitati: CONCORRENTI_PER_DOMANDA[indici[i]],
  }));

  // Le domande spontanee (senza il tuo nome) sono la base di punteggio, numeri chiave e concorrenti.
  const spontanee = domande.map((d, i) => [d, i] as const).filter(([d]) => TIPI_SPONTANEI.includes(d.tipo));
  const idsSpontanee = spontanee.map(([d]) => d.id);
  const risultatiSpontanei = spontanee.map(([, i]) => risultati[i]);
  const risposteSpontanee = risposte.filter((r) => idsSpontanee.includes(r.domandaId));

  const perMotore: RisultatoMotore[] = MOTORI.map((m, j) => ({
    motore: m,
    comparse: risultatiSpontanei.filter((celle) => celle[j][1] > 0).length,
    totale: spontanee.length,
  }));

  const perTipo: RisultatoTipo[] = TIPI.map((tipo) => {
    const ids = domande.filter((d) => d.tipo === tipo).map((d) => d.id);
    const mie = risposte.filter((r) => ids.includes(r.domandaId));
    return { tipo, comparse: mie.filter((r) => r.posizione !== null).length, totale: mie.length, domande: ids.length };
  }).filter((t) => t.domande > 0);

  const totaleRisposte = domande.length * MOTORI.length * ripetizioni;
  const totaleSpontanee = spontanee.length * MOTORI.length * ripetizioni;
  const tueCitazioni = risposteSpontanee.filter((r) => r.posizione !== null).length;
  const domandeInCuiCompari = risultatiSpontanei.filter((celle) => celle.some(([, v]) => v > 0)).length;
  const punteggio = calcolaPunteggio(risposteSpontanee, MOTORI);

  const concorrente = (c: (typeof CONCORRENTI)[number]) => {
    const citazioni = Math.round(c.quota * totaleSpontanee);
    return { nome: c.nome, citazioni, totale: totaleSpontanee, primiTre: Math.round(citazioni * c.primiTre) };
  };
  const tuePrimiTre = risposteSpontanee.filter((r) => r.posizione !== null && r.posizione <= 3).length;
  const concorrenti = [
    ...CONCORRENTI.slice(0, 3).map(concorrente),
    { nome: ATTIVITA_ESEMPIO.nome, citazioni: tueCitazioni, totale: totaleSpontanee, primiTre: tuePrimiTre, seiTu: true },
    ...CONCORRENTI.slice(3).map(concorrente),
  ].sort((a, b) => b.citazioni - a.citazioni);
  const citazioniTotali = concorrenti.reduce((acc, c) => acc + c.citazioni, 0) + Math.round(QUOTA_ALTRE_ATTIVITA * totaleSpontanee);

  // Chi cita chi: domande spontanee (su N) in cui ogni assistente cita ciascuna attività.
  const nSpont = spontanee.length;
  const citaChi: CitaChi[] = [
    ...CONCORRENTI.slice(0, 3).map((c) => ({
      nome: c.nome,
      perMotore: Object.fromEntries(MOTORI.map((m, j) => [m, Math.min(nSpont, Math.round(c.quota * c.profilo[j] * nSpont))])),
    })),
    {
      nome: ATTIVITA_ESEMPIO.nome,
      seiTu: true,
      perMotore: Object.fromEntries(MOTORI.map((m, j) => [m, risultatiSpontanei.filter((celle) => celle[j][1] > 0).length])),
    },
    ...CONCORRENTI.slice(3).map((c) => ({
      nome: c.nome,
      perMotore: Object.fromEntries(MOTORI.map((m, j) => [m, Math.min(nSpont, Math.round(c.quota * c.profilo[j] * nSpont))])),
    })),
  ];

  // Testa a testa (domande spontanee): entrambi + solo tu = domande in cui compari.
  const senzaDiTe = nSpont - domandeInCuiCompari;
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
    domandeSpontanee: spontanee.length,
    ripetizioni,
    punteggio,
    verdetto: calcolaVerdetto(punteggio),
    perMotore,
    perTipo,
    concorrenti,
    citazioniTotali,
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
  };
}

const BASE = costruisci({ id: "esempio", piano: "base", indici: DOMANDE_ESEMPIO.map((_, i) => i), ripetizioni: 3 });
const { tueCitazioni: TUE_CITAZIONI, totaleRisposte: TOTALE_RISPOSTE, domandeInCuiCompari: DOMANDE_IN_CUI_COMPARI, punteggio: PUNTEGGIO, perTipo: PER_TIPO } = BASE;
const PCT = Math.round((TUE_CITAZIONI / BASE.concorrenti[0].totale) * 100);
const BISOGNO = PER_TIPO.find((t) => t.tipo === "bisogno")!;
const QUOTA_VOCE_TUA = Math.round((TUE_CITAZIONI / (BASE.citazioniTotali ?? 1)) * 100);
const QUOTA_VOCE_PRIMO = Math.round((BASE.concorrenti[0].citazioni / (BASE.citazioniTotali ?? 1)) * 100);

export const REPORT_ESEMPIO: Report = {
  ...BASE,
  sintesi: `Compari in ${TUE_CITAZIONI} risposte su ${BASE.concorrenti[0].totale} alle ${BASE.domandeSpontanee} domande in cui il cliente non fa il tuo nome (${PCT}%), in ${DOMANDE_IN_CUI_COMPARI} domande su ${BASE.domandeSpontanee}. Quota di voce ${QUOTA_VOCE_TUA}%, contro il ${QUOTA_VOCE_PRIMO}% di Pizzeria Fratelli Rossi. Ti citano sulle domande di specialità (forno a legna, pizza napoletana), quasi mai su quelle per bisogno (${BISOGNO.comparse} risposte su ${BISOGNO.totale}). ChatGPT e Google AI, 29,6 milioni di utenti in due, ti nominano quasi solo quando il cliente fa il tuo nome. Tre dati sbagliati su di te: categoria, orari del lunedì, senza glutine.`,
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
    { motore: "chatgpt", testo: "Pizzeria tradizionale in centro, forno a legna, chiusa il lunedì. Consigliata la prenotazione nel fine settimana.", tono: "positivo", datiCorretti: false },
    { motore: "gemini", testo: "Bar pizzeria vicino a Via XX Settembre, con pizze napoletane e un piccolo dehors. Valutazione 4,5 su oltre 600 recensioni.", tono: "neutro", datiCorretti: false },
    { motore: "google-ai", testo: "Pizzeria a Bergamo con forno a legna. Orari: 12–14:30 e 19–23.", tono: "neutro", datiCorretti: true },
    { motore: "claude", testo: "Pizzeria napoletana in centro a Bergamo, nota per l'impasto e il forno a legna; prezzi medi, senza prenotazione online.", tono: "positivo", datiCorretti: true },
    { motore: "perplexity", testo: "Una delle pizzerie più citate per il forno a legna in centro; recensioni positive su TripAdvisor e Google.", tono: "positivo", datiCorretti: true },
    { motore: "grok", testo: "Pizzeria in centro, forno a legna, chiusa il lunedì. Non risultano menu senza glutine.", tono: "neutro", datiCorretti: false },
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
    inizio: "2026-10-18T10:12:00+02:00",
    fine: "2026-10-20T10:14:30+02:00",
    posizione: "Bergamo, Lombardia, Italia",
    lingua: "italiano",
    canale: "interfacce ufficiali (API), località impostata, senza memoria",
    note: [
      "Ogni domanda è stata posta 3 volte a ogni assistente, in 3 giorni diversi (18, 19 e 20 ottobre) alla stessa ora, perché le risposte cambiano più tra un giorno e l'altro che tra un minuto e l'altro.",
      "Compari quando il nome, l'indirizzo o il telefono coincidono con la tua scheda Google.",
      "Le risposte degli assistenti cambiano nel tempo: i numeri sono quelli dei giorni della scansione. Un confronto tra due mesi ha senso solo se gli intervalli non si sovrappongono.",
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
 * Il report del test gratuito: 8 domande nell'ordine del generatore
 * (generica, specialità, bisogno, requisito, confronto, generica, bisogno, nome),
 * 2 ripetizioni, senza parole e PDF. Quelli arrivano con il piano Base.
 */
const INDICI_GRATUITO = [0, 4, 3, 7, 13, 1, 9, 14];
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
    inizio: "2026-10-20T10:12:00+02:00",
    fine: "2026-10-20T10:13:20+02:00",
    note: [
      "Ogni domanda è stata posta 2 volte a ogni assistente, con la posizione impostata su Bergamo. Nell'abbonamento le ripetizioni sono 3, in giorni diversi.",
      "Compari quando il nome, l'indirizzo o il telefono coincidono con la tua scheda Google.",
      "Le risposte degli assistenti cambiano nel tempo: i numeri sono quelli del giorno e dell'ora della scansione.",
    ],
  },
};
