import { engine } from "./engines";
import type { Report, TipoDomanda } from "./types";
import { copertura, punteggioPerMotore, percentuale } from "./stats";

/**
 * Le frasi "cosa vuol dire" di ogni sezione, ricavate dai dati.
 * Una frase sola, in italiano del tu, con i numeri che la giustificano.
 */

const NOME_TIPO: Record<TipoDomanda, string> = {
  generica: "generiche",
  bisogno: "per bisogno",
  specialita: "per specialità",
  nome: "sul nome",
};

export function takeawayAssistenti(r: Report): string {
  const parziali = punteggioPerMotore(r.righe, r.ripetizioni);
  const ordinati = [...r.motori].sort((a, b) => (parziali[b] ?? 0) - (parziali[a] ?? 0));
  const meglio = ordinati[0];
  const peggio = [...r.motori].sort((a, b) => engine(b).utentiMln - engine(a).utentiMln).find((m) => (parziali[m] ?? 0) < 20);
  if (!meglio) return "";
  const base = `Vai meglio su ${engine(meglio).nome} (punteggio ${parziali[meglio]})`;
  if (!peggio || peggio === meglio) return `${base}.`;
  return `${base}; su ${engine(peggio).nome}, che usano ${engine(peggio).utentiMln.toLocaleString("it-IT")} milioni di italiani, sei a ${parziali[peggio]}.`;
}

export function takeawayTipi(r: Report): string {
  const conQuota = r.perTipo.filter((t) => t.tipo !== "nome").map((t) => ({ ...t, quota: t.totale ? t.comparse / t.totale : 0 }));
  if (conQuota.length === 0) return "";
  const max = conQuota.reduce((a, b) => (b.quota > a.quota ? b : a));
  const min = conQuota.reduce((a, b) => (b.quota < a.quota ? b : a));
  if (max === min) return `Compari nel ${percentuale(max.quota)} delle risposte alle domande ${NOME_TIPO[max.tipo]}.`;
  return `Ti trovano sulle domande ${NOME_TIPO[max.tipo]} (${percentuale(max.quota)} delle risposte), quasi mai su quelle ${NOME_TIPO[min.tipo]} (${percentuale(min.quota)}).`;
}

export function takeawayConcorrenti(r: Report): string {
  const tu = r.concorrenti.find((c) => c.seiTu);
  const primo = r.concorrenti.filter((c) => !c.seiTu)[0];
  if (!primo || !tu) return "";
  const rapporto = tu.citazioni > 0 ? Math.round((primo.citazioni / tu.citazioni) * 10) / 10 : null;
  const testa = r.testaATesta.find((t) => t.nome === primo.nome);
  const soloLui = testa ? ` In ${testa.loroSenzaTe} domande su ${r.domande} c'è lui e non tu: è lì che si gioca.` : "";
  return `${primo.nome} è citato ${rapporto ? `${rapporto.toLocaleString("it-IT")} volte più di te` : `${primo.citazioni} volte, tu mai`}.${soloLui}`;
}

export function takeawayMappa(r: Report): string {
  const cop = copertura(r.righe);
  const vuote = cop.n - cop.k;
  const sempre = r.righe.filter((x) => x.celle.every((c) => c.posizione !== null)).length;
  const parti = [`${vuote} domande su ${cop.n} sono vuote per tutti gli assistenti`];
  if (sempre > 0) parti.push(`${sempre} ${sempre === 1 ? "è piena" : "sono piene"} su tutti`);
  return `${parti.join("; ")}. Le righe vuote sono la lista delle cose da sistemare.`;
}

export function takeawayFonti(r: Report): string {
  const f = r.fonti[0];
  if (!f) return "";
  if (f.ciSei) return `La fonte più citata è ${f.nome} (${f.citazioni} risposte) e ci sei: bene, ora conta cosa c'è scritto.`;
  const conc = f.concorrentiPresenti !== undefined ? `, e ci sono ${f.concorrentiPresenti} concorrenti su 5` : "";
  return `La fonte più citata è ${f.nome} (${f.citazioni} risposte): non ci sei${conc}.`;
}

export function takeawayParole(r: Report): string {
  const manca = r.termini.find((t) => !t.ceLHai);
  const top = r.termini[0];
  if (!top) return "";
  if (!manca) return `«${top.termine}» è la parola più usata dagli assistenti (${top.volte} volte) e ce l'hai già.`;
  return `«${manca.termine}» è usata ${manca.volte} volte dagli assistenti e ${manca.volteTue ?? 0} nelle tue recensioni: una parola da far entrare.`;
}

export function takeawayDicono(r: Report): string {
  if (r.errori.length === 0) return "Nessun errore nei dati che gli assistenti riportano su di te.";
  return `${r.errori.length} ${r.errori.length === 1 ? "errore" : "errori"} nei dati: ${r.errori[0].testo.toLowerCase()}. Si corregge alla fonte.`;
}

export function takeawayAzioni(r: Report): string {
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  if (!guadagno) return "Tre cose da fare, in ordine di impatto.";
  return `Fatte tutte e tre, il punteggio stimato passa da ${r.punteggio} a ${Math.min(100, r.punteggio + guadagno)}. La prima da sola vale +${r.azioni[0]?.impattoStimato ?? 0}.`;
}
