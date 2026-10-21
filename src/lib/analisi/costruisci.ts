import type { CitaChi, Concorrente, DescrizioneMotore, ErroreScheda, Fonte, Posizione, Report, RigaDomanda, Risposta, RisultatoMotore, RisultatoTipo, Termine, TestaATesta, Tono } from "../types";
import { TIPI_DOMANDA } from "../types";
import { punteggio as calcolaPunteggio, verdetto as calcolaVerdetto } from "../score";
import { TIPI_SPONTANEI } from "../stats";
import { estraiTermini } from "../profilo/termini";
import { ePortale } from "./fonti";
import { azioniDaRegole } from "./azioni";
import { stessoNome } from "./riconoscimento";
import type { Cella, Scansione } from "../scansione/tipi";

/**
 * Dalle celle analizzate al Report: stesse formule del report di esempio,
 * applicate ai dati veri. Tutto si ricava dalla mappa domanda × assistente.
 */

const CRITICO = /\b(non (lo |la |te lo )?consigl|pessim|scadent|delud|da evitare|sconsigl|negativ|mediocr|peggior)/i;
const POSITIVO = /\b(ottim|eccellent|apprezzat|consigliat|rinomat|famos|molto buon|di qualit|tra (i|le) miglior|punto di riferimento|storic)/i;
const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

function tonoDi(testo: string): Tono {
  if (CRITICO.test(testo)) return "critico";
  if (POSITIVO.test(testo)) return "positivo";
  return "neutro";
}

/** Dati sbagliati in una descrizione: telefono diverso, giorno di chiusura che da te è aperto. */
function erroriIn(testo: string, s: Scansione, motore: Cella["motore"]): ErroreScheda[] {
  const out: ErroreScheda[] = [];
  const a = s.attivita;
  if (a.telefono) {
    const mio = a.telefono.replace(/\D/g, "");
    const trovati = [...testo.matchAll(/(?:\+39\s?)?(?:\d[\s.\-]?){8,11}\d/g)].map((m) => m[0].replace(/\D/g, ""));
    if (trovati.length > 0 && !trovati.some((t) => t.endsWith(mio.slice(-6)))) out.push({ tipo: "telefono", testo: `${nomeMotore(motore)} riporta un numero di telefono diverso dal tuo`, motore });
  }
  const chiuso = testo.match(/chius[oa]\s+(?:il\s+|la\s+|di\s+)?(luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato|domenica)/i);
  if (chiuso && a.orari) {
    const giorno = chiuso[1].toLowerCase().replace(/i$/, "ì");
    const riga = a.orari.split(";").find((r) => r.toLowerCase().startsWith(giorno));
    if (riga && !/chius/i.test(riga)) out.push({ tipo: "orari", testo: `${nomeMotore(motore)} dice che sei chiuso ${GIORNI.includes(giorno) ? "il " + giorno : giorno}, la tua scheda dice aperto`, motore });
  }
  return out;
}

function nomeMotore(id: string) {
  return ({ chatgpt: "ChatGPT", gemini: "Gemini", "google-ai": "Google AI", claude: "Claude", perplexity: "Perplexity", grok: "Grok", copilot: "Copilot", "meta-ai": "Meta AI" } as Record<string, string>)[id] ?? id;
}

/** Posizione media arrotondata, 1–5. */
function posizioneMediaCella(valori: number[]): Posizione {
  if (valori.length === 0) return null;
  const m = Math.round(valori.reduce((a, b) => a + b, 0) / valori.length);
  return Math.max(1, Math.min(5, m)) as Posizione;
}

