import type { Posizione, ProfiloAttivita } from "../types";
import type { AnalisiCella } from "../scansione/tipi";
import { portaliDa } from "./fonti";

/**
 * Riconoscimento dell'attività e dei concorrenti nel testo di una risposta.
 * Regole dichiarate, niente modelli: un nome è riconosciuto quando il suo
 * nucleo (le parole che non sono generiche: «Da Gino», non «pizzeria») compare
 * intero e vicino nel testo; l'attività anche per telefono o indirizzo.
 * La posizione è l'ordine di prima comparsa tra i nomi riconosciuti.
 */

const GENERICHE = new Set(
  `pizzeria ristorante trattoria osteria bar caffe caffetteria pasticceria gelateria hotel albergo bb b&b agriturismo
  studio dentistico odontoiatrico medico legale avvocato avv dott dr dottor dottoressa dottssa prof ing arch geom
  srl s r l snc sas spa srls sr ss società societa gruppo azienda impresa ditta officina carpenteria agenzia
  immobiliare palestra centro estetico estetica parrucchiere parrucchieri salone farmacia clinica poliambulatorio
  laboratorio negozio bottega casa villa locanda antica antico nuova nuovo vecchia vecchio grande piccola piccolo
  di da del della dei degli delle dal dalla la il lo le i gli al alla allo ai agli e ed & the and of
  san santa sant santo via piazza corso viale`
    .split(/\s+/)
    .filter(Boolean),
);

const CONNETTORI = new Set(["di", "da", "del", "della", "dei", "degli", "delle", "la", "il", "lo", "le", "i", "gli", "al", "alla", "e", "&", "the", "and", "of"]);

export function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9&]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const gettoni = (s: string) => normalizza(s).split(" ").filter(Boolean);

/** Le parole distintive di un nome. Se non ne restano, tutte. */
export function nucleo(nome: string): string[] {
  const tok = gettoni(nome);
  const distintive = tok.filter((t) => !GENERICHE.has(t) && t.length > 1);
  return distintive.length ? distintive : tok;
}

/** Il nucleo è «debole» (una parola sola e corta): allora serve il nome intero. */
function debole(nome: string): boolean {
  const n = nucleo(nome);
  return n.length === 1 && n[0].length <= 5;
}

/** Indice del gettone in cui i gettoni di `seq` compaiono in ordine, entro una finestra; -1 se mai. */
function trovaSequenza(testo: string[], seq: string[], finestra: number): number {
  if (seq.length === 0) return -1;
  for (let i = 0; i < testo.length; i++) {
    if (testo[i] !== seq[0]) continue;
    let j = 1;
    let k = i + 1;
    while (j < seq.length && k < testo.length && k - i <= finestra) {
      if (testo[k] === seq[j]) j++;
      else if (!CONNETTORI.has(testo[k])) break;
      k++;
    }
    if (j === seq.length) return i;
  }
  return -1;
}

/** Dove compare un nome nel testo (indice di gettone), -1 se mai. */
export function trovaNome(testoGettoni: string[], nome: string): number {
  const tutti = gettoni(nome);
  if (!debole(nome)) return trovaSequenza(testoGettoni, nucleo(nome), nucleo(nome).length + 3);
  // Nucleo debole («Gino», «Forno»): serve il nome intero, oppure il nome senza la parola generica iniziale («Da Gino»).
  const intero = trovaSequenza(testoGettoni, tutti, tutti.length + 1);
  if (intero >= 0) return intero;
  let i = 0;
  while (i < tutti.length - 1 && GENERICHE.has(tutti[i]) && !CONNETTORI.has(tutti[i])) i++;
  const senzaGenerica = tutti.slice(i);
  if (senzaGenerica.length >= 2 && senzaGenerica.length < tutti.length) return trovaSequenza(testoGettoni, senzaGenerica, senzaGenerica.length + 1);
  return -1;
}

/** Telefono (ultime 6 cifre) o via con numero civico: anche così l'attività «compare». */
export function trovaContatto(testo: string, a: ProfiloAttivita): number {
  const t = normalizza(testo);
  const tok = t.split(" ");
  if (a.telefono) {
    const cifre = a.telefono.replace(/\D/g, "");
    if (cifre.length >= 6) {
      const coda = cifre.slice(-6);
      const senzaSpazi = t.replace(/\s/g, "");
      const i = senzaSpazi.indexOf(coda);
      if (i >= 0) return Math.min(tok.length - 1, Math.round((i / senzaSpazi.length) * tok.length));
    }
  }
  const via = a.indirizzo.split(",")[0];
  const viaTok = gettoni(via).filter((x) => !["via", "piazza", "corso", "viale", "vicolo", "largo"].includes(x));
  if (viaTok.length >= 2) {
    const i = trovaSequenza(tok, viaTok, viaTok.length + 2);
    if (i >= 0) return i;
  }
  return -1;
}

