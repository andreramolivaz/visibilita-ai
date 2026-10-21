import type { Domanda, TipoDomanda } from "./types";
import ristorante from "@/data/profiles/ristorante.json";
import hotel from "@/data/profiles/hotel.json";
import dentista from "@/data/profiles/dentista.json";
import parrucchiere from "@/data/profiles/parrucchiere.json";
import idraulico from "@/data/profiles/idraulico.json";
import palestra from "@/data/profiles/palestra.json";
import immobiliare from "@/data/profiles/immobiliare.json";
import professionista from "@/data/profiles/professionista.json";
import museo from "@/data/profiles/museo.json";
import altro from "@/data/profiles/altro.json";

export interface AzioneProfilo {
  codice: string;
  titolo: string;
  quando: string;
}

export interface ProfiloCategoria {
  id: string;
  nome: string;
  categorieGoogle: string[];
  generatoDaAI?: boolean;
  domande: {
    generica: string[];
    bisogno: string[];
    specialita: string[];
    nome: string;
  };
  fonti: string[];
  metriche: string[];
  azioni: AzioneProfilo[];
  nota?: string;
}

export const PROFILI: ProfiloCategoria[] = [
  ristorante,
  hotel,
  dentista,
  parrucchiere,
  idraulico,
  palestra,
  immobiliare,
  professionista,
  museo,
  altro,
];

export function profilo(id: string): ProfiloCategoria {
  return PROFILI.find((p) => p.id === id) ?? altro;
}

/** Trova il profilo dalla categoria Google, altrimenti "altro". */
export function profiloDaCategoriaGoogle(categoriaGoogle: string): ProfiloCategoria {
  const c = categoriaGoogle.toLowerCase();
  return (
    PROFILI.find((p) => p.categorieGoogle.some((g) => c.includes(g.toLowerCase()))) ?? altro
  );
}

interface Variabili {
  nome: string;
  categoria: string;
  citta: string;
  zona?: string;
  specialita?: string[];
  requisito?: string;
  regione?: string;
}

function riempi(template: string, v: Variabili, specialita?: string): string {
  const testo = template
    .replaceAll("{nome}", v.nome)
    .replaceAll("{categoria}", v.categoria.toLowerCase())
    .replaceAll("{citta}", v.citta)
    .replaceAll("{zona}", v.zona ?? "centro")
    .replaceAll("{specialita}", specialita ?? v.specialita?.[0] ?? "")
    .replaceAll("{requisito}", v.requisito ?? "")
    .replaceAll("{regione}", v.regione ?? "");
  return testo.charAt(0).toUpperCase() + testo.slice(1);
}

/**
 * Genera le domande per un'attività: n domande (5 gratis, 10 Base, 20 Pro),
 * mescolando i tre tipi, più una sul nome. La prima "specialità" è modificabile.
 */
export function generaDomande(p: ProfiloCategoria, v: Variabili, n: number): Domanda[] {
  const out: Domanda[] = [];
  const push = (testo: string, tipo: TipoDomanda, modificabile = false) => {
    if (out.length >= n - 1 || out.some((d) => d.testo === testo)) return;
    out.push({ id: `d${out.length + 1}`, testo, tipo, modificabile });
  };

  // Alterna generica → bisogno → specialità finché c'è posto.
  const generiche = p.domande.generica.map((t) => riempi(t, v));
  const bisogni = p.domande.bisogno.map((t) => riempi(t, v));
  const spec = (v.specialita?.length ? v.specialita : [""]).flatMap((s) =>
    p.domande.specialita.map((t) => riempi(t, v, s)),
  );

  let i = 0;
  while (out.length < n - 1 && i < Math.max(generiche.length, bisogni.length, spec.length)) {
    if (generiche[i]) push(generiche[i], "generica");
    if (spec[i]) push(spec[i], "specialita", i === 0);
    if (bisogni[i]) push(bisogni[i], "bisogno");
    i++;
  }
  out.push({ id: `d${out.length + 1}`, testo: riempi(p.domande.nome, v), tipo: "nome" });
  return out;
}
