import type { Domanda, OrigineDomanda, PuntoVicino, TipoDomanda, Zoom } from "./types";
import { PROFILI_JSON } from "@/data/profiles";

export interface AzioneProfilo {
  codice: string;
  titolo: string;
  quando: string;
}

export type FamigliaProfilo = "locale" | "b2b" | "professionista" | "sanita" | "ricettivo" | "cultura";

export interface ProfiloCategoria {
  id: string;
  nome: string;
  /** Imprese attive in Italia (ISTAT-ASIA 2023): ordina la copertura. 0 = non applicabile. */
  imprese: number;
  fonteImprese?: string;
  categorieGoogle: string[];
  famiglia: FamigliaProfilo;
  /** Le domande si fanno per provincia e regione, con requisiti e certificazioni. */
  b2b: boolean;
  /** Ha senso porre anche domande in inglese (export, turismo). */
  inglese: boolean;
  generatoDaAI?: boolean;
  domande: {
    generica: string[];
    bisogno: string[];
    specialita: string[];
    /** Servizi accessori ({requisito} dalla scheda e dalle ricerche), orari e urgenza. */
    requisito?: string[];
    /** Prezzo e convenienza: il compito più frequente di chi decide con l'AI in Italia (IAB 2026). */
    prezzo?: string[];
    /** Chi chiede e perché: template con l'occasione già dentro, in coppia con la sua etichetta. */
    occasione?: { testo: string; etichetta: string }[];
    /** Recensioni e affidabilità: voto, reputazione, serietà. */
    recensioni?: string[];
    /** Vicino a te: la posizione viene impostata in punti diversi intorno all'attività. */
    vicino?: string[];
    /** Informative («come scegliere…», «quanto costa in media…»): spesso senza nomi, contate a parte. */
    informativa?: string[];
    confronto?: string[];
    nome: string[];
    inglese?: string[];
  };
  fonti: string[];
  metriche: string[];
  azioni: AzioneProfilo[];
  nota?: string;
}

export const PROFILI: ProfiloCategoria[] = PROFILI_JSON as ProfiloCategoria[];

const ALTRO = PROFILI.find((p) => p.id === "altro")!;

export function profilo(id: string): ProfiloCategoria {
  return PROFILI.find((p) => p.id === id) ?? ALTRO;
}

/** Trova il profilo dalla categoria Google, altrimenti "altro". */
export function profiloDaCategoriaGoogle(categoriaGoogle: string): ProfiloCategoria {
  const c = categoriaGoogle.toLowerCase();
  return PROFILI.find((p) => p.categorieGoogle.some((g) => c.includes(g.toLowerCase()))) ?? ALTRO;
}

/** I profili con un settore reale, dal più numeroso, per la landing. */
export function profiliPerNumerosita(): ProfiloCategoria[] {
  return PROFILI.filter((p) => p.imprese > 0).sort((a, b) => b.imprese - a.imprese);
}

export interface Variabili {
  nome: string;
  categoria: string;
  citta: string;
  zona?: string;
  provincia?: string;
  regione?: string;
  specialita?: string[];
  requisito?: string;
  requisiti?: string[];
  /** I concorrenti più noti vicini, dal primo: servono alle domande di confronto (una per concorrente). */
  concorrenti?: string[];
  /** Il concorrente più citato o più vicino (compatibilità). */
  concorrente?: string;
  /** Aggiunge le domande in inglese se il profilo le prevede. */
  inglese?: boolean;
  /** Da dove viene ogni specialità o requisito (chiave: il termine in minuscolo). */
  origini?: Record<string, OrigineDomanda>;
}

/* ---------- Articoli e accordi, per i template ---------- */

/** «una pizzeria», «un ristorante», «uno studio dentistico»: l'articolo indeterminativo dal nome della categoria. */
export function articoloUn(categoria: string): string {
  const c = categoria.trim().toLowerCase();
  if (/^(s[bcdfghlmnpqrstvz]|z|ps|gn|x|y)/.test(c)) return "uno";
  if (/a$/.test(c) && !/(ista|cinema|problema|programma)$/.test(c)) return "una";
  if (/^[aeiou]/.test(c) && /a$/.test(c)) return "un'";
  return "un";
}

