import type { Domanda, Formulazione, OrigineDomanda, PuntoVicino, TipoDomanda, Zoom } from "./types";
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
    requisito?: string[];
    /** Chi chiede e perché: template con l'occasione già dentro, in coppia con la sua etichetta. */
    occasione?: { testo: string; etichetta: string }[];
    /** Vicino a te: la posizione viene impostata in punti diversi intorno all'attività. */
    vicino?: string[];
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

/* ---------- Articoli e accordi, per le formulazioni ---------- */

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

/* ---------- Il telescopio: zoom e formulazioni ---------- */

/**
 * I template che iniziano con la categoria sono sintagmi nominali («pizzeria
 * aperta la domenica a Bergamo»): si possono chiedere in tre modi. Gli altri
 * («dove mangiare bene a Bergamo») sono già frasi e restano come sono.
 */
function sintagma(template: string): boolean {
  return /^(miglior(e)? )?\{categoria\}/.test(template.trim());
}

/**
 * Le tre formulazioni di un sintagma nominale: diretta («pizzeria aperta la
 * domenica a Bergamo»), colloquiale («cerco una pizzeria aperta la domenica a
 * Bergamo: cosa mi consigli?»), imperativa («consigliami una pizzeria…»).
 * Con «miglior» davanti: «qual è la pizzeria migliore a Bergamo?».
 */
