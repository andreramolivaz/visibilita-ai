import type { Azione, ErroreScheda, Fonte, ProfiloAttivita, RisultatoTipo, Termine } from "../types";
import { profilo } from "../profiles";

/**
 * Le tre azioni, a regole: ogni regola scatta su un dato del report e stima
 * i punti dal peso di quel dato. Nessun testo inventato: titoli dal profilo
 * di categoria, numeri dal report. La verifica è la scansione successiva.
 */

interface Ingredienti {
  attivita: ProfiloAttivita;
  totaleRisposte: number;
  fonti: Fonte[];
  errori: ErroreScheda[];
  termini: Termine[];
  perTipo: RisultatoTipo[];
  noteSito: string[];
  /** Domande in inglese senza citazioni, se il profilo le prevede. */
  ingleseVuoto?: boolean;
}

const limita = (x: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(x)));

export function azioniDaRegole(x: Ingredienti): Azione[] {
  const cat = profilo(x.attivita.categoria);
  const titoloPer = (codici: string[], altrimenti: string) => cat.azioni.find((a) => codici.includes(a.codice))?.titolo ?? altrimenti;
  const out: (Azione & { punti: number })[] = [];

  // 1. La fonte più citata in cui non ci sei.
  const mancante = x.fonti.find((f) => !f.ciSei && f.nome !== "Sito ufficiale");
  if (mancante && x.totaleRisposte > 0) {
    const quota = mancante.citazioni / x.totaleRisposte;
    const punti = limita(quota * 25, 3, 12);
    const titoloProfilo = titoloPer(["portale", "ota", "directory", "thefork", "albo"], "");
    const titolo = titoloProfilo && titoloProfilo.includes(mancante.nome) ? titoloProfilo : `Apri o aggiorna la scheda su ${mancante.nome}`;
    out.push({
      titolo,
      dato: `È la fonte più citata in cui non ci sei (${mancante.citazioni} risposte su ${x.totaleRisposte}${mancante.concorrentiPresenti !== undefined ? `; concorrenti presenti: ${mancante.concorrentiPresenti} su 5` : ""}).`,
      impatto: punti >= 7 ? "alto" : "medio",
      impattoStimato: punti,
      punti,
    });
  }

  // 2. Dati sbagliati nelle risposte.
  if (x.errori.length > 0) {
    const punti = limita(3 + x.errori.length * 2, 4, 9);
    out.push({
      titolo: titoloPer(["scheda-google", "coerenza", "albo"], "Correggi i dati sulla scheda Google e sul sito"),
      dato: `${x.errori.length} ${x.errori.length === 1 ? "errore" : "errori"} nei dati riportati dagli assistenti: ${x.errori.map((e) => e.testo).join("; ")}.`,
      impatto: punti >= 7 ? "alto" : "medio",
      impattoStimato: punti,
      punti,
    });
  }

  // 3. Sito povero o menu solo in PDF.
  const notaSito = x.noteSito.find((n) => /PDF|poco testo|non risponde|Nessun sito/i.test(n));
  if (notaSito) {
    const punti = /Nessun sito|non risponde/i.test(notaSito) ? 7 : 5;
    out.push({
      titolo: titoloPer(["sito-servizi", "catalogo", "sito-prestazioni", "sito-materie", "sito-visita", "menu-testo"], "Pubblica sul sito una pagina in testo per ogni servizio"),
      dato: notaSito,
      impatto: punti >= 7 ? "alto" : "medio",
      impattoStimato: punti,
      punti,
    });
  }

  // 4. Termini che gli assistenti usano e tu no.
  const mancanti = x.termini.filter((t) => !t.ceLHai).slice(0, 2);
  if (mancanti.length > 0) {
    const volte = mancanti.reduce((acc, t) => acc + t.volte, 0);
    const punti = limita(2 + (x.totaleRisposte ? (volte / x.totaleRisposte) * 10 : 0), 2, 6);
    out.push({
      titolo: `${titoloPer(["recensioni-termini"], "Chiedi recensioni che citino")}: ${mancanti.map((t) => `«${t.termine}»`).join(" e ")}`,
      dato: `${mancanti.map((t) => `«${t.termine}» ${t.volte} volte nelle risposte, ${t.volteTue ?? 0} nelle tue recensioni`).join("; ")}.`,
      impatto: punti >= 5 ? "medio" : "basso",
      impattoStimato: punti,
      punti,
    });
  }

  // 5. Domande per bisogno molto più deboli delle generiche: orari, servizi e prezzi non sono leggibili.
  const generica = x.perTipo.find((t) => t.tipo === "generica");
  const bisogno = x.perTipo.find((t) => t.tipo === "bisogno");
  if (generica && bisogno && generica.totale && bisogno.totale && bisogno.comparse / bisogno.totale < (generica.comparse / generica.totale) / 2) {
    out.push({
      titolo: "Metti orari, servizi e prezzi in chiaro sulla scheda Google e sul sito",
      dato: `Nelle domande per bisogno compari in ${bisogno.comparse} risposte su ${bisogno.totale}, in quelle generiche in ${generica.comparse} su ${generica.totale}.`,
      impatto: "medio",
      impattoStimato: 3,
      punti: 3,
    });
  }

  // 6. Export: domande in inglese senza citazioni.
  if (x.ingleseVuoto) {
    out.push({
      titolo: titoloPer(["inglese"], "Versione inglese delle pagine chiave del sito"),
      dato: "Nelle domande in inglese non compari mai.",
      impatto: "medio",
      impattoStimato: 4,
      punti: 4,
    });
  }

  return out
    .sort((a, b) => b.punti - a.punti)
    .slice(0, 3)
    .map((a) => ({ titolo: a.titolo, dato: a.dato, impatto: a.impatto, impattoStimato: a.impattoStimato }));
}