export function costruisciReport(s: Scansione, id = s.id): Report {
  const a = s.attivita;
  const celleFatte = s.celle.filter((c) => c.analisi);
  const domandaDi = (idDomanda: string) => s.domande.find((d) => d.id === idDomanda)!;
  const spontanea = (idDomanda: string) => TIPI_SPONTANEI.includes(domandaDi(idDomanda).tipo);

  // Risposte (una per cella) per il punteggio; righe (celle aggregate) per la mappa.
  const risposte: Risposta[] = celleFatte.map((c) => ({
    domandaId: c.domandaId,
    motore: c.motore,
    ripetizione: c.ripetizione,
    posizione: c.analisi!.posizione,
    citati: c.analisi!.citati.filter((x) => !x.seiTu).map((x) => x.nome),
    fonti: c.analisi!.fonti,
  }));
  const risposteSpontanee = risposte.filter((r) => spontanea(r.domandaId));

  const righe: RigaDomanda[] = s.domande.map((d) => {
    const mie = celleFatte.filter((c) => c.domandaId === d.id);
    const celle = s.motori.map((m) => {
      const perMotore = mie.filter((c) => c.motore === m);
      const presenti = perMotore.map((c) => c.analisi!.posizione).filter((p): p is 1 | 2 | 3 | 4 | 5 => p !== null);
      return { motore: m, posizione: posizioneMediaCella(presenti), frequenza: `${presenti.length} su ${s.ripetizioni}`, volte: presenti.length };
    });
    const nomi = new Set<string>();
    for (const c of mie) for (const x of c.analisi!.citati) if (!x.seiTu) nomi.add(x.nome);
    return { domanda: d, celle, concorrentiCitati: nomi.size };
  });

  const nSpont = s.domande.filter((d) => TIPI_SPONTANEI.includes(d.tipo)).length;
  const perMotore: RisultatoMotore[] = s.motori.map((m) => ({
    motore: m,
    comparse: righe.filter((r) => TIPI_SPONTANEI.includes(r.domanda.tipo) && (r.celle.find((c) => c.motore === m)?.volte ?? 0) > 0).length,
    totale: nSpont,
  }));
  const perTipo: RisultatoTipo[] = TIPI_DOMANDA.map((tipo) => {
    const ids = s.domande.filter((d) => d.tipo === tipo).map((d) => d.id);
    const mie = risposte.filter((r) => ids.includes(r.domandaId));
    return { tipo, comparse: mie.filter((r) => r.posizione !== null).length, totale: mie.length, domande: ids.length };
  }).filter((t) => t.domande > 0);

  // Concorrenti: citazioni nelle risposte spontanee, aggregate per nome (con i nomi noti come canonici).
  const conteggio = new Map<string, { nome: string; citazioni: number; primiTre: number }>();
  const canonico = (nome: string) => {
    for (const k of conteggio.keys()) if (stessoNome(k, nome)) return k;
    return nome;
  };
  const totaleSpontanee = risposteSpontanee.length;
  let tueCitazioni = 0;
  let tuePrimiTre = 0;
  for (const c of celleFatte.filter((x) => spontanea(x.domandaId))) {
    for (const x of c.analisi!.citati) {
      if (x.seiTu) {
        tueCitazioni++;
        if (x.posizione <= 3) tuePrimiTre++;
        continue;
      }
      const k = canonico(x.nome);
      const v = conteggio.get(k) ?? { nome: k, citazioni: 0, primiTre: 0 };
      v.citazioni++;
      if (x.posizione <= 3) v.primiTre++;
      conteggio.set(k, v);
    }
  }
  const altri = [...conteggio.values()].sort((x, y) => y.citazioni - x.citazioni);
  const citazioniTotali = altri.reduce((acc, c) => acc + c.citazioni, 0) + tueCitazioni;
  const concorrenti: Concorrente[] = [
    ...altri.slice(0, 4).map((c) => ({ nome: c.nome, citazioni: c.citazioni, totale: totaleSpontanee, primiTre: c.primiTre })),
    { nome: a.nome, citazioni: tueCitazioni, totale: totaleSpontanee, primiTre: tuePrimiTre, seiTu: true },
  ].sort((x, y) => y.citazioni - x.citazioni);

  // Testa a testa e chi cita chi, sulle domande spontanee.
  const domandeSpontanee = s.domande.filter((d) => TIPI_SPONTANEI.includes(d.tipo));
  const citatoIn = (nome: string, idDomanda: string, motore?: string) =>
    celleFatte.some((c) => c.domandaId === idDomanda && (!motore || c.motore === motore) && c.analisi!.citati.some((x) => !x.seiTu && stessoNome(x.nome, nome)));
  const tuIn = (idDomanda: string, motore?: string) => celleFatte.some((c) => c.domandaId === idDomanda && (!motore || c.motore === motore) && c.analisi!.posizione !== null);
  const testaATesta: TestaATesta[] = altri.slice(0, 3).map((c) => {
    let loroSenzaTe = 0;
    let entrambi = 0;
    let tuSenzaLoro = 0;
    for (const d of domandeSpontanee) {
      const lui = citatoIn(c.nome, d.id);
      const tu = tuIn(d.id);
      if (lui && tu) entrambi++;
      else if (lui) loroSenzaTe++;
      else if (tu) tuSenzaLoro++;
    }
    return { nome: c.nome, loroSenzaTe, entrambi, tuSenzaLoro };
  });
  const citaChi: CitaChi[] = [
    ...altri.slice(0, 4).map((c) => ({ nome: c.nome, perMotore: Object.fromEntries(s.motori.map((m) => [m, domandeSpontanee.filter((d) => citatoIn(c.nome, d.id, m)).length])) })),
    { nome: a.nome, seiTu: true, perMotore: Object.fromEntries(s.motori.map((m) => [m, domandeSpontanee.filter((d) => tuIn(d.id, m)).length])) },
  ];

  // Fonti: risposte (tutte) che citano ciascuna; «ci sei» dalla scheda, per quello che sappiamo.
  const perFonte = new Map<string, number>();
  for (const c of celleFatte) for (const f of c.analisi!.fonti) perFonte.set(f, (perFonte.get(f) ?? 0) + 1);
  const fonti: Fonte[] = [...perFonte.entries()]
    .sort((x, y) => y[1] - x[1] || Number(ePortale(y[0])) - Number(ePortale(x[0])))
    .slice(0, 8)
    .map(([nome, citazioni]) => ({
      nome,
      citazioni,
      ciSei: nome === "Sito ufficiale" ? true : nome === "Google Maps" ? true : (a.portaliPresenti as string[]).includes(nome),
    }));

  // Le parole che usano, nelle risposte spontanee; quante nelle tue recensioni.
  const nomiDaEscludere = [a.nome, a.categoriaGoogle, a.citta, ...altri.slice(0, 6).map((c) => c.nome)];
  const testiSpontanei = celleFatte.filter((c) => spontanea(c.domandaId) && c.risposta?.testo).map((c) => c.risposta!.testo);
  const terminiSito = new Set((s.segnali?.sito ?? []).map((t) => t.termine.toLowerCase()));
  const termini: Termine[] = estraiTermini(testiSpontanei, nomiDaEscludere, { minimo: 3, massimo: 8, nGrammi: 4 }).map((t) => {
    const volteTue = s.recensioni.filter((r) => r.toLowerCase().includes(t.termine)).length;
    return { termine: t.termine, volte: t.volte, volteTue, ceLHai: volteTue > 0 || terminiSito.has(t.termine) || [...terminiSito].some((x) => x.includes(t.termine)) };
  });

  // Cosa dicono di te: la domanda sul nome, prima ripetizione con testo, per assistente.
  const nomeId = s.domande.find((d) => d.tipo === "nome")?.id;
  const errori: ErroreScheda[] = [];
  const descrizioniPerMotore: DescrizioneMotore[] = s.motori.flatMap((m) => {
    const c = nomeId ? celleFatte.find((x) => x.domandaId === nomeId && x.motore === m && x.risposta?.testo) : undefined;
    if (!c) return [];
    const testo = c.risposta!.testo.replace(/\s+/g, " ").trim();
    const breve = testo.length > 320 ? `${testo.slice(0, 317).replace(/\s\S*$/, "")}…` : testo;
    const miei = erroriIn(testo, s, m);
    errori.push(...miei);
    return [{ motore: m, testo: breve, tono: tonoDi(testo), datiCorretti: miei.length === 0 }];
  });

  const punteggio = calcolaPunteggio(risposteSpontanee, s.motori);
  const inizio = celleFatte.map((c) => c.risposta?.inizio).filter(Boolean).sort()[0] ?? s.creataIl;
  const fine = celleFatte.map((c) => c.risposta?.fine).filter(Boolean).sort().at(-1) ?? s.aggiornataIl;
  const azioni = azioniDaRegole({
    attivita: a,
    totaleRisposte: celleFatte.length,
    fonti,
    errori,
    termini,
    perTipo,
    noteSito: s.segnali?.note ?? [],
    ingleseVuoto: s.domande.some((d) => /^[A-Za-z ,'.-]+$/.test(d.testo) && /\b(best|near|supplier|manufacturer|hotel|in)\b/i.test(d.testo) && !risposte.some((r) => r.domandaId === d.id && r.posizione !== null)) && s.domande.some((d) => /\b(best|supplier|manufacturer)\b/i.test(d.testo)),
  });
  const guadagno = azioni.reduce((acc, x) => acc + (x.impattoStimato ?? 0), 0);
  const fallite = s.celle.filter((c) => c.stato === "errore").length;
  const primo = concorrenti.find((c) => !c.seiTu);
  const pct = totaleSpontanee ? Math.round((tueCitazioni / totaleSpontanee) * 100) : 0;
  const qv = citazioniTotali ? Math.round((tueCitazioni / citazioniTotali) * 100) : 0;

  return {
    id,
    piano: s.piano,
    attivita: a,
    data: fine.slice(0, 10),
    motori: s.motori,
    domande: s.domande.length,
    domandeSpontanee: nSpont,
    ripetizioni: s.ripetizioni,
    punteggio,
    verdetto: calcolaVerdetto(punteggio),
    sintesi: `Compari in ${tueCitazioni} risposte su ${totaleSpontanee} alle ${nSpont} domande in cui il cliente non fa il tuo nome (${pct}%). Quota di voce ${qv}%${primo ? `, contro il ${citazioniTotali ? Math.round((primo.citazioni / citazioniTotali) * 100) : 0}% di ${primo.nome}` : ""}.${guadagno ? ` Con le tre azioni, stima da ${punteggio} a ${Math.min(100, punteggio + guadagno)}.` : ""}`,
    perMotore,
    perTipo,
    concorrenti,
    citazioniTotali,
    testaATesta,
    citaChi,
    righe,
    termini,
    fonti,
    descrizioneAI: descrizioniPerMotore[0]?.testo ?? "",
    descrizioniPerMotore,
    errori,
    azioni,
    metodo: {
      inizio,
      fine,
      posizione: [a.citta, a.regione, "Italia"].filter(Boolean).join(", "),
      lingua: "italiano",
      canale: "interfacce ufficiali (API), località impostata, senza memoria",
      note: [
        `Ogni domanda è stata posta ${s.ripetizioni} ${s.ripetizioni === 1 ? "volta" : "volte"} a ogni assistente${s.ripetizioni > 1 && inizio.slice(0, 10) !== fine.slice(0, 10) ? ", in giorni diversi" : ""}.`,
        "Compari quando il nome, l'indirizzo o il telefono coincidono con la tua scheda Google; i concorrenti sono le attività vicine della tua categoria e i nomi che le risposte mettono in elenco.",
        "La presenza sui portali è quella dichiarata dalla scheda: la verifica portale per portale arriva con la scansione successiva.",
        ...(fallite ? [`${fallite} ${fallite === 1 ? "risposta non è arrivata" : "risposte non sono arrivate"} (errore dell'interfaccia): non ${fallite === 1 ? "entra" : "entrano"} nei conteggi.`] : []),
        "Le risposte degli assistenti cambiano nel tempo: i numeri sono quelli dei giorni della scansione.",
      ],
    },
  };
}
