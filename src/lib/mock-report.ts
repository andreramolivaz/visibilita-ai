import type { Report, ProfiloAttivita, Domanda, EngineId, Posizione, Risposta, RigaDomanda, RisultatoMotore, RisultatoTipo, TipoDomanda, Piano, CitaChi, CellaDomanda, Formulazione } from "./types";
import { TIPI_DOMANDA } from "./types";
import { motoriAttivi } from "./engines";
import { punteggio as calcolaPunteggio, verdetto as calcolaVerdetto } from "./score";
import { MOTORI_CON_COORDINATE, TIPI_SPONTANEI, informativa, intornoATe, perOccasione, perZoom, sensibilitaForma } from "./stats";
import { generaDomande, profilo } from "./profiles";
import { formaDellaRipetizione } from "./scansione/tipi";

/**
 * Report di esempio: pizzeria a Bergamo. Le domande sono quelle vere del
 * generatore (il telescopio: famiglie, zoom, due forme, punti intorno);
 * le risposte sono simulate in modo deterministico da probabilità per
 * famiglia, assistente, zoom e vincolo, così il report è coerente con sé
 * stesso e ogni numero resta calcolato dalle celle con le formule vere.
 */
export const ATTIVITA_ESEMPIO: ProfiloAttivita = {
  id: "esempio",
  nome: "Pizzeria Da Gino",
  citta: "Bergamo",
  zona: "centro",
  provincia: "Bergamo",
  regione: "Lombardia",
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
  coordinate: { lat: 45.6983, lng: 9.6773 },
};

const CONCORRENTI_NOMI = ["Pizzeria Fratelli Rossi", "Al Forno Antico", "La Margherita"];

const VARIABILI = {
  nome: ATTIVITA_ESEMPIO.nome,
  categoria: ATTIVITA_ESEMPIO.categoriaGoogle,
  citta: ATTIVITA_ESEMPIO.citta,
  zona: ATTIVITA_ESEMPIO.zona,
  provincia: ATTIVITA_ESEMPIO.provincia,
  regione: ATTIVITA_ESEMPIO.regione,
  specialita: ATTIVITA_ESEMPIO.specialita,
  requisiti: ["dehors", "asporto", "parcheggio"],
  concorrenti: CONCORRENTI_NOMI,
};

/** Le domande del piano Base (48) e del report singolo (36), dal generatore. */
export const DOMANDE_BASE: Domanda[] = generaDomande(profilo("ristorante"), VARIABILI, "base");
export const DOMANDE_SINGOLO: Domanda[] = generaDomande(profilo("ristorante"), VARIABILI, "singolo");
/** Per la dimostrazione della scansione. */
export const DOMANDE_ESEMPIO: Domanda[] = DOMANDE_SINGOLO;

const MOTORI: EngineId[] = motoriAttivi().map((m) => m.id);

/* ---------- Simulazione deterministica ---------- */

