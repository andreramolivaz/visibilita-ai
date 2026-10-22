import { engine } from "./engines";
import { pesoPosizione } from "./score";
import type { Concorrente, EngineId, ProfiloAttivita, RigaDomanda, RisultatoInformativa, RisultatoOccasione, RisultatoPunto, RisultatoZoom, SensibilitaForma, TipoDomanda, Zoom } from "./types";

/**
 * Statistiche del report. Tutte derivate dalle celle domanda × assistente,
 * così ogni numero si può ricalcolare a mano dalla mappa.
 *
 * Punteggio e numeri chiave usano solo le domande «spontanee», quelle in cui
 * il cliente non fa il nome dell'attività (generiche, per bisogno, per
 * specialità, per requisito, per prezzo, per occasione, per recensioni,
 * vicino a te): misurano se gli assistenti ti consigliano da soli. Le domande
 * sul nome e di confronto, in cui compari quasi per forza, e quelle
 * informative, che spesso non fanno nomi, sono riportate a parte.
 * È la distinzione tra ricordo spontaneo e sollecitato delle ricerche di marca.
 *
 * Gli intervalli sono due: quello di Wilson sulle risposte messe insieme, che
 * vale per «queste domande, questi assistenti, questi giorni», e quello «tra
 * domande» (bootstrap a grappoli per domanda), che vale per «questo tipo di
 * domande» ed è più largo, perché le risposte della stessa domanda sono
 * correlate (studio «Domande e statistiche», 2026).
 */

export const TIPI_SPONTANEI: TipoDomanda[] = ["generica", "bisogno", "specialita", "requisito", "prezzo", "occasione", "recensioni", "vicino"];

/**
 * Gli assistenti a cui si può impostare una posizione con le coordinate per
 * una domanda in italiano: Google AI (DataForSEO, location_coordinate) e
 * Perplexity (user_location). Gemini le accetta solo con il grounding Maps,
 * documentato per il solo inglese; ChatGPT e Claude ricevono la città; Grok nulla.
 */
export const MOTORI_CON_COORDINATE: EngineId[] = ["google-ai", "perplexity"];

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