/** «la pizzeria», «il ristorante», «lo studio», «l'officina»: l'articolo determinativo. */
export function articoloIl(categoria: string): string {
  const c = categoria.trim().toLowerCase();
  if (/^[aeiou]/.test(c)) return "l'";
  if (/^(s[bcdfghlmnpqrstvz]|z|ps|gn|x|y)/.test(c)) return "lo";
  if (/a$/.test(c) && !/(ista|cinema|problema|programma)$/.test(c)) return "la";
  return "il";
}

const unisci = (articolo: string, parola: string) => (articolo.endsWith("'") ? `${articolo}${parola}` : `${articolo} ${parola}`);

/* ---------- Riempimento dei template ---------- */

function riempi(template: string, v: Variabili, specialita?: string, requisito?: string, concorrente?: string): string {
  const cat = v.categoria.toLowerCase();
  const testo = template
    .replaceAll("{nome}", v.nome)
    .replaceAll("{un categoria}", unisci(articoloUn(cat), cat))
    .replaceAll("{il categoria}", unisci(articoloIl(cat), cat))
    .replaceAll("{categoria}", cat)
    .replaceAll("{citta}", v.citta)
    .replaceAll("{zona}", v.zona ?? "centro")
    .replaceAll("{provincia}", v.provincia ?? v.citta)
    .replaceAll("{regione}", v.regione ?? v.provincia ?? v.citta)
    .replaceAll("{specialita}", specialita ?? v.specialita?.[0] ?? "")
    .replaceAll("{requisito}", requisito ?? v.requisito ?? v.requisiti?.[0] ?? "")
    .replaceAll("{concorrente}", concorrente ?? v.concorrente ?? v.concorrenti?.[0] ?? "");
  return (testo.charAt(0).toUpperCase() + testo.slice(1))
    .replace(/\bcon senza\b/g, "senza")
    .replace(/\bcon con\b/g, "con")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.?!:])/g, "$1")
    .trim();
}

/** Un template con un segnaposto vuoto non va usato. */
function valido(testo: string, template: string, v: Variabili): boolean {
  if (template.includes("{specialita}") && !v.specialita?.length) return false;
  if (template.includes("{requisito}") && !v.requisito && !v.requisiti?.length) return false;
  if (template.includes("{concorrente}") && !v.concorrente && !v.concorrenti?.length) return false;
  return testo.length > 0 && !/\{[a-z ]+\}/.test(testo);
}

/* ---------- Il telescopio: zoom e forme ---------- */

/**
 * La forma a lista di una domanda: la stessa domanda con la richiesta
 * esplicita di più opzioni. È la seconda ripetizione di ogni intento
 * spontaneo: la richiesta di una lista allunga le risposte e cambia i nomi, il
 * registro (colloquiale, imperativo) no.
 */
export function formaLista(testo: string): string {
  const t = testo.trim();
  if (/\?$/.test(t)) return `${t} Consigliami 5 opzioni.`;
  return `${t.replace(/[.!]$/, "")}: consigliami 5 opzioni.`;
}

/** Zoom «zona»: la domanda per città diventa per zona, se il template non la nomina già. */
function perZona(template: string): string | null {
  if (template.includes("{zona}") || !template.includes("a {citta}")) return null;
  return template.replace("a {citta}", "in zona {zona} a {citta}");
}

/** Zoom «provincia» per il B2B: la città diventa la provincia. */
function perProvincia(template: string): string | null {
  if (template.includes("{provincia}") || !template.includes("a {citta}") || template.includes("vicino a {citta}")) return null;
  return template.replace("a {citta}", "in provincia di {provincia}");
}

