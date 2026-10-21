import type { Domanda, OrigineDomanda, ProfiloAttivita, SegnaliProfilo } from "../types";
import { generaDomande, profilo } from "../profiles";
import { ATTIVITA_ESEMPIO } from "../mock-report";
import { TIPI_SPONTANEI } from "../stats";
import { cercaScheda, concorrentiVicini, placesAttivo, profiloDaScheda, testiRecensioni } from "./places";
import { leggiSito, terminiDaSito } from "./sito";
import { estraiTermini } from "./termini";
import { modificatoriPer } from "./suggerimenti";
import { variantiClaude } from "./varianti";

/**
 * Il profilo dell'attività e le sue domande, da dati veri:
 *   scheda Google → recensioni, attributi, concorrenti vicini
 *   sito → pagine chiave, menu in PDF
 *   ricerche Google → i vincoli che la gente usa in quella città
 * I segnali riempiono i segnaposto dei modelli di categoria; un modello
 * linguistico riscrive le domande spontanee come prompt veri. Ogni domanda
 * porta la sua origine, così il titolare vede da dove viene.
 * Senza chiave Places si usa il profilo di esempio con il nome digitato.
 */

export interface ProfiloCostruito {
  attivita: ProfiloAttivita;
  domande: Domanda[];
  segnali: SegnaliProfilo;
  /** I testi delle recensioni, per contare i termini «nelle tue recensioni» nel report. */
  recensioni: string[];
}

const SEGNALI_ESEMPIO: SegnaliProfilo = {
  recensioni: [
    { termine: "forno a legna", volte: 12 },
    { termine: "impasto", volte: 8 },
    { termine: "pizza napoletana", volte: 6 },
    { termine: "dehors", volte: 4 },
  ],
  sito: [
    { termine: "forno a legna", volte: 3 },
    { termine: "senza glutine", volte: 2 },
  ],
  ricerche: ["senza glutine", "aperta ora", "centro", "economica", "asporto"],
  concorrenti: [
    { nome: "Pizzeria Fratelli Rossi", rating: 4.6, recensioni: 1240, distanzaM: 650 },
    { nome: "Al Forno Antico", rating: 4.5, recensioni: 860, distanzaM: 900 },
    { nome: "La Margherita", rating: 4.4, recensioni: 530, distanzaM: 1200 },
  ],
  note: ["Profilo di esempio: con la chiave Google Places la scheda, le recensioni e i concorrenti sono quelli veri."],
  fonte: "esempio",
};

/** Le domande senza un segnale dietro vengono dal modello della categoria. */
function conOrigine(domande: Domanda[]): Domanda[] {
  return domande.map((d) => (d.origine ? d : { ...d, origine: "modello" as const }));
}

/** Specialità (dalle recensioni e dal sito) e requisiti (dalla scheda e dalle ricerche), con la loro origine. */
function segnaposto(s: SegnaliProfilo, servizi: string[]) {
  const origini: Record<string, OrigineDomanda> = {};
  const aggiungi = (lista: string[], origine: OrigineDomanda, limite: number, esclusi: string[] = []) => {
    const out: string[] = [];
    for (const t of lista) {
      const k = t.trim().toLowerCase();
      if (!k || origini[k] || esclusi.some((e) => e.toLowerCase() === k)) continue;
      origini[k] = origine;
      out.push(t.trim());
      if (out.length >= limite) break;
    }
    return out;
  };
  const requisiti = [...aggiungi(servizi, "scheda", 4), ...aggiungi(s.ricerche, "ricerche", 3)];
  // Un termine delle recensioni che il sito scrive per esteso prende la forma del sito («impasto» → «impasto a lunga lievitazione»).
  const estesi = s.recensioni.map((x) => s.sito.find((y) => y.termine.includes(x.termine) && y.termine !== x.termine)?.termine ?? x.termine);
  const contieneGia = (lista: string[], t: string) => lista.some((x) => x.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(x.toLowerCase()));
  const specialita = aggiungi(estesi, "recensioni", 3, requisiti);
  for (const t of aggiungi(s.sito.map((x) => x.termine), "sito", 6, requisiti)) {
    if (specialita.length >= 4) break;
    if (!contieneGia(specialita, t) && !contieneGia(requisiti, t)) specialita.push(t);
  }
  return { specialita, requisiti, origini };
}