function formula(template: string, forma: Formulazione): string {
  const t = template.trim();
  if (forma === "diretta") return t;
  const superlativo = /^miglior(e)? /.test(t);
  const resto = t.replace(/^miglior(e)? /, "").replace(/^\{categoria\}/, "").replace(/\?$/, "");
  if (superlativo) return forma === "colloquiale" ? `qual è {il categoria} migliore${resto}?` : `consigliami {il categoria} migliore${resto}`;
  return forma === "colloquiale" ? `cerco {un categoria}${resto}: cosa mi consigli?` : `consigliami {un categoria}${resto}`;
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

/** I punti intorno all'attività: centro più quattro a 1,2 km (nove nel set esteso, con le diagonali a 1,7 km). */
export const PUNTI_VICINO: PuntoVicino[] = [
  { etichetta: "centro", nordM: 0, estM: 0 },
  { etichetta: "nord", nordM: 1200, estM: 0 },
  { etichetta: "est", nordM: 0, estM: 1200 },
  { etichetta: "sud", nordM: -1200, estM: 0 },
  { etichetta: "ovest", nordM: 0, estM: -1200 },
  { etichetta: "nord-est", nordM: 1200, estM: 1200 },
  { etichetta: "sud-ovest", nordM: -1200, estM: -1200 },
  { etichetta: "nord-ovest", nordM: 1200, estM: -1200 },
  { etichetta: "sud-est", nordM: -1200, estM: 1200 },
];

export type Quote = Partial<Record<TipoDomanda, number>>;

/**
 * Quante domande per famiglia in ogni piano. Ogni famiglia ha almeno sei
 * domande: con sei assistenti e due ripetizioni sono 72 risposte, abbastanza
 * per un intervallo di ±10 punti al livello della famiglia (cloro.dev 2026,
 * Evertune 2026). Le domande in inglese sostituiscono parte delle generiche
 * solo se il profilo le prevede.
 */
export const QUOTE: Record<"singolo" | "base" | "pro", Quote> = {
  singolo: { generica: 6, bisogno: 6, specialita: 6, requisito: 4, occasione: 4, vicino: 5, confronto: 2, nome: 3 },
  base: { generica: 8, bisogno: 8, specialita: 7, requisito: 6, occasione: 6, vicino: 5, confronto: 3, nome: 3, inglese: 2 },
  pro: { generica: 12, bisogno: 12, specialita: 10, requisito: 8, occasione: 8, vicino: 9, confronto: 5, nome: 4, inglese: 4 },
};

export const totaleQuote = (q: Quote) => Object.values(q).reduce((a, b) => a + (b ?? 0), 0);

interface Candidata {
  testo: string;
  gruppo: string;
  zoom: Zoom;
  formulazione?: Formulazione;
  origine?: OrigineDomanda;
  concorrente?: string;
  occasione?: string;
  punto?: PuntoVicino;
}

/** Le varianti di un template: formulazioni (se è un sintagma) × zoom (città, zona o provincia). */
function varianti(template: string, v: Variabili, gruppo: string, b2b: boolean, riempiCon: (t: string) => string, origine?: OrigineDomanda, zoomBase: Zoom = "citta"): Candidata[] {
  const out: Candidata[] = [];
  const forme: Formulazione[] = sintagma(template) ? ["diretta", "colloquiale", "imperativa"] : ["diretta"];
  const zoomDiTemplate = (t: string): Zoom =>
    t.includes("{zona}") ? "zona" : t.includes("{provincia}") ? "provincia" : t.includes("{regione}") ? "regione" : b2b && !t.includes("{citta}") ? "nazionale" : zoomBase;
  const livelli: { t: string; zoom: Zoom }[] = [{ t: template, zoom: zoomDiTemplate(template) }];
  const altro = b2b ? perProvincia(template) : perZona(template);
  if (altro) livelli.push({ t: altro, zoom: b2b ? "provincia" : "zona" });
  // Prima tutte le formulazioni al primo zoom, poi il secondo zoom in forma diretta: così le repliche arrivano dopo l'intento.
  for (const forma of forme) {
    const t = formula(livelli[0].t, forma);
    const testo = riempiCon(t);
    if (valido(testo, t, v)) out.push({ testo, gruppo, zoom: livelli[0].zoom, formulazione: forma, origine });
  }
  if (livelli[1]) {
    const testo = riempiCon(livelli[1].t);
    if (valido(testo, livelli[1].t, v)) out.push({ testo, gruppo, zoom: livelli[1].zoom, formulazione: "diretta", origine });
  }
  return out;
}

/**
 * Prende dal pool a giri: prima una variante per ogni intento (gruppo), poi
 * le repliche (formulazioni, zoom). Così con poche domande c'è copertura e
 * con tante c'è profondità.
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
 * Genera il set di domande di un piano: per ogni famiglia la sua quota, dal
 * pool delle varianti del profilo (template × formulazione × zoom), più i
 * punti intorno a te, i confronti con i concorrenti noti e le domande sul nome.
 * Le famiglie che non arrivano alla quota lasciano il posto alle altre, così
 * il totale resta quello del piano.
 */
export function generaDomande(p: ProfiloCategoria, v: Variabili, pianoOQuote: keyof typeof QUOTE | Quote | number): Domanda[] {
  const quote: Quote = typeof pianoOQuote === "number" ? scala(QUOTE.base, pianoOQuote) : typeof pianoOQuote === "string" ? QUOTE[pianoOQuote] : pianoOQuote;
  const origineDi = (termine?: string): OrigineDomanda | undefined => (termine ? v.origini?.[termine.toLowerCase()] : undefined);
  const b2b = p.b2b;

  const pool: Record<TipoDomanda, Candidata[]> = { generica: [], bisogno: [], specialita: [], requisito: [], occasione: [], vicino: [], confronto: [], nome: [], inglese: [] };

  (p.domande.generica ?? []).forEach((t, i) => pool.generica.push(...varianti(t, v, `g${i}`, b2b, (x) => riempi(x, v))));
  (p.domande.bisogno ?? []).forEach((t, i) => pool.bisogno.push(...varianti(t, v, `b${i}`, b2b, (x) => riempi(x, v))));
  const specialita = v.specialita ?? [];
  (p.domande.specialita ?? []).forEach((t, i) => specialita.forEach((s, j) => pool.specialita.push(...varianti(t, v, `s${i}-${j}`, b2b, (x) => riempi(x, v, s), origineDi(s)))));
  const requisiti = v.requisiti?.length ? v.requisiti : v.requisito ? [v.requisito] : [];
  (p.domande.requisito ?? []).forEach((t, i) => {
    if (t.includes("{requisito}")) requisiti.forEach((r, j) => pool.requisito.push(...varianti(t, v, `r${i}-${j}`, b2b, (x) => riempi(x, v, undefined, r), origineDi(r))));
    else pool.requisito.push(...varianti(t, v, `r${i}`, b2b, (x) => riempi(x, v)));
  });
  (p.domande.occasione ?? []).forEach((o, i) => {
    for (const c of varianti(o.testo, v, `o${i}`, b2b, (x) => riempi(x, v))) pool.occasione.push({ ...c, occasione: o.etichetta });
  });
  // Vicino a te: un punto per domanda, template a rotazione; B2B senza punti (zoom provincia).
  const vicino = p.domande.vicino ?? [];
  if (vicino.length) {
    const nPunti = quote.vicino ?? 0;
    for (let k = 0; k < nPunti; k++) {
      const t = vicino[k % vicino.length];
      const testo = riempi(t, v);
      if (!valido(testo, t, v)) continue;
      if (b2b && pool.vicino.some((x) => x.testo === testo)) continue;
      pool.vicino.push(b2b ? { testo, gruppo: `v${k % vicino.length}`, zoom: "provincia", formulazione: "diretta" } : { testo, gruppo: `v${k % vicino.length}`, zoom: "vicino", formulazione: "diretta", punto: PUNTI_VICINO[k % PUNTI_VICINO.length] });
    }
  }
  const concorrenti = v.concorrenti?.length ? v.concorrenti : v.concorrente ? [v.concorrente] : [];
  (p.domande.confronto ?? []).forEach((t, i) => concorrenti.forEach((c, j) => {
    const testo = riempi(t, v, undefined, undefined, c);
    if (valido(testo, t, v)) pool.confronto.push({ testo, gruppo: `c${i}-${j}`, zoom: "citta", formulazione: "diretta", origine: "scheda", concorrente: c });
  }));
  // Confronti: prima un concorrente diverso per ogni domanda, poi i template successivi.
  pool.confronto.sort((a, b) => Number(a.gruppo.split("-")[1]) - Number(b.gruppo.split("-")[1]) || a.gruppo.localeCompare(b.gruppo));
  (p.domande.nome ?? []).forEach((t, i) => {
    const testo = riempi(t, v);
    if (valido(testo, t, v)) pool.nome.push({ testo, gruppo: `n${i}`, zoom: "citta", formulazione: "diretta" });
  });
  for (const t of b2b ? NOME_GENERICI_B2B : NOME_GENERICI) {
    const testo = riempi(t, v);
    if (!pool.nome.some((x) => x.testo === testo)) pool.nome.push({ testo, gruppo: `n${pool.nome.length}`, zoom: "citta", formulazione: "diretta" });
  }
  if (v.inglese !== false && p.inglese) (p.domande.inglese ?? []).forEach((t, i) => {
    const testo = riempi(t, v);
    if (valido(testo, t, v)) pool.inglese.push({ testo, gruppo: `e${i}`, zoom: b2b ? "nazionale" : "citta", formulazione: "diretta" });
  });

  // Le quote: famiglie piene prima; quello che manca si ridistribuisce a giri sulle famiglie spontanee con varianti in avanzo.
  const scelte: Partial<Record<TipoDomanda, Candidata[]>> = {};
  const ordine: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "occasione", "vicino", "confronto", "nome", "inglese"];
  for (const tipo of ordine) scelte[tipo] = tipo === "vicino" ? pool.vicino : aGiri(pool[tipo], quote[tipo] ?? 0);
  const obiettivo = totaleQuote(quote);
  let totale = ordine.reduce((acc, t) => acc + (scelte[t]?.length ?? 0), 0);
  const riserva: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "occasione"];
  let giri = 0;
  while (totale < obiettivo && giri < 40) {
    let aggiunta = false;
    for (const tipo of riserva) {
      if (totale >= obiettivo) break;
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

  // Ordine finale: le famiglie spontanee alternate a giri (così la mappa non è a blocchi), poi confronto, nome, inglese.
  const out: Domanda[] = [];
  const push = (c: Candidata, tipo: TipoDomanda) => {
    out.push({
      id: `d${out.length + 1}`,
      testo: c.testo,
      tipo,
      zoom: c.zoom,
      formulazione: c.formulazione,
      gruppo: `${tipo}:${c.gruppo}`,
      origine: c.origine,
      concorrente: c.concorrente,
      occasione: c.occasione,
      punto: c.punto,
    });
  };
  const spontaneeCode = riserva.concat(["vicino"]).map((t) => [...(scelte[t] ?? [])] as Candidata[]);
  let resta = true;
  while (resta) {
    resta = false;
    spontaneeCode.forEach((coda, i) => {
      const c = coda.shift();
      if (!c) return;
      resta = true;
      push(c, riserva.concat(["vicino"])[i]);
    });
  }
  for (const tipo of ["confronto", "nome", "inglese"] as TipoDomanda[]) for (const c of scelte[tipo] ?? []) push(c, tipo);
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