/** Zoom «regione» per il B2B: la provincia diventa la regione. */
function perRegione(template: string): string | null {
  if (template.includes("{regione}") || !template.includes("in provincia di {provincia}")) return null;
  return template.replace("in provincia di {provincia}", "in {regione}");
}

/**
 * I punti intorno all'attività: l'indirizzo più quattro a 1,2 km. Cinque e non
 * nove: un punto ha poche risposte e si legge solo aggregato («in quanti punti
 * compari»), mai confrontato con gli altri.
 */
export const PUNTI_VICINO: PuntoVicino[] = [
  { etichetta: "centro", nordM: 0, estM: 0 },
  { etichetta: "nord", nordM: 1200, estM: 0 },
  { etichetta: "est", nordM: 0, estM: 1200 },
  { etichetta: "sud", nordM: -1200, estM: 0 },
  { etichetta: "ovest", nordM: 0, estM: -1200 },
];

export type Quote = Partial<Record<TipoDomanda, number>>;

/**
 * Quanti intenti per famiglia in ogni piano (studio «Domande e statistiche»,
 * tabella delle quote). Ogni intento è chiesto in due forme (breve e a
 * lista), che sono le sue ripetizioni: il numero conta intenti distinti, non
 * parafrasi. Le domande in inglese entrano solo se il profilo le prevede; le
 * informative sono contate a parte nel report.
 */
export const QUOTE: Record<"singolo" | "base" | "pro", Quote> = {
  singolo: { generica: 5, bisogno: 5, specialita: 4, requisito: 4, prezzo: 3, occasione: 3, recensioni: 2, vicino: 4, nome: 2, confronto: 2, inglese: 2 },
  base: { generica: 6, bisogno: 6, specialita: 5, requisito: 5, prezzo: 4, occasione: 4, recensioni: 3, vicino: 5, informativa: 2, nome: 3, confronto: 3, inglese: 2 },
  pro: { generica: 9, bisogno: 9, specialita: 8, requisito: 7, prezzo: 6, occasione: 6, recensioni: 4, vicino: 8, informativa: 4, nome: 4, confronto: 4, inglese: 3 },
};

/** Punti della griglia per piano: il report singolo usa solo l'indirizzo. */
export const PUNTI_PER_PIANO: Record<"singolo" | "base" | "pro", number> = { singolo: 1, base: 5, pro: 5 };

export const totaleQuote = (q: Quote) => Object.values(q).reduce((a, b) => a + (b ?? 0), 0);

/** Le famiglie spontanee che hanno la forma a lista come seconda ripetizione. */
const CON_FORMA_LISTA: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "prezzo", "occasione", "recensioni", "vicino"];

interface Candidata {
  testo: string;
  gruppo: string;
  zoom: Zoom;
  origine?: OrigineDomanda;
  concorrente?: string;
  occasione?: string;
  punto?: PuntoVicino;
  /** La seconda forma, quando non è quella a lista (confronti con i nomi invertiti). */
  secondaForma?: string;
}

/** Le varianti di un template: il suo zoom e, se c'è, gli altri (zona in città; provincia e regione per il B2B). Ogni variante è un intento. */
function varianti(template: string, v: Variabili, gruppo: string, b2b: boolean, riempiCon: (t: string) => string, origine?: OrigineDomanda, zoomBase: Zoom = "citta"): Candidata[] {
  const zoomDiTemplate = (t: string): Zoom =>
    t.includes("{zona}") ? "zona" : t.includes("{provincia}") ? "provincia" : t.includes("{regione}") ? "regione" : b2b && !t.includes("{citta}") ? "nazionale" : zoomBase;
  const livelli: { t: string; zoom: Zoom }[] = [{ t: template, zoom: zoomDiTemplate(template) }];
  if (b2b) {
    const prov = perProvincia(template);
    if (prov) livelli.push({ t: prov, zoom: "provincia" });
    const reg = perRegione(prov ?? template);
    if (reg) livelli.push({ t: reg, zoom: "regione" });
  } else {
    const zona = perZona(template);
    if (zona) livelli.push({ t: zona, zoom: "zona" });
  }
  const out: Candidata[] = [];
  for (const l of livelli) {
    const testo = riempiCon(l.t);
    if (valido(testo, l.t, v)) out.push({ testo, gruppo, zoom: l.zoom, origine });
  }
  return out;
}

