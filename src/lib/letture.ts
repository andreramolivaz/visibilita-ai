import { engine } from "./engines";
import type { Report, TipoDomanda } from "./types";
import { datiCorretti, punteggioPerMotore, quotaVoce, percentuale, territorio } from "./stats";

/**
 * La riga di lettura di ogni sezione: un fatto con i suoi numeri, niente
 * aggettivi. Va sotto il titolo, come nei rapporti di consulenza, così chi
 * legge solo i titoli ha già il risultato.
 */

const NOME_TIPO: Record<TipoDomanda, string> = {
  generica: "generiche",
  bisogno: "per bisogno",
  specialita: "per specialità",
  requisito: "per requisito",
  confronto: "di confronto",
  nome: "sul nome",
};

const mln = (x: number) => x.toLocaleString("it-IT", { maximumFractionDigits: 1 });

export function letturaConcorrenti(r: Report): string {
  const tu = r.concorrenti.find((c) => c.seiTu);
  const primo = r.concorrenti.filter((c) => !c.seiTu)[0];
  if (!primo || !tu) return "";
  const qv = quotaVoce(r.concorrenti, r.citazioniTotali);
  const testa = r.testaATesta.find((t) => t.nome === primo.nome);
  const senza = testa ? ` In ${testa.loroSenzaTe} domande su ${r.domandeSpontanee} c'è lui e non tu.` : "";
  return `${primo.nome}: ${primo.citazioni} citazioni contro le tue ${tu.citazioni}; quota di voce ${percentuale(qv[primo.nome])} contro ${percentuale(qv[tu.nome])}.${senza}`;
}

export function letturaTerritorio(r: Report): string {
  const t = territorio(r.righe);
  const parti = [`Ci sei in ${t.tue.length} domande su ${t.n}`];
  if (t.contese.length) parti.push(`in ${t.contese.length} c'è un concorrente e tu no`);
  if (t.libere.length) parti.push(`in ${t.libere.length} non c'è nessuno`);
  return `${parti.join("; ")}.`;
}

export function letturaAssistenti(r: Report): string {
  const parziali = punteggioPerMotore(r.righe, r.ripetizioni);
  const ordinati = [...r.motori].sort((a, b) => (parziali[b] ?? 0) - (parziali[a] ?? 0));
  const meglio = ordinati[0];
  const grande = [...r.motori].sort((a, b) => engine(b).utentiMln - engine(a).utentiMln)[0];
  if (!meglio) return "";
  if (grande === meglio) return `Punteggio parziale più alto su ${engine(meglio).nome} (${parziali[meglio]}), che è anche il più usato.`;
  return `Punteggio parziale più alto su ${engine(meglio).nome} (${parziali[meglio]}); su ${engine(grande).nome}, ${mln(engine(grande).utentiMln)} milioni di utenti, ${parziali[grande]}.`;
}

export function letturaTipi(r: Report): string {
  const conQuota = r.perTipo.filter((t) => t.tipo !== "nome" && t.tipo !== "confronto").map((t) => ({ ...t, quota: t.totale ? t.comparse / t.totale : 0 }));
  if (conQuota.length === 0) return "";
  const max = conQuota.reduce((a, b) => (b.quota > a.quota ? b : a));
  const min = conQuota.reduce((a, b) => (b.quota < a.quota ? b : a));
  if (max === min) return `Domande ${NOME_TIPO[max.tipo]}: compari nel ${percentuale(max.quota)} delle risposte.`;
  return `Domande ${NOME_TIPO[max.tipo]}: ${percentuale(max.quota)} delle risposte. Domande ${NOME_TIPO[min.tipo]}: ${percentuale(min.quota)}.`;
}

export function letturaFonti(r: Report): string {
  const f = r.fonti[0];
  if (!f) return "";
  const conc = f.concorrentiPresenti !== undefined ? `; concorrenti presenti: ${f.concorrentiPresenti} su 5` : "";
  return `${f.nome} è la fonte più citata (${f.citazioni} risposte): ${f.ciSei ? "hai una scheda" : "non hai una scheda"}${conc}.`;
}

export function letturaParole(r: Report): string {
  const manca = r.termini.find((t) => !t.ceLHai);
  const top = r.termini[0];
  if (!top) return "";
  if (!manca) return `«${top.termine}» è il termine più usato (${top.volte} volte) ed è già nelle tue recensioni.`;
  return `«${manca.termine}»: ${manca.volte} volte nelle risposte, ${manca.volteTue ?? 0} nelle tue recensioni.`;
}

export function letturaDicono(r: Report): string {
  const dc = datiCorretti(r.descrizioniPerMotore);
  const critici = r.descrizioniPerMotore.filter((d) => d.tono === "critico");
  const parti: string[] = [];
  if (dc.n) parti.push(`Dati corretti in ${dc.k} assistenti su ${dc.n}`);
  parti.push(`${r.errori.length} ${r.errori.length === 1 ? "errore" : "errori"}`);
  parti.push(critici.length ? `tono critico su ${critici.map((d) => engine(d.motore).nome).join(", ")}` : "nessuna descrizione critica");
  return `${parti.join("; ")}.`;
}

export function letturaAzioni(r: Report): string {
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  if (!guadagno) return "";
  return `Stima: da ${r.punteggio} a ${Math.min(100, r.punteggio + guadagno)} con tutte e tre; la verifica è la scansione successiva.`;
}
