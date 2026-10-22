import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { chiama, fallita, istruzione, stringhe, urlDentro } from "./tipi";

/**
 * Perplexity via Agent API: le Chat Completions di Sonar sono state chiuse a
 * settembre 2026. La posizione sta sullo strumento web_search (paese, regione,
 * città e, dove la domanda ha un punto, latitudine e longitudine, che vanno
 * insieme al paese). La traccia della risposta (output) porta i risultati di
 * ricerca con le loro URL e le query fatte per rispondere.
 */
const PRESET_LEGACY: Record<string, string> = { sonar: "fast", "sonar-pro": "fast", "sonar-reasoning-pro": "low", "sonar-deep-research": "high" };

/** Un preset dell'Agent API (fast, low, medium, high) o un modello esplicito; i vecchi nomi Sonar diventano preset. */
function selettore(): { preset: string } | { model: string } {
  const m = process.env.PERPLEXITY_MODEL;
  if (m && !PRESET_LEGACY[m]) return { model: m };
  return { preset: process.env.PERPLEXITY_PRESET ?? (m ? PRESET_LEGACY[m] : "fast") };
}

const etichetta = () => {
  const s = selettore();
  return "model" in s ? s.model : `perplexity-${s.preset}`;
};

interface UscitaAgent {
  type?: string;
  role?: string;
  queries?: unknown;
  results?: unknown;
  content?: { type?: string; text?: string }[];
}

export const perplexity: Motore = {
  id: "perplexity",
  attivo: () => Boolean(process.env.PERPLEXITY_API_KEY),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      const res = await chiama("https://api.perplexity.ai/v1/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
        body: JSON.stringify({
          ...selettore(),
          input: q.domanda,
          instructions: istruzione(q.lingua),
          tools: [
            {
              type: "web_search",
              max_results: 10,
              user_location: {
                country: "IT",
                ...(q.regione ? { region: q.regione } : {}),
                city: q.citta,
                ...(q.coordinate ? { latitude: q.coordinate.lat, longitude: q.coordinate.lng } : {}),
              },
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Perplexity ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const dati = (await res.json()) as { model?: string; output_text?: string; output?: UscitaAgent[] };
      const testi: string[] = [];
      const fonti = new Set<string>();
      const ricerche: string[] = [];
      let cercato = false;
      for (const item of dati.output ?? []) {
        if (item.type === "search_results") {
          cercato = true;
          ricerche.push(...stringhe(item.queries));
          for (const u of urlDentro(item.results)) fonti.add(u);
        } else if (item.type === "message" && item.role !== "user") {
          for (const c of item.content ?? []) if (c.type === "output_text" && c.text) testi.push(c.text);
        }
      }
      const testo = (dati.output_text?.trim() || testi.join("\n\n")).trim();
      return { motore: "perplexity", modello: dati.model ?? etichetta(), canale: "api", inizio, fine: new Date().toISOString(), testo, fonti: [...fonti], ricerche, cercato };
    } catch (e) {
      return fallita("perplexity", etichetta(), inizio, e);
    }
  },
};
