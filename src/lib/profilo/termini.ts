import type { TermineRicorrente } from "../types";

/**
 * Termini ricorrenti in un insieme di testi (recensioni, pagine del sito):
 * parole e coppie o terne di parole, al netto di quelle comuni, contate per
 * documento (in quante recensioni compaiono, non quante volte in totale).
 * Deterministico e spiegabile: «forno a legna: in 12 recensioni».
 */

const STOPWORD = new Set(
  `a ad al alla alle allo ai agli all anche ancora avere aveva avevo avete abbiamo hanno ha ho hai
  bene buon buona buone buoni buono c che chi ci cioè come con cosa così cui da dal dalla dalle dallo dai dagli
  degli dei del della delle dello di do dopo dove due e è ed era erano essere fa fare fatto fra gli ha hanno
  i il in io l la le lei li lo loro lui ma me meno mi mia mie miei mio molto nel nella nelle nello nei negli ne
  no noi non nostra nostro o ogni oppure per però più poco poi presso qua qualche quale quando quanto quasi quel
  quella quelle quelli quello questa queste questi questo qui sa se sei sempre senza si sia siamo siete sono
  sopra sotto sta stata stati stato stesso su sua sue sui sul sulla sulle sullo suo tra tu tua tue tuo tutta
  tutte tutti tutto un una uno va vi via voi vostra vostro
  davvero veramente proprio sempre tanto troppo molto ottimo ottima ottimi ottime super top bello bella belli
  belle grande grazie consiglio consigliato consigliatissimo consigliata consigliamo torneremo tornerò
  tornare torno posto locale esperienza personale servizio staff gentile gentili gentilissimi cordiale
  cordiali disponibile disponibili professionale professionali professionalità qualità prezzo prezzi rapporto
  eccellente eccezionale perfetto perfetta fantastico fantastica splendido splendida piacevole simpatico
  simpatica accogliente pulito pulita cliente clienti anni anno volta volte sera pranzo cena giorno oggi ieri
  stasera sempre mai ancora già anche solo appena subito sicuramente assolutamente complimenti bravo brava
  bravi brave migliore migliori peggio peggiore tutto niente nulla altro altri altra altre stesso stessa
  the and of to in is it for with on at by this that you we our your their from or as be are was were
  euro km minuti ore ora
  recensioni recensione citato citati citata spesso spesso consigliano consigliata consigliate ecco alcune alcuni
  menu home contatti contattaci prenota prenotazioni scopri leggi privacy cookie policy news blog galleria foto
  chi siamo dove orari mappa seguici iscriviti newsletter copyright via tel email info pagina sito web
  servizi prodotti azienda carta listino`
    .split(/\s+/)
    .filter(Boolean),
);

const PUNTEGGIATURA = /[^\p{L}\p{N}\s'’-]/gu;

export function tokenizza(testo: string): string[] {
  return testo
    .toLowerCase()
    .replace(PUNTEGGIATURA, " ")
    .replace(/['’]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/** Radice grossolana: le prime 4 lettere delle parole lunghe («pizzeria» e «pizza» si somigliano). */
const radice = (t: string) => (t.length >= 5 ? t.slice(0, 4) : t);

function valido(gramma: string[]): boolean {
  if (gramma.every((t) => STOPWORD.has(t))) return false;
  const primo = gramma[0];
  const ultimo = gramma[gramma.length - 1];
  if (STOPWORD.has(primo) || STOPWORD.has(ultimo)) return false;
  if (gramma.length === 1 && (primo.length < 4 || /^\d+$/.test(primo))) return false;
  if (gramma.some((t) => /^\d+$/.test(t))) return false;
  return true;
}

/**
 * @param testi un documento per elemento (una recensione, una pagina)
 * @param escludi parole da ignorare (il nome dell'attività, la categoria, la città)
 */
export function estraiTermini(testi: string[], escludi: string[] = [], opzioni: { minimo?: number; massimo?: number; nGrammi?: number } = {}): TermineRicorrente[] {
  const { minimo = 2, massimo = 12, nGrammi = 3 } = opzioni;
  const vietate = new Set(escludi.flatMap((e) => tokenizza(e)).filter((t) => !STOPWORD.has(t)));
  const radiciVietate = new Set([...vietate].filter((t) => t.length >= 5).map(radice));
  const vietato = (t: string) => vietate.has(t) || (t.length >= 5 && radiciVietate.has(radice(t)));
  const conteggio = new Map<string, number>();
  for (const testo of testi) {
    const visti = new Set<string>();
    // Gli n-grammi non attraversano la punteggiatura: «pizza napoletana. Impasto» non dà «napoletana impasto».
    for (const segmento of testo.split(/[.!?;:\n•|()\[\]]+/)) {
      const tok = tokenizza(segmento);
      for (let n = 1; n <= nGrammi; n++) {
        for (let i = 0; i + n <= tok.length; i++) {
          const g = tok.slice(i, i + n);
          if (!valido(g) || g.some(vietato)) continue;
          visti.add(g.join(" "));
        }
      }
    }
    for (const g of visti) conteggio.set(g, (conteggio.get(g) ?? 0) + 1);
  }
  // Un n-gramma più lungo assorbe quello più corto se compare per lo più insieme («forno a legna» vs «legna»).
  const voci = [...conteggio.entries()].filter(([, v]) => v >= minimo).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
  const SOGLIA = 0.6;
  const scelti: TermineRicorrente[] = [];
  const pieni = (t: string) => t.split(" ").filter((x) => !STOPWORD.has(x));
  for (const [termine, volte] of voci) {
    const contenuto = scelti.find((s) => s.termine.includes(termine) && s.volte >= volte * SOGLIA);
    if (contenuto) continue;
    const contiene = scelti.find((s) => termine.includes(s.termine) && volte >= s.volte * SOGLIA);
    if (contiene) {
      contiene.termine = termine;
      continue;
    }
    // Due frasi che condividono due parole piene sono la stessa cosa detta a pezzi: resta la prima (più frequente o più lunga).
    const mie = pieni(termine);
    if (scelti.some((s) => pieni(s.termine).filter((x) => mie.includes(x)).length >= 2)) continue;
    scelti.push({ termine, volte });
  }
  return scelti.slice(0, massimo);
}
