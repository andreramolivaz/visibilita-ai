import { engine } from "./engines";
import { pesoPosizione } from "./score";
import type { Concorrente, EngineId, ProfiloAttivita, RigaDomanda, TipoDomanda } from "./types";

/**
 * Statistiche del report. Tutte derivate dalle celle domanda × assistente,
 * così ogni numero si può ricalcolare a mano dalla mappa.
 *
 * Punteggio e numeri chiave usano solo le domande «spontanee», quelle in cui
 * il cliente non fa il nome dell'attività (generiche, per bisogno, per
 * specialità, per requisito): misurano se gli assistenti ti consigliano da
 * soli. Le domande sul nome e di confronto, in cui compari quasi per forza,
 * sono riportate a parte (nella mappa, per tipo, in «cosa dicono di te»).
 * È la distinzione tra ricordo spontaneo e sollecitato delle ricerche di marca.
 */

export const TIPI_SPONTANEI: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito"];

export const spontanee = (righe: RigaDomanda[]) => righe.filter((r) => TIPI_SPONTANEI.includes(r.domanda.tipo));

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

/** Risposte in cui compari, sul totale delle domande spontanee, con intervallo al 95%. */
export function tassoCitazione(tutte: RigaDomanda[], ripetizioni: number) {
  const righe = spontanee(tutte);
  const n = righe.length * (righe[0]?.celle.length ?? 0) * ripetizioni;
  const k = righe.reduce((acc, r) => acc + r.celle.reduce((a, c) => a + volteDi(c), 0), 0);
  return { k, n, quota: n ? k / n : 0, ic: wilson(k, n) };
}

/** Domande spontanee in cui compari almeno una volta, sul totale. */
export function copertura(tutte: RigaDomanda[]) {
  const righe = spontanee(tutte);
  const k = righe.filter((r) => r.celle.some((c) => c.posizione !== null)).length;
  return { k, n: righe.length, quota: righe.length ? k / righe.length : 0 };
}

/**
 * Stabilità: quota di celle in cui le ripetizioni concordano tutte
 * (sempre citato o mai citato). Bassa stabilità = risposte che cambiano.
 */
export function stabilita(tutte: RigaDomanda[], ripetizioni: number) {
  const celle = spontanee(tutte).flatMap((r) => r.celle);
  const concordi = celle.filter((c) => {
    const v = volteDi(c);
    return v === 0 || v === ripetizioni;
  }).length;
  return { concordi, totale: celle.length, quota: celle.length ? concordi / celle.length : 0 };
}

/** Posizione media quando compari (domande spontanee), pesata per quante volte. */
export function posizioneMedia(tutte: RigaDomanda[]): number | null {
  let somma = 0;
  let n = 0;
  for (const r of spontanee(tutte)) {
    for (const c of r.celle) {
      const v = volteDi(c);
      if (!v || c.posizione === null) continue;
      somma += c.posizione * v;
      n += v;
    }
  }
  return n ? somma / n : null;
}

/** Punteggio 0–100 per ogni assistente: media del peso-posizione sulle sue risposte alle domande spontanee. */
export function punteggioPerMotore(tutte: RigaDomanda[], ripetizioni: number): Record<EngineId, number> {
  const righe = spontanee(tutte);
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
 * Quota di voce: le citazioni di un'attività su tutte le citazioni di attività
 * nelle stesse risposte (Peec, Profound, Semrush, BrightLocal la definiscono così).
 * Se il totale non è noto, si usa la somma dei nomi elencati.
 */
export function quotaVoce(concorrenti: Concorrente[], citazioniTotali?: number): Record<string, number> {
  const totale = citazioniTotali ?? concorrenti.reduce((acc, c) => acc + c.citazioni, 0);
  const out: Record<string, number> = {};
  for (const c of concorrenti) out[c.nome] = totale ? c.citazioni / totale : 0;
  return out;
}

/**
 * Nei primi tre: quota delle tue citazioni in cui sei tra i primi tre nomi.
 * La posizione esatta oscilla tra una risposta e l'altra; «primi tre o oltre» è stabile.
 */
export function primiTre(tutte: RigaDomanda[]) {
  let k = 0;
  let n = 0;
  for (const r of spontanee(tutte)) {
    for (const c of r.celle) {
      const v = volteDi(c);
      if (!v || c.posizione === null) continue;
      n += v;
      if (c.posizione <= 3) k += v;
    }
  }
  return { k, n, quota: n ? k / n : 0 };
}

/**
 * Territorio: ogni domanda del set è in uno di tre stati.
 * «tue»: compari almeno una volta; «contese»: non compari e c'è almeno un
 * concorrente; «libere»: non compare nessuno in modo riconoscibile.
 */
export function territorio(tutte: RigaDomanda[]) {
  const righe = spontanee(tutte);
  const tue: RigaDomanda[] = [];
  const contese: RigaDomanda[] = [];
  const libere: RigaDomanda[] = [];
  for (const r of righe) {
    if (r.celle.some((c) => c.posizione !== null)) tue.push(r);
    else if ((r.concorrentiCitati ?? 1) > 0) contese.push(r);
    else libere.push(r);
  }
  return { tue, contese, libere, n: righe.length };
}

/**
 * Il confronto diretto: alle domande «meglio tu o X?», in quanti assistenti
 * sei il primo nome (cioè ti preferiscono). Una riga per domanda di confronto.
 */
export function confrontoDiretto(righe: RigaDomanda[]) {
  return righe
    .filter((r) => r.domanda.tipo === "confronto")
    .map((r) => {
      const risposte = r.celle.filter((c) => c.posizione !== null);
      const preferito = r.celle.filter((c) => c.posizione === 1);
      return { domanda: r.domanda, concorrente: r.domanda.concorrente, preferito: preferito.map((c) => c.motore), assistenti: r.celle.length, risposte: risposte.length };
    });
}

/** Assistenti che riportano i tuoi dati senza errori, sul totale. */
export function datiCorretti(descrizioni: { datiCorretti?: boolean }[]) {
  const noti = descrizioni.filter((d) => d.datiCorretti !== undefined);
  return { k: noti.filter((d) => d.datiCorretti).length, n: noti.length };
}

export const percentuale = (x: number) => `${Math.round(x * 100)}%`;
