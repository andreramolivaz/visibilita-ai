import type { EngineId } from "../types";
import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { chatgpt } from "./chatgpt";
import { gemini } from "./gemini";
import { googleAi } from "./google-ai";
import { claude } from "./claude";
import { perplexity } from "./perplexity";
import { grok } from "./grok";

export type { Interrogazione, Motore, RispostaGrezza } from "./tipi";

/** Gli adattatori, in ordine di quota d'uso in Italia. */
export const MOTORI: Record<Exclude<EngineId, "copilot" | "meta-ai">, Motore> = {
  chatgpt,
  gemini,
  "google-ai": googleAi,
  claude,
  perplexity,
  grok,
};

/** I motori che hanno una chiave configurata. */
export function motoriConfigurati(): EngineId[] {
  return (Object.values(MOTORI) as Motore[]).filter((m) => m.attivo()).map((m) => m.id);
}

export function interroga(motore: EngineId, q: Interrogazione): Promise<RispostaGrezza> {
  const m = (MOTORI as Partial<Record<EngineId, Motore>>)[motore];
  if (!m) return Promise.resolve({ motore, modello: "-", canale: "api", inizio: new Date().toISOString(), fine: new Date().toISOString(), testo: "", fonti: [], errore: "Motore non interrogabile." });
  return m.interroga(q);
}
