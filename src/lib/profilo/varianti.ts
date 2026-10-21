import type { Domanda } from "../types";
import { TIPI_SPONTANEI } from "../stats";
import { scarica } from "./rete";

/**
 * Varianti delle domande con un modello linguistico: la stessa intenzione,
 * lo stesso luogo e gli stessi vincoli, scritti come li scriverebbe un
 * cliente in chat. Contano intento e vincoli, non la frase (SparkToro 2026):
 * variare la frase evita di misurare una formulazione sola.
 * Solo le domande spontanee; nome e confronto restano com'erano.
 * Senza ANTHROPIC_API_KEY ritorna le domande invariate.
 */

export const variantiAttive = () => Boolean(process.env.ANTHROPIC_API_KEY);

interface Contesto {
  nome: string;
  categoria: string;
  citta: string;
  provincia?: string;
  b2b: boolean;
}

function conta(parole: string) {
  return parole.trim().split(/\s+/).filter(Boolean).length;
}

/** Una variante è accettabile se tiene il luogo e ha una lunghezza da prompt vero. */
function accettabile(variante: string, originale: Domanda, c: Contesto): boolean {
  const n = conta(variante);
  if (n < 6 || n > 30) return false;
  const v = variante.toLowerCase();
  const luoghi = [c.citta, c.provincia ?? ""].filter(Boolean).map((x) => x.toLowerCase());
  const originaleHaLuogo = luoghi.some((l) => originale.testo.toLowerCase().includes(l));
  if (originaleHaLuogo && !luoghi.some((l) => v.includes(l))) return false;
  if (/[«»"“”]/.test(variante)) return false;
  return true;
}

export async function variantiClaude(domande: Domanda[], c: Contesto): Promise<Domanda[]> {
  const chiave = process.env.ANTHROPIC_API_KEY;
  if (!chiave) return domande;
  const daVariare = domande.filter((d) => TIPI_SPONTANEI.includes(d.tipo) && d.origine !== "titolare");
  if (daVariare.length === 0) return domande;

  const istruzioni = `Riscrivi ogni domanda come la scriverebbe davvero un cliente a un assistente AI (ChatGPT, Gemini) in italiano colloquiale: una frase di 8-25 parole, con lo stesso luogo, lo stesso bisogno o vincolo e lo stesso significato. Non aggiungere vincoli nuovi, non togliere quelli presenti, non inventare nomi. ${c.b2b ? "È un acquisto tra aziende: tono da ufficio acquisti, provincia o regione come luogo." : "È una persona che cerca un'attività vicino a sé."} Niente virgolette. Rispondi solo con JSON: {"domande":[{"id":"...","testo":"..."}]}.`;
  const corpo = {
    model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5",
    max_tokens: 1500,
    temperature: 0.8,
    system: istruzioni,
    messages: [
      {
        role: "user",
        content: JSON.stringify({ attivita: { nome: c.nome, categoria: c.categoria, citta: c.citta, provincia: c.provincia }, domande: daVariare.map((d) => ({ id: d.id, tipo: d.tipo, testo: d.testo })) }),
      },
    ],
  };
  const res = await scarica(
    "https://api.anthropic.com/v1/messages",
    { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": chiave, "anthropic-version": "2023-06-01" }, body: JSON.stringify(corpo) },
    12000,
  );
  if (!res || !res.ok) return domande;
  try {
    const dati = (await res.json()) as { content?: { type: string; text?: string }[] };
    const testo = dati.content?.find((x) => x.type === "text")?.text ?? "";
    const json = testo.slice(testo.indexOf("{"), testo.lastIndexOf("}") + 1);
    const out = JSON.parse(json) as { domande?: { id: string; testo: string }[] };
    const mappa = new Map((out.domande ?? []).map((d) => [d.id, d.testo?.trim() ?? ""]));
    return domande.map((d) => {
      const v = mappa.get(d.id);
      return v && daVariare.includes(d) && accettabile(v, d, c) ? { ...d, testo: v } : d;
    });
  } catch {
    return domande;
  }
}
