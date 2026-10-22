import type { Report } from "./types";
import { pesoPosizione } from "./score";

/**
 * La simulazione «più punteggio, più clienti»: dal punteggio del report ai
 * clienti e agli euro al mese, in quattro passi, ognuno con la sua assunzione
 * dichiarata. Non è una previsione: dà l'ordine di grandezza di quello che è
 * in gioco. La usano la home (con l'attività di esempio) e, con i numeri veri,
 * il report.
 *
 *   richieste al mese  ×  quota di risposte in cui compari (il punteggio)
 *   ×  quota di chi ti sceglie (sale se sei il primo nome)  ×  quota di chi va di persona
 */
export const ASSUNZIONI = {
  /** Quota degli adulti (su tutti gli abitanti). ISTAT: circa 83% della popolazione ha più di 17 anni. */
  adulti: 0.83,
  /** 35,3% degli adulti italiani online decide un acquisto con la ricerca generativa (IAB Italia, Osservatorio Search 2026, 1.000 adulti, marzo 2026). */
  quotaAI: 0.35,
  /** 64,4% di chi decide con l'AI va poi in un negozio o in un locale fisico (IAB Italia 2026). */
  visita: 0.64,
  /** Chi ti vede nella risposta ti sceglie una volta su quattro se sei uno dei nomi… */
  sceltaMinima: 0.25,
  /** …e quasi una su due se sei il primo nome. Il punteggio pesa la posizione, quindi la quota di scelta sale con lui. */
  sceltaMassima: 0.45,
} as const;

export interface ParametriImpatto {
  /** Persone che ogni mese chiedono a un assistente un'attività come la tua, nella tua città. */
  richiesteMese: number;
  /** Ricavo medio per cliente, in euro: uno scontrino, una visita, una commessa. */
  ricavoCliente: number;
}

export interface Impatto {
  /** Clienti al mese che arrivano da una risposta AI. */
  clienti: number;
  ricavoMese: number;
  ricavoAnno: number;
}

/** Quota di chi ti vede nella risposta e ti sceglie: dal 25% (uno dei nomi) al 45% (sempre il primo). */
export function quotaScelta(punteggio: number): number {
  const p = Math.min(100, Math.max(0, punteggio)) / 100;
  return ASSUNZIONI.sceltaMinima + (ASSUNZIONI.sceltaMassima - ASSUNZIONI.sceltaMinima) * p;
}

/** Clienti ed euro al mese a un dato punteggio. */
export function impattoA(punteggio: number, p: ParametriImpatto): Impatto {
  const quota = Math.min(100, Math.max(0, punteggio)) / 100;
  const clienti = p.richiesteMese * quota * quotaScelta(punteggio) * ASSUNZIONI.visita;
  const ricavoMese = clienti * p.ricavoCliente;
  return { clienti: Math.round(clienti), ricavoMese: Math.round(ricavoMese), ricavoAnno: Math.round(ricavoMese * 12) };
}

/**
 * Quante persone al mese chiedono a un assistente un'attività come la tua:
 * abitanti → adulti → quota che decide con l'AI → quota che in un mese cerca
 * un'attività di quella categoria (`quotaCerca`: sei adulti su cento per una
 * pizzeria, uno su cento per un dentista).
 */
export function stimaRichieste(abitanti: number, quotaCerca: number): number {
  return Math.round((abitanti * ASSUNZIONI.adulti * ASSUNZIONI.quotaAI * quotaCerca) / 50) * 50;
}

/**
 * Il punteggio che avrebbe il primo concorrente del report, stimato dalle sue
 * citazioni: nei primi tre pesa come una media dei primi tre posti, oltre
 * come il quarto. Serve alla simulazione come traguardo («il primo in città»).
 */
export function punteggioDelPrimo(report: Report): number {
  const primo = report.concorrenti.find((c) => !c.seiTu);
  if (!primo || primo.totale === 0) return 60;
  const pesoPrimiTre = (pesoPosizione(1) + pesoPosizione(2) + pesoPosizione(3)) / 3;
  const primiTre = primo.primiTre ?? Math.round(primo.citazioni * 0.7);
  const oltre = Math.max(0, primo.citazioni - primiTre);
  return Math.round(((primiTre * pesoPrimiTre + oltre * pesoPosizione(4)) / primo.totale) * 100);
}
