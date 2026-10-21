import type { EngineId } from "../types";

/**
 * Un'interrogazione a un assistente: la domanda come la farebbe un cliente,
 * con la località impostata nell'API (non nel testo) e la lingua.
 */
export interface Interrogazione {
  domanda: string;
  citta: string;
  regione?: string;
  coordinate?: { lat: number; lng: number };
  lingua: "it";
}

/**
 * La risposta grezza, con tutto quello che serve a ricostruire il dato:
 * assistente, modello, canale, quando, testo integrale, URL consultate o citate.
 */
export interface RispostaGrezza {
  motore: EngineId;
  modello: string;
  canale: "api";
  inizio: string;
  fine: string;
  testo: string;
  /** URL citate o consultate, così come le restituisce l'interfaccia. */
  fonti: string[];
  errore?: string;
}

export interface Motore {
  id: EngineId;
  /** C'è la chiave per interrogarlo? */
  attivo(): boolean;
  interroga(q: Interrogazione): Promise<RispostaGrezza>;
}

/** Istruzione minima e uguale per tutti: solo la lingua, niente che guidi la risposta. */
export const ISTRUZIONE = "Rispondi in italiano.";

/** fetch con timeout per le API dei motori; lancia su errore di rete. */
export async function chiama(url: string, init: RequestInit, timeoutMs = 60000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Una risposta vuota con l'errore, per non perdere la cella. */
export function fallita(motore: EngineId, modello: string, inizio: string, errore: unknown): RispostaGrezza {
  return { motore, modello, canale: "api", inizio, fine: new Date().toISOString(), testo: "", fonti: [], errore: errore instanceof Error ? errore.message : String(errore) };
}

/** Raccoglie ricorsivamente tutte le URL http(s) in un oggetto JSON (citazioni, annotazioni, fonti). */
export function urlDentro(x: unknown, out: Set<string> = new Set(), profondita = 0): string[] {
  if (profondita > 8 || x === null || x === undefined) return [...out];
  if (typeof x === "string") {
    if (/^https?:\/\//i.test(x)) out.add(x);
  } else if (Array.isArray(x)) {
    for (const v of x) urlDentro(v, out, profondita + 1);
  } else if (typeof x === "object") {
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      if (/^(url|uri|source_url|link|href)$/i.test(k) && typeof v === "string") {
        if (/^https?:\/\//i.test(v)) out.add(v);
      } else urlDentro(v, out, profondita + 1);
    }
  }
  return [...out];
}