/** Generatore pseudo-casuale deterministico (mulberry32): lo stesso intervallo a ogni calcolo. */
function casuale(seme: number) {
  return () => {
    seme |= 0;
    seme = (seme + 0x6d2b79f5) | 0;
    let t = Math.imul(seme ^ (seme >>> 15), 1 | seme);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Intervallo «tra domande» al 95%: bootstrap a grappoli che ricampiona le
 * domande intere (con tutte le loro risposte) e ricalcola la statistica;
 * percentili 2,5 e 97,5 di mille campioni. Vale per «questo tipo di domande»,
 * non solo per le domande fatte; con meno di due domande coincide con il valore.
 */
export function intervalloTraDomande<T>(gruppi: T[], statistica: (campione: T[]) => number, campioni = 1000, seme = 7): { basso: number; alto: number } {
  if (gruppi.length < 2) {
    const v = statistica(gruppi);
    return { basso: v, alto: v };
  }
  const r = casuale(seme);
  const valori: number[] = [];
  for (let b = 0; b < campioni; b++) {
    const campione = Array.from({ length: gruppi.length }, () => gruppi[Math.floor(r() * gruppi.length)]);
    valori.push(statistica(campione));
  }
  valori.sort((a, b) => a - b);
  const q = (p: number) => valori[Math.min(valori.length - 1, Math.max(0, Math.floor(p * valori.length)))];
  return { basso: q(0.025), alto: q(0.975) };
}

/**
 * Priori beta per la stima ridotta (metodo dei momenti sui gruppi stessi):
 * media delle quote e varianza tra gruppi al netto di quella binomiale.
 * κ dice quante risposte «vale» la media del report: un gruppo con n risposte
 * pesa n/(n+κ), la media κ/(n+κ). κ tra 4 e 200: mai nessuna riduzione, mai
 * solo la media.
 */
export function prioriBeta(gruppi: { k: number; n: number }[]): { media: number; kappa: number } {
  const validi = gruppi.filter((g) => g.n > 0);
  if (validi.length === 0) return { media: 0, kappa: 20 };
  const N = validi.reduce((a, g) => a + g.n, 0);
  const media = validi.reduce((a, g) => a + g.k, 0) / N;
  const quote = validi.map((g) => g.k / g.n);
  const m = quote.length;
  const mediaQuote = quote.reduce((a, b) => a + b, 0) / m;
  const varOsservata = m > 1 ? quote.reduce((a, q) => a + (q - mediaQuote) ** 2, 0) / (m - 1) : 0;
  const varBinomiale = (media * (1 - media)) / (N / m);
  const varTra = Math.max(varOsservata - varBinomiale, 1e-4);
  const kappa = Math.min(200, Math.max(4, (media * (1 - media)) / varTra - 1));
  return { media, kappa };
}

/** La stima ridotta di k/n verso la media del report, con il peso che la media ha avuto. */
export function ridotta(k: number, n: number, priori: { media: number; kappa: number }): { quota: number; peso: number } {
  const peso = priori.kappa / (n + priori.kappa);
  return { quota: (k + priori.media * priori.kappa) / (n + priori.kappa), peso };
}

/** L'intervallo tra domande non può essere più stretto di quello di Wilson: con poche domande il bootstrap sottostima, e si allarga a Wilson. */
function nonPiuStretto(traDomande: { basso: number; alto: number }, w: { basso: number; alto: number }) {
  return { basso: Math.min(traDomande.basso, w.basso), alto: Math.max(traDomande.alto, w.alto) };
}

/** Quota di risposte in cui compari su un insieme di righe (per il bootstrap). */
const quotaRighe = (righe: RigaDomanda[], ripetizioni: number) => {
  let k = 0;
  let n = 0;
  for (const r of righe) for (const c of r.celle) {
    n += ripetizioni;
    k += volteDi(c);
  }
  return n ? k / n : 0;
};

/** Risposte in cui compari, sul totale delle domande spontanee: intervallo di Wilson e intervallo tra domande. */
export function tassoCitazione(tutte: RigaDomanda[], ripetizioni: number) {
  const righe = spontanee(tutte);
  const n = righe.length * (righe[0]?.celle.length ?? 0) * ripetizioni;
  const k = righe.reduce((acc, r) => acc + r.celle.reduce((a, c) => a + volteDi(c), 0), 0);
  const ic = wilson(k, n);
  return { k, n, quota: n ? k / n : 0, ic, icDomande: nonPiuStretto(intervalloTraDomande(righe, (c) => quotaRighe(c, ripetizioni)), ic) };
}

/** Il punteggio ricalcolato dalle righe (posizione media per cella): serve al bootstrap tra domande. */
export function punteggioDaRighe(tutte: RigaDomanda[], ripetizioni: number): number {
  const righe = spontanee(tutte);
  const motori = righe[0]?.celle.map((c) => c.motore) ?? [];
  let somma = 0;
  let pesi = 0;
  for (const m of motori) {
    let s = 0;
    let n = 0;
    for (const r of righe) {
      const c = r.celle.find((x) => x.motore === m);
      if (!c) continue;
      s += (volteDi(c) / ripetizioni) * pesoPosizione(c.posizione);
      n++;
    }
    if (!n) continue;
    const peso = engine(m).peso;
    somma += (s / n) * peso;
    pesi += peso;
  }
  return pesi ? (somma / pesi) * 100 : 0;
}

/** L'intervallo tra domande del punteggio, in punti. */
export function punteggioIntervallo(tutte: RigaDomanda[], ripetizioni: number): { basso: number; alto: number } {
  const ic = intervalloTraDomande(spontanee(tutte), (c) => punteggioDaRighe(c, ripetizioni));
  return { basso: Math.round(ic.basso), alto: Math.round(ic.alto) };
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
  const conta = (righe: RigaDomanda[]) => {
    let k = 0;
    let n = 0;
    for (const r of righe) {
      for (const c of r.celle) {
        const v = volteDi(c);
        if (!v || c.posizione === null) continue;
        n += v;
        if (c.posizione <= 3) k += v;
      }
    }
    return { k, n, quota: n ? k / n : 0 };
  };
  const righe = spontanee(tutte);
  const tot = conta(righe);
  return { ...tot, icDomande: nonPiuStretto(intervalloTraDomande(righe, (c) => conta(c).quota), wilson(tot.k, tot.n)) };
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

/**
 * Il confronto diretto per concorrente: tutte le domande «meglio tu o X?» su X
 * messe insieme. Celle in cui sei il primo nome, su tutte le celle, e gli
 * assistenti che ti preferiscono almeno una volta.
 */
export function confrontoPerConcorrente(righe: RigaDomanda[]) {
  const per = new Map<string, { concorrente: string; domande: number; primo: number; celle: number; motoriPrimo: Set<EngineId> }>();
  for (const r of righe) {
    if (r.domanda.tipo !== "confronto") continue;
    const k = r.domanda.concorrente ?? "";
    const v = per.get(k) ?? { concorrente: k, domande: 0, primo: 0, celle: 0, motoriPrimo: new Set<EngineId>() };
    v.domande++;
    for (const c of r.celle) {
      v.celle++;
      if (c.posizione === 1) {
        v.primo++;
        v.motoriPrimo.add(c.motore);
      }
    }
    per.set(k, v);
  }
  return [...per.values()].map((v) => ({ ...v, motoriPrimo: [...v.motoriPrimo] }));
}

/** Assistenti che riportano i tuoi dati senza errori, sul totale. */
export function datiCorretti(descrizioni: { datiCorretti?: boolean }[]) {
  const noti = descrizioni.filter((d) => d.datiCorretti !== undefined);
  return { k: noti.filter((d) => d.datiCorretti).length, n: noti.length };
}

export const percentuale = (x: number) => `${Math.round(x * 100)}%`;

/* ---------- Il telescopio: zoom, punti intorno a te, occasioni, forme, informative ---------- */

const ORDINE_ZOOM: Zoom[] = ["citta", "zona", "vicino", "provincia", "regione", "nazionale"];

/**
 * Risposte in cui compari per livello di zoom (domande spontanee). Una domanda
 * «vicino a te» posta a un assistente che non accetta le coordinate è, di
 * fatto, una domanda in città: le sue risposte contano lì.
 */
export function perZoom(tutte: RigaDomanda[], ripetizioni: number, motoriConCoordinate: EngineId[] = MOTORI_CON_COORDINATE): RisultatoZoom[] {
  const out = new Map<Zoom, RisultatoZoom>();
  const prendi = (z: Zoom) => {
    const v = out.get(z) ?? { zoom: z, comparse: 0, totale: 0, domande: 0 };
    out.set(z, v);
    return v;
  };
  for (const r of spontanee(tutte)) {
    const z = r.domanda.zoom ?? "citta";
    prendi(z).domande++;
    for (const c of r.celle) {
      const v = prendi(z === "vicino" && !motoriConCoordinate.includes(c.motore) ? "citta" : z);
      v.totale += ripetizioni;
      v.comparse += volteDi(c);
    }
  }
  return ORDINE_ZOOM.filter((z) => out.has(z) && out.get(z)!.totale > 0).map((z) => out.get(z)!);
}

/** Risposte in cui compari per occasione (domande per occasione). */
export function perOccasione(tutte: RigaDomanda[], ripetizioni: number): RisultatoOccasione[] {
  const out = new Map<string, RisultatoOccasione>();
  for (const r of tutte) {
    if (r.domanda.tipo !== "occasione" || !r.domanda.occasione) continue;
    const v = out.get(r.domanda.occasione) ?? { occasione: r.domanda.occasione, comparse: 0, totale: 0, domande: 0 };
    v.domande++;
    for (const c of r.celle) {
      v.totale += ripetizioni;
      v.comparse += volteDi(c);
    }
    out.set(r.domanda.occasione, v);
  }
  return [...out.values()].sort((a, b) => b.comparse / Math.max(1, b.totale) - a.comparse / Math.max(1, a.totale));
}

/**
 * Intorno a te: per ogni punto in cui è stata impostata la posizione, le
 * risposte che ti citano, contate solo sugli assistenti che accettano le coordinate.
 */
export function intornoATe(tutte: RigaDomanda[], ripetizioni: number, motori: EngineId[] = MOTORI_CON_COORDINATE): RisultatoPunto[] {
  const out = new Map<string, RisultatoPunto>();
  for (const r of tutte) {
    if (r.domanda.tipo !== "vicino" || !r.domanda.punto) continue;
    const k = r.domanda.punto.etichetta;
    const v = out.get(k) ?? { punto: r.domanda.punto, comparse: 0, totale: 0 };
    for (const c of r.celle) {
      if (!motori.includes(c.motore)) continue;
      v.totale += ripetizioni;
      v.comparse += volteDi(c);
    }
    out.set(k, v);
  }
  // Un punto ha poche risposte: la stima ridotta lo tira verso la media dei punti, con il peso dichiarato.
  const punti = [...out.values()];
  const priori = prioriBeta(punti.map((p) => ({ k: p.comparse, n: p.totale })));
  priori.kappa = Math.min(100, Math.max(8, priori.kappa));
  return punti.map((p) => {
    const r = ridotta(p.comparse, p.totale, priori);
    return { ...p, ridotta: r.quota, peso: r.peso };
  });
}

/** In quanti punti compari almeno una volta: la lettura aggregata della griglia (alla Local Falcon). */
export function quotaPunti(punti: RisultatoPunto[]) {
  const k = punti.filter((p) => p.comparse > 0).length;
  return { k, n: punti.length, quota: punti.length ? k / punti.length : 0 };
}

/**
 * Quanto conta la forma della domanda, a livello di report: sulle domande
 * chieste in forma breve e a lista, la differenza di quota appaiata per
 * domanda e il suo errore standard. Sotto due errori è rumore: le due forme
 * sono scambiabili e si sommano.
 */
export function sensibilitaForma(tutte: RigaDomanda[]): SensibilitaForma {
  const breve = { comparse: 0, totale: 0 };
  const lista = { comparse: 0, totale: 0 };
  const differenze: number[] = [];
  for (const r of spontanee(tutte)) {
    let kb = 0;
    let nb = 0;
    let kl = 0;
    let nl = 0;
    for (const c of r.celle) {
      const f = c.perForma;
      if (!f?.breve || !f?.lista) continue;
      kb += f.breve.volte;
      nb += f.breve.totale;
      kl += f.lista.volte;
      nl += f.lista.totale;
    }
    if (!nb || !nl) continue;
    breve.comparse += kb;
    breve.totale += nb;
    lista.comparse += kl;
    lista.totale += nl;
    differenze.push(kl / nl - kb / nb);
  }
  const n = differenze.length;
  const media = n ? differenze.reduce((a, b) => a + b, 0) / n : 0;
  const sd = n > 1 ? Math.sqrt(differenze.reduce((a, d) => a + (d - media) ** 2, 0) / (n - 1)) : 0;
  return { domande: n, breve, lista, differenza: media * 100, errore: (n ? sd / Math.sqrt(n) : 0) * 100 };
}

/** Le domande informative: quante risposte fanno almeno un nome e in quante ci sei tu. */
export function informativa(tutte: RigaDomanda[], ripetizioni: number): RisultatoInformativa | undefined {
  const righe = tutte.filter((r) => r.domanda.tipo === "informativa");
  if (righe.length === 0) return undefined;
  let risposte = 0;
  let conNomi = 0;
  let comparse = 0;
  for (const r of righe) {
    for (const c of r.celle) {
      risposte += ripetizioni;
      conNomi += c.conNomi ?? 0;
      comparse += volteDi(c);
    }
  }
  return { domande: righe.length, risposte, conNomi, comparse };
}

/**
 * Risposte in cui compari per famiglia di domanda: Wilson sulle risposte,
 * intervallo tra domande, e stima ridotta verso la media delle famiglie
 * spontanee con il peso che la media ha avuto (una famiglia da 4 domande
 * prende in prestito forza dal resto del report).
 */
export function perFamiglia(tutte: RigaDomanda[], ripetizioni: number) {
  const out = new Map<TipoDomanda, { tipo: TipoDomanda; k: number; n: number; domande: number; righe: RigaDomanda[] }>();
  for (const r of tutte) {
    const v = out.get(r.domanda.tipo) ?? { tipo: r.domanda.tipo, k: 0, n: 0, domande: 0, righe: [] };
    v.domande++;
    v.righe.push(r);
    for (const c of r.celle) {
      v.n += ripetizioni;
      v.k += volteDi(c);
    }
    out.set(r.domanda.tipo, v);
  }
  const famiglie = [...out.values()];
  const priori = prioriBeta(famiglie.filter((f) => TIPI_SPONTANEI.includes(f.tipo)).map((f) => ({ k: f.k, n: f.n })));
  return famiglie.map(({ righe, ...v }) => {
    const r = TIPI_SPONTANEI.includes(v.tipo) ? ridotta(v.k, v.n, priori) : { quota: v.n ? v.k / v.n : 0, peso: 0 };
    const ic = wilson(v.k, v.n);
    return { ...v, quota: v.n ? v.k / v.n : 0, ic, icDomande: nonPiuStretto(intervalloTraDomande(righe, (c) => quotaRighe(c, ripetizioni)), ic), ridotta: r.quota, peso: r.peso };
  });
}
