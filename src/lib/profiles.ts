import type { Domanda, OrigineDomanda, TipoDomanda } from "./types";
import { PROFILI_JSON } from "@/data/profiles";

export interface AzioneProfilo {
  codice: string;
  titolo: string;
  quando: string;
}

export type FamigliaProfilo = "locale" | "b2b" | "professionista" | "sanita" | "ricettivo" | "cultura";

export interface ProfiloCategoria {
  id: string;
  nome: string;
  /** Imprese attive in Italia (ISTAT-ASIA 2023): ordina la copertura. 0 = non applicabile. */
  imprese: number;
  fonteImprese?: string;
  categorieGoogle: string[];
  famiglia: FamigliaProfilo;
  /** Le domande si fanno per provincia e regione, con requisiti e certificazioni. */
  b2b: boolean;
  /** Ha senso porre anche domande in inglese (export, turismo). */
  inglese: boolean;
  generatoDaAI?: boolean;
  domande: {
    generica: string[];
    bisogno: string[];
    specialita: string[];
    requisito?: string[];
    confronto?: string[];
    nome: string[];
    inglese?: string[];
  };
  fonti: string[];
  metriche: string[];
  azioni: AzioneProfilo[];
  nota?: string;
}

export const PROFILI: ProfiloCategoria[] = PROFILI_JSON as ProfiloCategoria[];

const ALTRO = PROFILI.find((p) => p.id === "altro")!;

export function profilo(id: string): ProfiloCategoria {
  return PROFILI.find((p) => p.id === id) ?? ALTRO;
}

/** Trova il profilo dalla categoria Google, altrimenti "altro". */
export function profiloDaCategoriaGoogle(categoriaGoogle: string): ProfiloCategoria {
  const c = categoriaGoogle.toLowerCase();
  return PROFILI.find((p) => p.categorieGoogle.some((g) => c.includes(g.toLowerCase()))) ?? ALTRO;
}

/** I profili con un settore reale, dal più numeroso, per la landing. */
export function profiliPerNumerosita(): ProfiloCategoria[] {
  return PROFILI.filter((p) => p.imprese > 0).sort((a, b) => b.imprese - a.imprese);
}

interface Variabili {
  nome: string;
  categoria: string;
  citta: string;
  zona?: string;
  provincia?: string;
  regione?: string;
  specialita?: string[];
  requisito?: string;
  requisiti?: string[];
  /** Il concorrente più citato o più vicino: serve alle domande di confronto. */
  concorrente?: string;
  /** Aggiunge le domande in inglese se il profilo le prevede. */
  inglese?: boolean;
  /** Da dove viene ogni specialità o requisito (chiave: il termine in minuscolo). */
  origini?: Record<string, OrigineDomanda>;
}

function riempi(template: string, v: Variabili, specialita?: string, requisito?: string): string {
  const testo = template
    .replaceAll("{nome}", v.nome)
    .replaceAll("{categoria}", v.categoria.toLowerCase())
    .replaceAll("{citta}", v.citta)
    .replaceAll("{zona}", v.zona ?? "centro")
    .replaceAll("{provincia}", v.provincia ?? v.citta)
    .replaceAll("{regione}", v.regione ?? v.provincia ?? v.citta)
    .replaceAll("{specialita}", specialita ?? v.specialita?.[0] ?? "")
    .replaceAll("{requisito}", requisito ?? v.requisito ?? v.requisiti?.[0] ?? "")
    .replaceAll("{concorrente}", v.concorrente ?? "");
  return (testo.charAt(0).toUpperCase() + testo.slice(1)).replace(/\s{2,}/g, " ").trim();
}

/** Un template con un segnaposto vuoto non va usato. */
function valido(testo: string, template: string, v: Variabili): boolean {
  if (template.includes("{specialita}") && !v.specialita?.length) return false;
  if (template.includes("{requisito}") && !v.requisito && !v.requisiti?.length) return false;
  if (template.includes("{concorrente}") && !v.concorrente) return false;
  return testo.length > 0;
}

