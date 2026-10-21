import type { Domanda, EngineId, Piano, ProfiloAttivita, SegnaliProfilo } from "../types";
import { motoriAttivi } from "../engines";
import { interroga, motoriConfigurati } from "../motori";
import { analizzaRisposta } from "../analisi/riconoscimento";
import { costruisciReport } from "../analisi/costruisci";
import { deposito } from "./deposito";
import type { Avanzamento, Cella, Scansione } from "./tipi";

/**
 * La coda di scansione: una cella per domanda × assistente × ripetizione.
 * Niente processi che girano sempre: ogni chiamata ad `avanza` esegue un lotto
 * di celle scadute, con un assistente alla volta per assistente e gli
 * assistenti in parallelo, entro un tempo massimo; se restano celle scadute,
 * chi chiama si richiama. Le ripetizioni dell'abbonamento stanno in giorni
 * diversi: le celle future aspettano il passaggio giornaliero.
 */

const GIORNO_MS = 24 * 60 * 60 * 1000;

export function nuovoId() {
  return `scan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ripetizioniPer(piano: Piano) {
  return piano === "gratuito" ? 2 : 3;
}

export async function creaScansione(x: {
  piano: Piano;
  attivita: ProfiloAttivita;
  domande: Domanda[];
  segnali?: SegnaliProfilo;
  recensioni?: string[];
  email?: string;
}): Promise<Scansione> {
  const configurati = motoriConfigurati();
  const simulata = configurati.length === 0;
  const motori: EngineId[] = simulata ? motoriAttivi().map((m) => m.id) : configurati;
  const ripetizioni = ripetizioniPer(x.piano);
  const ora = new Date();
  const celle: Cella[] = [];
  if (!simulata) {
    for (let r = 1; r <= ripetizioni; r++) {
      // Test gratuito: tutto subito. Abbonamento: una ripetizione al giorno.
      const scadenza = x.piano === "gratuito" ? ora : new Date(ora.getTime() + (r - 1) * GIORNO_MS);
      for (const d of x.domande) for (const m of motori) celle.push({ domandaId: d.id, motore: m, ripetizione: r, eseguiDopo: scadenza.toISOString(), stato: "da fare" });
    }
  }
  const s: Scansione = {
    id: nuovoId(),
    piano: x.piano,
    email: x.email,
    attivita: x.attivita,
    domande: x.domande,
    motori,
    ripetizioni,
    segnali: x.segnali,
    recensioni: x.recensioni ?? [],
    concorrentiNoti: (x.segnali?.concorrenti ?? []).map((c) => c.nome),
    celle,
    stato: simulata ? "completata" : "in corso",
    creataIl: ora.toISOString(),
    aggiornataIl: ora.toISOString(),
    simulata,
  };
  await deposito().salvaScansione(s);
  return s;
}

export function avanzamentoDi(s: Scansione): Avanzamento {
  const ora = new Date().toISOString();
  const daFare = s.celle.filter((c) => c.stato === "da fare");
  const future = daFare.filter((c) => c.eseguiDopo > ora);
  const prossima = future.map((c) => c.eseguiDopo).sort()[0];
  return {
    id: s.id,
    stato: s.stato,
    fatte: s.celle.length - daFare.length,
    totale: s.celle.length,
    inAttesa: future.length,
    prossimaIl: prossima,
    corrente: daFare[0] ? { motore: daFare[0].motore, domandaId: daFare[0].domandaId } : undefined,
    reportId: s.reportId,
    simulata: Boolean(s.simulata),
  };
}

/**
 * Esegue le celle scadute, fino a `maxCelle` e per al massimo `budgetMs`.
 * Ritorna l'avanzamento e quante celle scadute restano.
 */
export async function avanza(id: string, opzioni: { maxCelle?: number; budgetMs?: number } = {}): Promise<(Avanzamento & { restano: number }) | null> {
  const { maxCelle = 36, budgetMs = 200_000 } = opzioni;
  const dep = deposito();
  const s = await dep.leggiScansione(id);
  if (!s) return null;
  if (s.simulata || s.stato === "completata") return { ...avanzamentoDi(s), restano: 0 };

  const partenza = Date.now();
  const ora = new Date().toISOString();
  const scadute = s.celle.filter((c) => c.stato === "da fare" && c.eseguiDopo <= ora);
  const lotto = scadute.slice(0, maxCelle);
  const perMotore = new Map<EngineId, Cella[]>();
  for (const c of lotto) perMotore.set(c.motore, [...(perMotore.get(c.motore) ?? []), c]);

  const q = (c: Cella) => {
    const d = s.domande.find((x) => x.id === c.domandaId)!;
    return { domanda: d.testo, citta: s.attivita.citta, regione: s.attivita.regione, coordinate: s.attivita.coordinate, lingua: "it" as const };
  };

  await Promise.all(
    [...perMotore.entries()].map(async ([motore, celle]) => {
      for (const c of celle) {
        if (Date.now() - partenza > budgetMs) break;
        const risposta = await interroga(motore, q(c));
        if (risposta.errore && !risposta.testo) {
          c.stato = "errore";
          c.risposta = risposta;
        } else {
          c.stato = "fatta";
          c.risposta = risposta;
          c.analisi = analizzaRisposta(risposta.testo, risposta.fonti, s.attivita, s.concorrentiNoti);
        }
        await dep.salvaCella(s.id, c);
      }
    }),
  );

  const adesso = new Date().toISOString();
  const restanti = s.celle.filter((c) => c.stato === "da fare");
  const restanoScadute = restanti.filter((c) => c.eseguiDopo <= adesso).length;
  s.aggiornataIl = adesso;
  if (restanti.length === 0) {
    const report = costruisciReport(s);
    await dep.salvaReport(report, s.email);
    s.stato = "completata";
    s.reportId = report.id;
  } else {
    s.stato = restanoScadute > 0 ? "in corso" : "in attesa";
  }
  await dep.aggiornaStato(s);
  return { ...avanzamentoDi(s), restano: restanoScadute };
}

/** Le scansioni con celle scadute, per il passaggio giornaliero. */
export async function scansioniDaAvanzare(): Promise<string[]> {
  return deposito().scansioniDaAvanzare(new Date().toISOString());
}
