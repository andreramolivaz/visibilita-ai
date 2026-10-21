import { engine } from "./engines";
import type { EngineId, Posizione, Risposta, Verdetto } from "./types";

/** 1º posto vale 1, 5º vale 0,4; oltre il 5º o assente vale 0. */
export function pesoPosizione(p: Posizione): number {
  if (p === null) return 0;
  const tabella: Record<number, number> = { 1: 1, 2: 0.85, 3: 0.7, 4: 0.55, 5: 0.4 };
  return tabella[p] ?? 0;
}

/**
 * Punteggio di visibilità AI (0–100).
 *
 * Per ogni motore: media del peso-posizione sulle sue risposte.
 * Il totale è la media pesata per quota d'uso dei motori interrogati,
 * rinormalizzata sui soli motori attivi, così il punteggio resta 0–100
 * anche con sei motori su otto.
 */
export function punteggio(risposte: Risposta[], motori: EngineId[]): number {
  let somma = 0;
  let pesi = 0;
  for (const id of motori) {
    const mie = risposte.filter((r) => r.motore === id);
    if (mie.length === 0) continue;
    const media = mie.reduce((acc, r) => acc + pesoPosizione(r.posizione), 0) / mie.length;
    const peso = engine(id).peso;
    somma += media * peso;
    pesi += peso;
  }
  if (pesi === 0) return 0;
  return Math.round((somma / pesi) * 100);
}

export function verdetto(p: number): Verdetto {
  if (p <= 10) return "Invisibile";
  if (p <= 40) return "Poco visibile";
  if (p <= 70) return "Visibile";
  return "Dominante";
}

/** "2 su 3" */
export function frequenza(comparse: number, totale: number): string {
  return `${comparse} su ${totale}`;
}