/** Ordine con cui i tipi si alternano: così 8, 15 e 30 domande hanno sempre un mix sensato. */
const GIRO: TipoDomanda[] = ["generica", "specialita", "bisogno", "requisito", "confronto", "generica", "bisogno", "specialita"];

/**
 * Genera le domande per un'attività: n domande (8 gratis, 15 Base, 30 Pro),
 * alternando i tipi, più una sul nome in chiusura. La prima "specialità" è modificabile.
 * Il testo esatto conta poco (SparkToro 2026: frasi diverse con lo stesso intento
 * restituiscono gli stessi nomi); contano intento, luogo e vincoli.
 */
export function generaDomande(p: ProfiloCategoria, v: Variabili, n: number): Domanda[] {
  const out: Domanda[] = [];
  const origineDi = (termine?: string): OrigineDomanda | undefined => (termine ? v.origini?.[termine.toLowerCase()] : undefined);
  const push = (c: Candidata, tipo: TipoDomanda, modificabile = false) => {
    if (out.length >= n - 1 || out.some((d) => d.testo === c.testo)) return false;
    out.push({ id: `d${out.length + 1}`, testo: c.testo, tipo, modificabile, origine: c.origine, concorrente: c.concorrente });
    return true;
  };

  type Candidata = { testo: string; origine?: OrigineDomanda; concorrente?: string };
  const espandi = (templates: string[] | undefined, tipo: TipoDomanda): Candidata[] => {
    if (!templates) return [];
    if (tipo === "specialita") {
      const spec = v.specialita?.length ? v.specialita : [];
      return spec.flatMap((s) => templates.map((t) => ({ testo: riempi(t, v, s), origine: origineDi(s) }))).filter((x, i) => valido(x.testo, templates[i % templates.length], v));
    }
    if (tipo === "requisito") {
      const req = v.requisiti?.length ? v.requisiti : v.requisito ? [v.requisito] : [];
      return templates
        .flatMap((t) => (t.includes("{requisito}") ? req.map((r) => ({ testo: riempi(t, v, undefined, r), origine: origineDi(r) })) : [{ testo: riempi(t, v) }]))
        .filter((x) => x.testo.length > 0);
    }
    if (tipo === "confronto") {
      return templates.map((t) => ({ testo: riempi(t, v), origine: "scheda" as const, concorrente: v.concorrente })).filter((x, i) => valido(x.testo, templates[i], v));
    }
    return templates.map((t) => ({ testo: riempi(t, v) })).filter((x, i) => valido(x.testo, templates[i], v));
  };

  const pool: Record<TipoDomanda, Candidata[]> = {
    generica: espandi(p.domande.generica, "generica"),
    bisogno: espandi(p.domande.bisogno, "bisogno"),
    specialita: espandi(p.domande.specialita, "specialita"),
    requisito: espandi(p.domande.requisito, "requisito"),
    confronto: espandi(p.domande.confronto, "confronto"),
    nome: [],
  };
  if (v.inglese && p.inglese && p.domande.inglese) pool.generica.push(...espandi(p.domande.inglese, "generica"));

  let primaSpecialita = true;
  let giri = 0;
  while (out.length < n - 1 && giri < 20) {
    let aggiunta = false;
    for (const tipo of GIRO) {
      if (out.length >= n - 1) break;
      const c = pool[tipo].shift();
      if (!c) continue;
      const ok = push(c, tipo, tipo === "specialita" && primaSpecialita);
      if (ok && tipo === "specialita") primaSpecialita = false;
      aggiunta = aggiunta || ok;
    }
    if (!aggiunta) break;
    giri++;
  }
  const nome = p.domande.nome[0] ?? "Com'è {nome} a {citta}?";
  out.push({ id: `d${out.length + 1}`, testo: riempi(nome, v), tipo: "nome" });
  return out;
}
