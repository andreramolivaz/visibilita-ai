import type { Engine, EngineId, Phase } from "./types";

/**
 * Motori AI, in ordine di quota d'uso in Italia (Osservatorio Cosenza su
 * dati Audicom, luglio 2026). In produzione questa tabella vive nel
 * database e si aggiorna ogni trimestre senza rilascio.
 *
 * Fase "mvp" = attivo adesso: tutti i motori con un'API ufficiale di ricerca.
 * Copilot e Meta AI non ce l'hanno: si leggono con uno scraper, dopo.
 */
export const ENGINES: Engine[] = [
  {
    id: "chatgpt",
    nome: "ChatGPT",
    utentiMln: 9.6,
    peso: 0.3,
    fase: "mvp",
    come: "OpenAI Responses API, tool web_search con user_location",
  },
  {
    id: "gemini",
    nome: "Gemini",
    utentiMln: 9.4,
    peso: 0.25,
    fase: "mvp",
    come: "Gemini API, grounding Google Search e Google Maps",
  },
  {
    id: "google-ai",
    nome: "Google AI",
    utentiMln: 20,
    peso: 0.2,
    fase: "mvp",
    come: "DataForSEO SERP API, AI Overviews e AI Mode, località italiana",
  },
  {
    id: "copilot",
    nome: "Copilot",
    utentiMln: 2.4,
    peso: 0.08,
    fase: "v2",
    come: "Scraper di terzi (nessuna API con ricerca)",
  },
  {
    id: "claude",
    nome: "Claude",
    utentiMln: 1.8,
    peso: 0.07,
    fase: "mvp",
    come: "API Anthropic, ricerca web con posizione",
  },
  {
    id: "meta-ai",
    nome: "Meta AI",
    utentiMln: 1.6,
    peso: 0.05,
    fase: "v3",
    come: "Solo scraper, instabile",
  },
  {
    id: "perplexity",
    nome: "Perplexity",
    utentiMln: 1.0,
    peso: 0.04,
    fase: "mvp",
    come: "Agent API, tool web_search",
  },
  {
    id: "grok",
    nome: "Grok",
    utentiMln: 0.5,
    peso: 0.01,
    fase: "mvp",
    come: "xAI API, tool web_search",
  },
];

const ORDINE: Phase[] = ["mvp", "v2", "v3"];

export function engine(id: EngineId): Engine {
  const e = ENGINES.find((x) => x.id === id);
  if (!e) throw new Error(`Motore sconosciuto: ${id}`);
  return e;
}

/** Motori attivi fino alla fase indicata, in ordine di quota d'uso. */
export function motoriAttivi(fase: Phase = "mvp"): Engine[] {
  const max = ORDINE.indexOf(fase);
  return ENGINES.filter((e) => ORDINE.indexOf(e.fase) <= max);
}

/** Motori non ancora interrogabili (senza API ufficiale). */
export function motoriInArrivo(fase: Phase = "mvp"): Engine[] {
  const max = ORDINE.indexOf(fase);
  return ENGINES.filter((e) => ORDINE.indexOf(e.fase) > max);
}

/** "ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok" */
export function elencoMotori(motori: Engine[] = motoriAttivi()): string {
  const nomi = motori.map((m) => m.nome);
  if (nomi.length <= 1) return nomi.join("");
  return `${nomi.slice(0, -1).join(", ")} e ${nomi[nomi.length - 1]}`;
}