/**
 * Prende dal pool a giri: prima una variante per ogni intento (gruppo), poi
 * le repliche (zoom). Così con poche domande c'è copertura e con tante c'è profondità.
 */
function aGiri(pool: Candidata[], n: number): Candidata[] {
  const perGruppo = new Map<string, Candidata[]>();
  for (const c of pool) perGruppo.set(c.gruppo, [...(perGruppo.get(c.gruppo) ?? []), c]);
  const code = [...perGruppo.values()];
  const out: Candidata[] = [];
  let resta = true;
  while (out.length < n && resta) {
    resta = false;
    for (const coda of code) {
      if (out.length >= n) break;
      const c = coda.shift();
      if (!c) continue;
      resta = true;
      if (!out.some((x) => x.testo === c.testo)) out.push(c);
    }
  }
  return out;
}

/**
 * Genera il set di domande di un piano: per ogni famiglia la sua quota di
 * intenti, dal pool delle varianti del profilo (template × zoom), più i punti
 * intorno a te, i confronti con i concorrenti noti e le domande sul nome.
 * Le famiglie che non arrivano alla quota lasciano il posto alle altre, così
 * il totale resta quello del piano. Gli intenti spontanei portano anche la
 * forma a lista, che è la loro seconda ripetizione.
 */
export function generaDomande(p: ProfiloCategoria, v: Variabili, pianoOQuote: keyof typeof QUOTE | Quote | number): Domanda[] {
  const quote: Quote = typeof pianoOQuote === "number" ? scala(QUOTE.base, pianoOQuote) : typeof pianoOQuote === "string" ? QUOTE[pianoOQuote] : pianoOQuote;
  const nPunti = typeof pianoOQuote === "string" ? PUNTI_PER_PIANO[pianoOQuote] : totaleQuote(quote) >= totaleQuote(QUOTE.base) ? 5 : 1;
  const origineDi = (termine?: string): OrigineDomanda | undefined => (termine ? v.origini?.[termine.toLowerCase()] : undefined);
  const b2b = p.b2b;

  const pool: Record<TipoDomanda, Candidata[]> = { generica: [], bisogno: [], specialita: [], requisito: [], prezzo: [], occasione: [], recensioni: [], vicino: [], informativa: [], confronto: [], nome: [], inglese: [] };

  (p.domande.generica ?? []).forEach((t, i) => pool.generica.push(...varianti(t, v, `g${i}`, b2b, (x) => riempi(x, v))));
  (p.domande.bisogno ?? []).forEach((t, i) => pool.bisogno.push(...varianti(t, v, `b${i}`, b2b, (x) => riempi(x, v))));
  const specialita = v.specialita ?? [];
  (p.domande.specialita ?? []).forEach((t, i) => specialita.forEach((s, j) => pool.specialita.push(...varianti(t, v, `s${i}-${j}`, b2b, (x) => riempi(x, v, s), origineDi(s)))));
  const requisiti = v.requisiti?.length ? v.requisiti : v.requisito ? [v.requisito] : [];
  (p.domande.requisito ?? []).forEach((t, i) => {
    if (t.includes("{requisito}")) requisiti.forEach((r, j) => pool.requisito.push(...varianti(t, v, `r${i}-${j}`, b2b, (x) => riempi(x, v, undefined, r), origineDi(r))));
    else pool.requisito.push(...varianti(t, v, `r${i}`, b2b, (x) => riempi(x, v)));
  });
  (p.domande.prezzo ?? []).forEach((t, i) => pool.prezzo.push(...varianti(t, v, `p${i}`, b2b, (x) => riempi(x, v))));
  (p.domande.occasione ?? []).forEach((o, i) => {
    for (const c of varianti(o.testo, v, `o${i}`, b2b, (x) => riempi(x, v))) pool.occasione.push({ ...c, occasione: o.etichetta });
  });
  (p.domande.recensioni ?? []).forEach((t, i) => pool.recensioni.push(...varianti(t, v, `q${i}`, b2b, (x) => riempi(x, v))));
  // Vicino a te: il primo template su tutti i punti della griglia (lo stesso intento, posizione diversa), poi gli altri template all'indirizzo; B2B senza punti (zoom provincia).
  const vicino = p.domande.vicino ?? [];
  if (b2b) {
    vicino.forEach((t, i) => pool.vicino.push(...varianti(t, v, `v${i}`, b2b, (x) => riempi(x, v), undefined, "provincia")));
  } else if (vicino.length) {
    const nVicino = quote.vicino ?? 0;
    for (let k = 0; k < nVicino; k++) {
      const indice = k < nPunti ? 0 : (k - nPunti + 1) % vicino.length;
      const t = vicino[indice];
      const testo = riempi(t, v);
      if (!valido(testo, t, v)) continue;
      const punto = k < nPunti ? PUNTI_VICINO[k] : PUNTI_VICINO[0];
      if (pool.vicino.some((x) => x.testo === testo && x.punto?.etichetta === punto?.etichetta)) continue;
      pool.vicino.push({ testo, gruppo: `v${indice}`, zoom: "vicino", punto });
    }
  }
  (p.domande.informativa ?? []).forEach((t, i) => pool.informativa.push(...varianti(t, v, `i${i}`, b2b, (x) => riempi(x, v))));
  const concorrenti = v.concorrenti?.length ? v.concorrenti : v.concorrente ? [v.concorrente] : [];
  (p.domande.confronto ?? []).forEach((t, i) => concorrenti.forEach((c, j) => {
    const testo = riempi(t, v, undefined, undefined, c);
    // La seconda forma ha i nomi invertiti: gli assistenti preferiscono il primo nome che leggono.
    const invertita = riempi(t, { ...v, nome: c }, undefined, undefined, v.nome);
    if (valido(testo, t, v)) pool.confronto.push({ testo, gruppo: `c${i}-${j}`, zoom: "citta", origine: "scheda", concorrente: c, secondaForma: invertita });
  }));
  // Confronti: prima il primo template con un concorrente diverso per ogni domanda, poi i template successivi.
  const indici = (g: string) => g.slice(1).split("-").map(Number);
  pool.confronto.sort((a, b) => indici(a.gruppo)[0] - indici(b.gruppo)[0] || indici(a.gruppo)[1] - indici(b.gruppo)[1]);
  (p.domande.nome ?? []).forEach((t, i) => {
    const testo = riempi(t, v);
    if (valido(testo, t, v)) pool.nome.push({ testo, gruppo: `n${i}`, zoom: "citta" });
  });
  for (const t of b2b ? NOME_GENERICI_B2B : NOME_GENERICI) {
    const testo = riempi(t, v);
    if (!pool.nome.some((x) => x.testo === testo)) pool.nome.push({ testo, gruppo: `n${pool.nome.length}`, zoom: "citta" });
  }
  if (v.inglese !== false && p.inglese) (p.domande.inglese ?? []).forEach((t, i) => {
    const testo = riempi(t, v);
    if (valido(testo, t, v)) pool.inglese.push({ testo, gruppo: `e${i}`, zoom: b2b ? "nazionale" : "citta" });
  });

  // Lo stesso testo in due famiglie vale una volta: resta nella prima.
  const ordine: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "prezzo", "occasione", "recensioni", "vicino", "informativa", "confronto", "nome", "inglese"];
  const visti = new Set<string>();
  for (const tipo of ordine) pool[tipo] = pool[tipo].filter((c) => (tipo === "vicino" ? true : !visti.has(c.testo)) && Boolean(visti.add(c.testo)));

  // Le quote: famiglie piene prima; quello che manca si ridistribuisce a giri sulle famiglie spontanee con varianti in avanzo.
  const scelte: Partial<Record<TipoDomanda, Candidata[]>> = {};
  for (const tipo of ordine) scelte[tipo] = tipo === "vicino" && !b2b ? pool.vicino : aGiri(pool[tipo], quote[tipo] ?? 0);
  const obiettivo = totaleQuote(quote);
  let totale = ordine.reduce((acc, t) => acc + (scelte[t]?.length ?? 0), 0);
  const riserva: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "prezzo", "occasione", "recensioni", ...(b2b ? (["vicino"] as TipoDomanda[]) : [])];
  // Se le famiglie spontanee non bastano (profili B2B con pochi template), si completa con informative, inglese e nome.
  for (const famiglie of [riserva, ["informativa", "inglese", "nome"] as TipoDomanda[]]) {
    let giri = 0;
    while (totale < obiettivo && giri < 40) {
      let aggiunta = false;
      for (const tipo of famiglie) {
        if (totale >= obiettivo) break;
        if (tipo === "inglese" && (v.inglese === false || !p.inglese)) continue;
        const prese = scelte[tipo] ?? [];
        const extra = aGiri(pool[tipo].filter((c) => !prese.some((x) => x.testo === c.testo)), 1)[0];
        if (!extra) continue;
        prese.push(extra);
        scelte[tipo] = prese;
        totale++;
        aggiunta = true;
      }
      if (!aggiunta) break;
      giri++;
    }
  }

  // Ordine finale: le famiglie spontanee alternate a giri (così la mappa non è a blocchi), poi informativa, confronto, nome, inglese.
  const out: Domanda[] = [];
  const push = (c: Candidata, tipo: TipoDomanda) => {
    out.push({
      id: `d${out.length + 1}`,
      testo: c.testo,
      tipo,
      zoom: c.zoom,
      secondaForma: c.secondaForma ?? (CON_FORMA_LISTA.includes(tipo) ? formaLista(c.testo) : undefined),
      gruppo: `${tipo}:${c.gruppo}`,
      origine: c.origine,
      concorrente: c.concorrente,
      occasione: c.occasione,
      punto: c.punto,
    });
  };
  const spontaneeTipi = [...new Set<TipoDomanda>([...riserva, "vicino"])];
  const spontaneeCode = spontaneeTipi.map((t) => [...(scelte[t] ?? [])] as Candidata[]);
  let resta = true;
  while (resta) {
    resta = false;
    spontaneeCode.forEach((coda, i) => {
      const c = coda.shift();
      if (!c) return;
      resta = true;
      push(c, spontaneeTipi[i]);
    });
  }
  for (const tipo of ["informativa", "confronto", "nome", "inglese"] as TipoDomanda[]) for (const c of scelte[tipo] ?? []) push(c, tipo);
  return out;
}

/** Domande sul nome valide per ogni categoria, quando il profilo ne ha meno di tre. */
const NOME_GENERICI = ["com'è {nome} a {citta}? recensioni e punti di forza", "{nome} a {citta}: orari, telefono e come prenotare", "cosa dicono i clienti di {nome} a {citta}? pregi e difetti"];
const NOME_GENERICI_B2B = ["{nome} di {citta}: cosa fanno e sono affidabili come fornitore?", "{nome} a {citta}: contatti, certificazioni e come chiedere un preventivo", "cosa dicono i clienti di {nome} a {citta}? punti di forza e limiti"];

/** Quote in proporzione per un numero di domande diverso dai piani. */
function scala(base: Quote, n: number): Quote {
  const tot = totaleQuote(base);
  const out: Quote = {};
  let somma = 0;
  for (const [k, q] of Object.entries(base) as [TipoDomanda, number][]) {
    const v = Math.max(k === "nome" || k === "confronto" ? 1 : 0, Math.round((q / tot) * n));
    out[k] = v;
    somma += v;
  }
  // Aggiusta sulle generiche per tornare a n.
  out.generica = Math.max(1, (out.generica ?? 0) + (n - somma));
  return out;
}
