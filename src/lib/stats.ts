import { engine } from "./engines";
import { pesoPosizione } from "./score";
import type { Concorrente, EngineId, ProfiloAttivita, RigaDomanda } from "./types";

/**
 * Statistiche del report. Tutte derivate dalle celle domanda × assistente,
 * così ogni numero si può ricalcolare a mano dalla mappa.
 */

const volteDi = (c: { posizione: number | null; volte?: number; frequenza: string }) =>
  c.posizione === null ? 0 : (c.volte ?? Number(c.frequenza.split(" ")[0]));

/** Intervallo di confidenza di Wilson al 95% per una proporzione k/n. */
export function wilson(k: number, n: number, z = 1.96): { basso: number; alto: number } {
  if (n === 0) return { basso: 0, alto: 0 };
  const p = k / n;
  const den = 1 + (z * z) / n;
  const centro = (p + (z * z) / (2 * n)) / den;
  const semi = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
  return { basso: Math.max(0, centro - semi), alto: Math.min(1, centro + semi) };
}

/** Risposte in cui compari, sul totale, con intervallo al 95%. */
export function tassoCitazione(righe: RigaDomanda[], ripetizioni: number) {
  const n = righe.length * (righe[0]?.celle.length ?? 0) * ripetizioni;
  const k = righe.reduce((acc, r) => acc + r.celle.reduce((a, c) => a + volteDi(c), 0), 0);
  return { k, n, quota: n ? k / n : 0, ic: wilson(k, n) };
}

/** Domande in cui compari almeno una volta, sul totale. */
export function copertura(righe: RigaDomanda[]) {
  const k = righe.filter((r) => r.celle.some((c) => c.posizione !== null)).length;
  return { k, n: righe.length, quota: righe.length ? k / righe.length : 0 };
}

/**
 * Stabilità: quota di celle in cui le ripetizioni concordano tutte
 * (sempre citato o mai citato). Bassa stabilità = risposte che cambiano.
 */
export function stabilita(righe: RigaDomanda[], ripetizioni: number) {
  const celle = righe.flatMap((r) => r.celle);
  const concordi = celle.filter((c) => {
    const v = volteDi(c);
    return v === 0 || v === ripetizioni;
  }).length;
  return { concordi, totale: celle.length, quota: celle.length ? concordi / celle.length : 0 };
}

/** Posizione media quando compari, pesata per quante volte. */
export function posizioneMedia(righe: RigaDomanda[]): number | null {
  let somma = 0;
  let n = 0;
  for (const r of righe) {
    for (const c of r.celle) {
      const v = volteDi(c);
      if (!v || c.posizione === null) continue;
      somma += c.posizione * v;
      n += v;
    }
  }
  return n ? somma / n : null;
}

/** Punteggio 0–100 per ogni assistente: media del peso-posizione sulle sue risposte. */
export function punteggioPerMotore(righe: RigaDomanda[], ripetizioni: number): Record<EngineId, number> {
  const out = {} as Record<EngineId, number>;
  const motori = righe[0]?.celle.map((c) => c.motore) ?? [];
  for (const m of motori) {
    let somma = 0;
    let n = 0;
    for (const r of righe) {
      const c = r.celle.find((x) => x.motore === m);
      if (!c) continue;
      const v = volteDi(c);
      somma += v * pesoPosizione(c.posizione) + (ripetizioni - v) * 0;
      n += ripetizioni;
    }
    out[m] = n ? Math.round((somma / n) * 100) : 0;
  }
  return out;
}

/** Quanto pesa ogni assistente nel tuo punteggio: contributo = punteggio motore × peso rinormalizzato. */
export function contributi(righe: RigaDomanda[], ripetizioni: number): { motore: EngineId; punteggio: number; peso: number; contributo: number }[] {
  const perMotore = punteggioPerMotore(righe, ripetizioni);
  const motori = Object.keys(perMotore) as EngineId[];
  const sommaPesi = motori.reduce((acc, m) => acc + engine(m).peso, 0);
  return motori.map((m) => {
    const peso = engine(m).peso / sommaPesi;
    return { motore: m, punteggio: perMotore[m], peso, contributo: perMotore[m] * peso };
  });
}

/** Concentrazione: quota delle citazioni dei primi tre nomi sul totale dei citati. */
export function concentrazione(concorrenti: Concorrente[]) {
  const ordinati = [...concorrenti].sort((a, b) => b.citazioni - a.citazioni);
  const totale = ordinati.reduce((acc, c) => acc + c.citazioni, 0);
  const top3 = ordinati.slice(0, 3).reduce((acc, c) => acc + c.citazioni, 0);
  return { quotaTop3: totale ? top3 / totale : 0, totale };
}

/** Coerenza dei dati di scheda: campi controllati meno le incoerenze trovate. */
export function coerenzaDati(attivita: ProfiloAttivita) {
  const campi = ["nome", "indirizzo", "telefono", "orari", "categoria", "sito"];
  const incoerenti = Math.min(campi.length, attivita.incoerenze.length);
  return { coerenti: campi.length - incoerenti, totale: campi.length, campi };
}

/**
 * Proiezione lineare del punteggio sui prossimi mesi (minimi quadrati).
 * È indicativa: serve a vedere la direzione, non a promettere un numero.
 */
export function proiezione(punti: { mese: string; punteggio: number }[], mesi = 3): { pendenza: number; valori: number[] } {
  const n = punti.length;
  if (n < 3) return { pendenza: 0, valori: [] };
  const xs = punti.map((_, i) => i);
  const ys = punti.map((p) => p.punteggio);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const sxy = xs.reduce((acc, x, i) => acc + (x - mx) * (ys[i] - my), 0);
  const sxx = xs.reduce((acc, x) => acc + (x - mx) ** 2, 0);
  const pendenza = sxx ? sxy / sxx : 0;
  const intercetta = my - pendenza * mx;
  const valori = Array.from({ length: mesi }, (_, k) => Math.max(0, Math.min(100, Math.round(intercetta + pendenza * (n + k)))));
  return { pendenza, valori };
}

export const percentuale = (x: number) => `${Math.round(x * 100)}%`;
