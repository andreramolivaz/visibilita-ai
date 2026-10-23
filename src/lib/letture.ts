import { engine } from "./engines";
import type { Report, TipoDomanda } from "./types";
import { TIPI_SPONTANEI, datiCorretti, punteggioPerMotore, percentuale, quotaPunti, territorio } from "./stats";

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
  prezzo: "per prezzo",
  occasione: "per occasione",
  recensioni: "per recensioni",
  vicino: "vicino a te",
  informativa: "informative",
  confronto: "di confronto",
  nome: "sul nome",
  inglese: "in inglese",
};

const NOME_ZOOM: Record<string, string> = { citta: "in città", zona: "in zona", vicino: "vicino a te", provincia: "in provincia", regione: "in regione", nazionale: "in Italia" };

const mln = (x: number) => x.toLocaleString("it-IT", { maximumFractionDigits: 1 });

export function letturaConcorrenti(r: Report): string {
  const tu = r.concorrenti.find((c) => c.seiTu);
  const primo = r.concorrenti.filter((c) => !c.seiTu)[0];
  if (!primo || !tu) return "";
  const testa = r.testaATesta.find((t) => t.nome === primo.nome);
  const senza = testa ? ` In ${testa.loroSenzaTe} domande su ${r.domandeSpontanee} c'è lui e non tu.` : "";
  return `${primo.nome} compare in ${primo.citazioni} risposte, tu in ${tu.citazioni}.${senza}`;
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
  if (grande === meglio) return `Vai meglio su ${engine(meglio).nome}, che è anche il più usato: punteggio ${parziali[meglio]}.`;
  return `Vai meglio su ${engine(meglio).nome} (punteggio ${parziali[meglio]}). Su ${engine(grande).nome}, il più usato con ${mln(engine(grande).utentiMln)} milioni di utenti, ${parziali[grande]}.`;
}

export function letturaTipi(r: Report): string {
  const conQuota = r.perTipo.filter((t) => TIPI_SPONTANEI.includes(t.tipo)).map((t) => ({ ...t, quota: t.totale ? t.comparse / t.totale : 0 }));
  if (conQuota.length === 0) return "";
  const max = conQuota.reduce((a, b) => (b.quota > a.quota ? b : a));
  const min = conQuota.reduce((a, b) => (b.quota < a.quota ? b : a));
  if (max === min) return `Domande ${NOME_TIPO[max.tipo]}: compari nel ${percentuale(max.quota)} delle risposte.`;
  return `Domande ${NOME_TIPO[max.tipo]}: ${percentuale(max.quota)} delle risposte. Domande ${NOME_TIPO[min.tipo]}: ${percentuale(min.quota)}.`;
}

export function letturaTelescopio(r: Report): string {
  const zoom = (r.perZoom ?? []).map((z) => ({ ...z, quota: z.totale ? z.comparse / z.totale : 0 }));
  if (zoom.length === 0) return "";
  const max = zoom.reduce((a, b) => (b.quota > a.quota ? b : a));
  const min = zoom.reduce((a, b) => (b.quota < a.quota ? b : a));
  const parti = [max === min ? `Compari nel ${percentuale(max.quota)} delle risposte ${NOME_ZOOM[max.zoom]}` : `Compari nel ${percentuale(max.quota)} delle risposte ${NOME_ZOOM[max.zoom]}, nel ${percentuale(min.quota)} ${NOME_ZOOM[min.zoom]}`];
  const punti = r.intorno?.punti ?? [];
  if (punti.length > 1) {
    const qp = quotaPunti(punti);
    parti.push(`intorno a te compari in ${qp.k} ${qp.k === 1 ? "punto" : "punti"} su ${qp.n}`);
  }
  return `${parti.join("; ")}.`;
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
