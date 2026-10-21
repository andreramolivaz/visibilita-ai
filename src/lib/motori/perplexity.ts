import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { ISTRUZIONE, chiama, fallita, urlDentro } from "./tipi";

/**
 * Perplexity via Sonar API (chat completions) con la località impostata in
 * web_search_options.user_location. Le fonti sono citations e search_results.
 */
const modello = () => process.env.PERPLEXITY_MODEL ?? "sonar";

export const perplexity: Motore = {
  id: "perplexity",
  attivo: () => Boolean(process.env.PERPLEXITY_API_KEY),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      const res = await chiama("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
        body: JSON.stringify({
          model: modello(),
          messages: [
            { role: "system", content: ISTRUZIONE },
            { role: "user", content: q.domanda },
          ],
          web_search_options: { user_location: { country: "IT", region: q.regione, city: q.citta } },
        }),
      });
      if (!res.ok) throw new Error(`Perplexity ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const dati = (await res.json()) as { model?: string; choices?: { message?: { content?: string } }[]; citations?: unknown; search_results?: unknown };
      const testo = dati.choices?.[0]?.message?.content?.trim() ?? "";
      const fonti = new Set<string>([...urlDentro(dati.citations), ...urlDentro(dati.search_results)]);
      return { motore: "perplexity", modello: dati.model ?? modello(), canale: "api", inizio, fine: new Date().toISOString(), testo, fonti: [...fonti] };
    } catch (e) {
      return fallita("perplexity", modello(), inizio, e);
    }
  },
};