const NON_NOMI = /^(nota|note|consigli?o?|conclusion[ei]|in sintesi|riepilogo|suggeriment[oi]|altre opzioni|fonti|ecco|opzion[ei]|alternative?|consiglio finale|dove|come|cosa|perché|quando|prezzi?|orari|indirizzo|telefono|sito|menu|servizi|pro|contro|vantaggi|svantaggi)\b/i;

/**
 * I nomi che una risposta mette in elenco: voci numerate o puntate, grassetti,
 * titoli. Si tiene la parte prima di «–», «:», «(»; 1–7 parole, almeno una maiuscola.
 */
export function estraiNomi(testo: string): string[] {
  const out: string[] = [];
  const aggiungi = (s: string) => {
    const n = s
      .replace(/\*\*|__|`/g, "")
      .replace(/^[\s"«“']+|[\s"»”'.,;:]+$/g, "")
      .trim();
    if (!n || n.length > 60) return;
    const parole = n.split(/\s+/);
    if (parole.length > 7) return;
    if (!/[A-ZÀ-Ý]/.test(n)) return;
    if (NON_NOMI.test(n)) return;
    if (/^\d+$/.test(n)) return;
    if (!out.some((x) => normalizza(x) === normalizza(n))) out.push(n);
  };
  for (const rigaGrezza of testo.split(/\r?\n/)) {
    const riga = rigaGrezza.trim();
    if (!riga) continue;
    const voce = riga.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    const titolo = riga.match(/^#{1,4}\s+(.*)$/);
    const corpo = voce?.[1] ?? titolo?.[1];
    if (corpo) {
      const grassetto = corpo.match(/\*\*(.+?)\*\*/);
      if (grassetto) aggiungi(grassetto[1]);
      else aggiungi(corpo.split(/\s[–—-]\s|:\s|\s\(|\s·\s/)[0]);
      continue;
    }
    for (const m of riga.matchAll(/\*\*(.+?)\*\*/g)) aggiungi(m[1]);
  }
  return out;
}

/** Due nomi sono la stessa attività se il nucleo di uno è contenuto nell'altro. */
export function stessoNome(a: string, b: string): boolean {
  const na = nucleo(a);
  const nb = nucleo(b);
  if (na.length === 0 || nb.length === 0) return false;
  const inA = new Set(na);
  const inB = new Set(nb);
  return na.every((t) => inB.has(t)) || nb.every((t) => inA.has(t));
}

/**
 * Analizza una risposta: tu, gli altri nomi riconosciuti (noti dalla scheda
 * Google o estratti dall'elenco), l'ordine, le fonti.
 */
export function analizzaRisposta(testo: string, urls: string[], attivita: ProfiloAttivita, concorrentiNoti: string[]): AnalisiCella {
  const tok = gettoni(testo);
  const entita: { nome: string; indice: number; seiTu?: boolean }[] = [];

  // Tu: per nome, telefono o indirizzo.
  let tuo = trovaNome(tok, attivita.nome);
  if (tuo < 0) tuo = trovaContatto(testo, attivita);
  if (tuo >= 0) entita.push({ nome: attivita.nome, indice: tuo, seiTu: true });

  // Concorrenti noti (scheda Google) e nomi estratti dall'elenco, unificati.
  const candidati: string[] = [...concorrentiNoti];
  for (const n of estraiNomi(testo)) {
    if (stessoNome(n, attivita.nome)) continue;
    if (!candidati.some((c) => stessoNome(c, n))) candidati.push(n);
  }
  for (const nome of candidati) {
    if (stessoNome(nome, attivita.nome)) continue;
    const i = trovaNome(tok, nome);
    if (i < 0) continue;
    if (entita.some((e) => !e.seiTu && stessoNome(e.nome, nome))) continue;
    entita.push({ nome, indice: i });
  }

  entita.sort((a, b) => a.indice - b.indice);
  const citati = entita.map((e, i) => ({ nome: e.nome, posizione: i + 1, seiTu: e.seiTu }));
  const mia = citati.find((c) => c.seiTu);
  const posizione: Posizione = mia && mia.posizione <= 5 ? (mia.posizione as Posizione) : null;
  return { posizione, citati, fonti: portaliDa(urls, attivita.sito) };
}
