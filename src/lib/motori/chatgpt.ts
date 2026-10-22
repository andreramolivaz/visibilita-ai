import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { chiama, fallita, istruzione, stringhe, urlDentro } from "./tipi";

/**
 * ChatGPT via OpenAI Responses API con lo strumento web_search e la località
 * impostata (user_location approssimativa: città, regione, Italia). Oltre alle
 * citazioni nel testo chiediamo le fonti consultate (web_search_call.action.sources)
 * e registriamo le query di ricerca fatte dal modello (il fan-out).
 */
const modello = () => process.env.OPENAI_MODEL ?? "gpt-5";

export const chatgpt: Motore = {
  id: "chatgpt",
  attivo: () => Boolean(process.env.OPENAI_API_KEY),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      const res = await chiama("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: modello(),
          instructions: istruzione(q.lingua),
          input: q.domanda,
          tools: [
            {
              type: "web_search",
              user_location: { type: "approximate", country: "IT", city: q.citta, region: q.regione, timezone: "Europe/Rome" },
              search_context_size: "medium",
            },
          ],
          include: ["web_search_call.action.sources"],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const dati = (await res.json()) as { output?: unknown[]; model?: string };
      const testi: string[] = [];
      const citate = new Set<string>();
      const ricerche: string[] = [];
      let cercato = false;
      for (const item of (dati.output ?? []) as { type?: string; content?: { type?: string; text?: string; annotations?: unknown }[]; action?: { query?: unknown; queries?: unknown } }[]) {
        if (item.type === "message") {
          for (const c of item.content ?? []) {
            if (c.type === "output_text" && c.text) testi.push(c.text);
            for (const u of urlDentro(c.annotations)) citate.add(u);
          }
        } else if (item.type === "web_search_call") {
          cercato = true;
          ricerche.push(...stringhe(item.action?.query), ...stringhe(item.action?.queries));
          for (const u of urlDentro(item.action)) citate.add(u);
        }
      }
      return { motore: "chatgpt", modello: dati.model ?? modello(), canale: "api", inizio, fine: new Date().toISOString(), testo: testi.join("\n\n").trim(), fonti: [...citate], ricerche: [...new Set(ricerche)], cercato };
    } catch (e) {
      return fallita("chatgpt", modello(), inizio, e);
    }
  },
};