/** FNV-1a su una stringa → numero in [0, 1). */
function caso(seme: string): number {
  let h = 2166136261;
  for (let i = 0; i < seme.length; i++) {
    h ^= seme.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const BASE_TIPO: Record<TipoDomanda, number> = { generica: 0.2, bisogno: 0.07, specialita: 0.4, requisito: 0.14, prezzo: 0.09, occasione: 0.13, recensioni: 0.24, vicino: 0.28, informativa: 0.06, confronto: 0.85, nome: 0.95, inglese: 0.1 };
const MOLT_MOTORE: Record<string, number> = { chatgpt: 0.55, gemini: 1.7, "google-ai": 0.12, claude: 1.0, perplexity: 1.5, grok: 0.45 };
const MOLT_PUNTO: Record<string, number> = { centro: 1.7, nord: 0.9, est: 1.25, sud: 0.45, ovest: 1.0, "nord-est": 0.8, "nord-ovest": 0.6, "sud-est": 0.7, "sud-ovest": 0.4 };
const MOLT_OCCASIONE: Record<string, number> = { famiglia: 0.6, coppia: 1.4, lavoro: 0.9, gruppo: 0.8, turisti: 1.2, budget: 0.35, subito: 0.7 };
const VINCOLI: [RegExp, number][] = [
  [/forno a legna/i, 1.4],
  [/napoletana/i, 1.1],
  [/senza glutine/i, 0.25],
  [/domenica/i, 0.3],
  [/delivery/i, 0.2],
  [/economic|spendendo poco/i, 0.3],
  [/asporto/i, 0.5],
  [/romantic/i, 1.4],
  [/compleanno|dodici persone/i, 0.6],
  [/stasera/i, 0.9],
  [/bambini/i, 0.6],
  [/parcheggio/i, 0.5],
  [/dehors/i, 0.9],
  [/città alta/i, 0.2],
  [/turist/i, 0.8],
  [/4 stelle|recensioni migliori|affidabil/i, 1.15],
  [/prezz|rapporto qualità|menù a pranzo/i, 0.6],
  [/aperta adesso|dopo le 23|il lunedì/i, 0.5],
];

/** Probabilità che una singola risposta ti citi, per domanda, assistente e forma (a lista: risposte più lunghe, qualche nome in più). */
function probabilita(d: Domanda, motore: EngineId, forma: Formulazione = "breve"): number {
  // Sul nome e nei confronti si compare quasi per forza: l'assistente conta meno.
  const moltMotore = d.tipo === "nome" || d.tipo === "confronto" ? Math.min(1, Math.max(0.8, MOLT_MOTORE[motore] ?? 1)) : (MOLT_MOTORE[motore] ?? 1);
  let p = BASE_TIPO[d.tipo] * moltMotore;
  if (d.zoom === "zona") p *= 1.25;
  // Le coordinate arrivano solo a Google AI e Perplexity: per gli altri «vicino a te» è la città.
  if (d.zoom === "vicino" && d.punto) p *= MOTORI_CON_COORDINATE.includes(motore) ? (MOLT_PUNTO[d.punto.etichetta] ?? 1) : 1.1;
  if (d.occasione) p *= MOLT_OCCASIONE[d.occasione] ?? 1;
  if (forma === "lista") p *= 1.15;
  if (forma === "invertita") p *= 0.9;
  for (const [re, m] of VINCOLI) if (re.test(d.testo)) p *= m;
  return Math.min(0.97, p);
}

/** Posizione quando compari: nome al primo posto, confronto quasi sempre secondo, altrimenti tra 1° e 5°. */
function posizione(d: Domanda, motore: EngineId, seme: string): Posizione {
  if (d.tipo === "nome") return 1;
  if (d.tipo === "confronto") return caso(`${seme}:pos`) < 0.2 ? 1 : 2;
  const u = caso(`${seme}:pos`);
  const spinta = motore === "gemini" || motore === "perplexity" ? 0.12 : 0;
  const soglie = [0.12 + spinta, 0.42 + spinta, 0.72, 0.9];
  if (u < soglie[0]) return 1;
  if (u < soglie[1]) return 2;
  if (u < soglie[2]) return 3;
  if (u < soglie[3]) return 4;
  return 5;
}

type PerForma = NonNullable<CellaDomanda["perForma"]>;
type Cella = [Posizione, number, PerForma, number];

/** Per ogni domanda, per ogni motore: posizione quando compari, quante volte su `ripetizioni`, le volte per forma, le risposte con almeno un nome. */
function simula(domande: Domanda[], ripetizioni: number): Cella[][] {
  return domande.map((d) =>
    MOTORI.map((m) => {
      let volte = 0;
      let conNomi = 0;
      const perForma: PerForma = {};
      for (let r = 1; r <= ripetizioni; r++) {
        const forma = formaDellaRipetizione(d, r);
        const f = perForma[forma] ?? { volte: 0, totale: 0 };
        f.totale++;
        const citato = caso(`${d.testo}|${m}|${r - 1}`) < probabilita(d, m, forma);
        if (citato) {
          volte++;
          f.volte++;
        }
        perForma[forma] = f;
        // Le informative spesso non fanno nomi; le altre quasi sempre.
        if (citato || caso(`${d.testo}|${m}|${r}|nomi`) < (d.tipo === "informativa" ? 0.45 : 0.96)) conNomi++;
      }
      return [volte > 0 ? posizione(d, m, `${d.testo}|${m}`) : null, volte, perForma, conNomi] as Cella;
    }),
  );
}

/** Concorrenti distinti citati per domanda: 0 = domanda «libera». */
function concorrentiPerDomanda(d: Domanda): number {
  if (d.tipo === "nome") return 0;
  if (d.tipo === "confronto") return 1;
  const u = caso(`${d.testo}|conc`);
  if (/senza glutine|città alta|delivery/i.test(d.testo)) return u < 0.6 ? 0 : 1;
  if (d.zoom === "zona" || d.tipo === "generica") return u < 0.5 ? 4 : 3;
  return u < 0.1 ? 0 : u < 0.4 ? 2 : 3;
}

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
 * viene calcolato, così le versioni (esempio Base, report singolo) tornano.
 */
function costruisci(opzioni: { id: string; piano: Piano; domande: Domanda[]; ripetizioni: number }): Omit<
  Report,
  "sintesi" | "termini" | "descrizioneAI" | "descrizioniPerMotore" | "errori" | "azioni" | "metodo" | "andamento"
> & {
  tueCitazioni: number;
  totaleRisposte: number;
  domandeInCuiCompari: number;
} {
  const { id, piano, domande, ripetizioni } = opzioni;
  const risultati = simula(domande, ripetizioni);

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
    celle: celle.map(([pos, volte, perForma, conNomi], j) => ({
      motore: MOTORI[j],
      posizione: volte > 0 ? pos : null,
      frequenza: `${volte} su ${ripetizioni}`,
      volte,
      perForma,
      conNomi,
    })),
    concorrentiCitati: concorrentiPerDomanda(domande[i]),
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

  const perTipo: RisultatoTipo[] = TIPI_DOMANDA.map((tipo) => {
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
  const perMotoreDi = (c: (typeof CONCORRENTI)[number]) => Object.fromEntries(MOTORI.map((m, j) => [m, Math.min(nSpont, Math.round(c.quota * c.profilo[j] * nSpont))]));
  const citaChi: CitaChi[] = [
    ...CONCORRENTI.slice(0, 3).map((c) => ({ nome: c.nome, perMotore: perMotoreDi(c) })),
    { nome: ATTIVITA_ESEMPIO.nome, seiTu: true, perMotore: Object.fromEntries(MOTORI.map((m, j) => [m, risultatiSpontanei.filter((celle) => celle[j][1] > 0).length])) },
    ...CONCORRENTI.slice(3).map((c) => ({ nome: c.nome, perMotore: perMotoreDi(c) })),
  ];

  // Testa a testa (domande spontanee): entrambi + solo tu = domande in cui compari.
  const senzaDiTe = nSpont - domandeInCuiCompari;
  const testaATesta = [
    { nome: CONCORRENTI[0].nome, loroSenzaTe: senzaDiTe, entrambi: Math.max(0, domandeInCuiCompari - 1), tuSenzaLoro: 1 },
    { nome: CONCORRENTI[1].nome, loroSenzaTe: Math.max(0, senzaDiTe - 1), entrambi: Math.max(0, domandeInCuiCompari - 2), tuSenzaLoro: 2 },
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
    perZoom: perZoom(righe, ripetizioni),
    intorno: new Set(domande.filter((d) => d.punto).map((d) => d.punto!.etichetta)).size > 1 ? { punti: intornoATe(righe, ripetizioni), motori: MOTORI_CON_COORDINATE } : undefined,
    perOccasione: perOccasione(righe, ripetizioni),
    sensibilitaForma: sensibilitaForma(righe),
    informativa: informativa(righe, ripetizioni),
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

const BASE = costruisci({ id: "esempio", piano: "base", domande: DOMANDE_BASE, ripetizioni: 3 });
const { tueCitazioni: TUE_CITAZIONI, domandeInCuiCompari: DOMANDE_IN_CUI_COMPARI, punteggio: PUNTEGGIO, perTipo: PER_TIPO } = BASE;
const PCT = Math.round((TUE_CITAZIONI / BASE.concorrenti[0].totale) * 100);
const BISOGNO = PER_TIPO.find((t) => t.tipo === "bisogno")!;
const QUOTA_VOCE_TUA = Math.round((TUE_CITAZIONI / (BASE.citazioniTotali ?? 1)) * 100);
const QUOTA_VOCE_PRIMO = Math.round((BASE.concorrenti[0].citazioni / (BASE.citazioniTotali ?? 1)) * 100);

const TERMINI = [
  { termine: "forno a legna", volte: 61, ceLHai: true, volteTue: 3 },
  { termine: "impasto a lunga lievitazione", volte: 38, ceLHai: false, volteTue: 0 },
  { termine: "in centro", volte: 34, ceLHai: true, volteTue: 27 },
  { termine: "pizza napoletana", volte: 29, ceLHai: true, volteTue: 11 },
  { termine: "prenotazione consigliata", volte: 22, ceLHai: false, volteTue: 0 },
  { termine: "ingredienti DOP", volte: 17, ceLHai: false, volteTue: 0 },
  { termine: "dehors", volte: 14, ceLHai: true, volteTue: 6 },
  { termine: "senza glutine", volte: 9, ceLHai: false, volteTue: 0 },
];

const DESCRIZIONI: Report["descrizioniPerMotore"] = [
  { motore: "chatgpt", testo: "Pizzeria tradizionale in centro, forno a legna, chiusa il lunedì. Consigliata la prenotazione nel fine settimana.", tono: "positivo", datiCorretti: false },
  { motore: "gemini", testo: "Bar pizzeria vicino a Via XX Settembre, con pizze napoletane e un piccolo dehors. Valutazione 4,5 su oltre 600 recensioni.", tono: "neutro", datiCorretti: false },
  { motore: "google-ai", testo: "Pizzeria a Bergamo con forno a legna. Orari: 12–14:30 e 19–23.", tono: "neutro", datiCorretti: true },
  { motore: "claude", testo: "Pizzeria napoletana in centro a Bergamo, nota per l'impasto e il forno a legna; prezzi medi, senza prenotazione online.", tono: "positivo", datiCorretti: true },
  { motore: "perplexity", testo: "Una delle pizzerie più citate per il forno a legna in centro; recensioni positive su TripAdvisor e Google.", tono: "positivo", datiCorretti: true },
  { motore: "grok", testo: "Pizzeria in centro, forno a legna, chiusa il lunedì. Non risultano menu senza glutine.", tono: "neutro", datiCorretti: false },
];

const ERRORI: Report["errori"] = [
  { tipo: "categoria", testo: "Gemini ti chiama «bar pizzeria»", motore: "gemini" },
  { tipo: "orari", testo: "ChatGPT e Grok dicono che sei chiuso il lunedì, il tuo sito dice aperto", motore: "chatgpt" },
  { tipo: "altro", testo: "Grok dice che non hai pizze senza glutine: nel tuo menu ci sono", motore: "grok" },
];

const azioniPer = (r: ReturnType<typeof costruisci>): Report["azioni"] => {
  const bisogno = r.perTipo.find((t) => t.tipo === "bisogno");
  return [
    {
      titolo: "Apri la scheda su TheFork",
      dato: `È la fonte più citata (${r.fonti[0].citazioni} risposte su ${r.totaleRisposte}): 4 concorrenti su 5 ci sono, tu no.`,
      impatto: "alto",
      impattoStimato: 9,
    },
    {
      titolo: "Correggi la categoria su Google e gli orari del lunedì",
      dato: `Gemini ti descrive come «bar pizzeria» e due motori su sei ti danno chiuso il lunedì: i dati sbagliati ti escludono dalle domande per bisogno, dove oggi compari ${bisogno?.comparse ?? 0} volte su ${bisogno?.totale ?? 0}.`,
      impatto: "alto",
      impattoStimato: 6,
    },
    {
      titolo: "Metti «impasto a lunga lievitazione» e «senza glutine» nel menu sul sito e chiedi recensioni che li citino",
      dato: "Sono termini che i motori usano 38 e 9 volte quando consigliano, e non compaiono mai nelle tue recensioni né sul sito.",
      impatto: "medio",
      impattoStimato: 4,
    },
  ];
};

export const REPORT_ESEMPIO: Report = {
  ...BASE,
  sintesi: `Compari in ${TUE_CITAZIONI} risposte su ${BASE.concorrenti[0].totale} alle ${BASE.domandeSpontanee} domande in cui il cliente non fa il tuo nome (${PCT}%), in ${DOMANDE_IN_CUI_COMPARI} domande su ${BASE.domandeSpontanee}. Quota di voce ${QUOTA_VOCE_TUA}%, contro il ${QUOTA_VOCE_PRIMO}% di Pizzeria Fratelli Rossi. Ti citano sulle domande di specialità (forno a legna, pizza napoletana), quasi mai su quelle per bisogno (${BISOGNO.comparse} risposte su ${BISOGNO.totale}). ChatGPT e Google AI, 29,6 milioni di utenti in due, ti nominano quasi solo quando il cliente fa il tuo nome. Tre dati sbagliati su di te: categoria, orari del lunedì, senza glutine.`,
  termini: TERMINI,
  descrizioneAI:
    "Pizzeria in centro a Bergamo con forno a legna e impasto napoletano, apprezzata per il rapporto qualità-prezzo. Gemini la descrive come «bar pizzeria»; ChatGPT e Grok riportano la chiusura il lunedì.",
  descrizioniPerMotore: DESCRIZIONI,
  errori: ERRORI,
  azioni: azioniPer(BASE),
  metodo: {
    inizio: "2026-10-18T10:12:00+02:00",
    fine: "2026-10-20T10:14:30+02:00",
    posizione: "Bergamo, Lombardia, Italia",
    lingua: "italiano",
    canale: "interfacce ufficiali (API), località impostata, senza memoria",
    note: [
      "Ogni domanda è stata posta 3 volte a ogni assistente, in 3 giorni diversi (18, 19 e 20 ottobre) alla stessa ora, perché le risposte cambiano più tra un giorno e l'altro che tra un minuto e l'altro.",
      "Compari quando il nome, l'indirizzo o il telefono coincidono con la tua scheda Google.",
      "Nelle domande vicino a te la posizione è stata impostata in cinque punti intorno all'attività (centro e 1,2 km a nord, est, sud, ovest) sugli assistenti che accettano le coordinate: Gemini, Google AI, Perplexity. Gli altri ricevono la città.",
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
 * Il report singolo: 36 domande, 2 ripetizioni nella stessa giornata.
 * Stesse sezioni del piano Base; le parole che usano e il PDF ci sono.
 */
const SINGOLO = costruisci({ id: "singolo", piano: "singolo", domande: DOMANDE_SINGOLO, ripetizioni: 2 });

export const REPORT_SINGOLO: Report = {
  ...SINGOLO,
  sintesi: "",
  termini: TERMINI,
  descrizioneAI: REPORT_ESEMPIO.descrizioneAI,
  descrizioniPerMotore: DESCRIZIONI,
  errori: ERRORI,
  azioni: azioniPer(SINGOLO),
  metodo: {
    ...REPORT_ESEMPIO.metodo,
    inizio: "2026-10-20T10:12:00+02:00",
    fine: "2026-10-20T10:19:40+02:00",
    note: [
      "Ogni domanda è stata posta 2 volte a ogni assistente, con la posizione impostata su Bergamo. Nell'abbonamento le ripetizioni sono in giorni diversi.",
      "Compari quando il nome, l'indirizzo o il telefono coincidono con la tua scheda Google.",
      "Nelle domande vicino a te la posizione è stata impostata in cinque punti intorno all'attività sugli assistenti che accettano le coordinate: Gemini, Google AI, Perplexity.",
      "Le risposte degli assistenti cambiano nel tempo: i numeri sono quelli del giorno e dell'ora della scansione.",
    ],
  },
};

/** Compatibilità con i link vecchi del test gratuito. */
export const REPORT_GRATUITO: Report = REPORT_SINGOLO;