/** Nei set grandi le ultime tre domande spontanee possono ruotare; le altre restano fisse per il confronto nel tempo. */
function conEsplora(domande: Domanda[]): Domanda[] {
  if (domande.length < 20) return domande;
  const spontanee = domande.filter((d) => TIPI_SPONTANEI.includes(d.tipo) && d.origine !== "titolare");
  const ultime = new Set(spontanee.slice(-3).map((d) => d.id));
  return domande.map((d) => (ultime.has(d.id) ? { ...d, esplora: true } : d));
}

function esempio(query: string, n: number): ProfiloCostruito {
  const [nome, citta] = query.split(",").map((s) => s.trim());
  const attivita: ProfiloAttivita = { ...ATTIVITA_ESEMPIO, nome: nome || ATTIVITA_ESEMPIO.nome, citta: citta || ATTIVITA_ESEMPIO.citta };
  const s = SEGNALI_ESEMPIO;
  const { specialita, requisiti, origini } = segnaposto(s, attivita.servizi);
  const domande = generaDomande(
    profilo(attivita.categoria),
    { nome: attivita.nome, categoria: attivita.categoriaGoogle, citta: attivita.citta, zona: attivita.zona, provincia: attivita.provincia, regione: attivita.regione, specialita, requisiti, origini, concorrente: s.concorrenti[0]?.nome },
    n,
  );
  return { attivita: { ...attivita, specialita }, domande: conEsplora(conOrigine(domande)), segnali: s, recensioni: [] };
}

export async function costruisciProfilo(query: string, n: number): Promise<ProfiloCostruito> {
  if (!placesAttivo()) return esempio(query, n);
  const posto = await cercaScheda(query);
  if (!posto) {
    const e = esempio(query, n);
    return { ...e, segnali: { ...e.segnali, note: ["Non ho trovato una scheda Google per questo nome: controlla nome e città, o incolla il link di Google Maps.", ...e.segnali.note] } };
  }

  const base = profiloDaScheda(posto);
  const cat = profilo(base.categoria);
  const [sito, concorrenti, ricerche] = await Promise.all([leggiSito(base.sito), concorrentiVicini(posto), modificatoriPer(base.categoriaGoogle, base.citta)]);

  const escludi = [base.nome, base.categoriaGoogle, base.citta];
  const recensioni = estraiTermini(testiRecensioni(posto), escludi, { minimo: 2, massimo: 10 });
  const terminiSito = terminiDaSito(sito.pagine, escludi, 10);

  const segnali: SegnaliProfilo = { recensioni, sito: terminiSito, ricerche, concorrenti, note: sito.note, fonte: "google" };
  const { specialita, requisiti, origini } = segnaposto(segnali, base.servizi);
  const attivita: ProfiloAttivita = { ...base, specialita };

  let domande = generaDomande(
    cat,
    { nome: attivita.nome, categoria: attivita.categoriaGoogle, citta: attivita.citta, zona: attivita.zona, provincia: attivita.provincia, regione: attivita.regione, specialita, requisiti, origini, concorrente: concorrenti[0]?.nome, inglese: cat.inglese },
    n,
  );
  domande = conOrigine(domande);
  domande = await variantiClaude(domande, { nome: attivita.nome, categoria: attivita.categoriaGoogle, citta: attivita.citta, provincia: attivita.provincia, b2b: cat.b2b });
  return { attivita, domande: conEsplora(domande), segnali, recensioni: testiRecensioni(posto) };
}
