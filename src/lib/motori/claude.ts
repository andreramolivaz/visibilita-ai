import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { chiama, fallita, istruzione, urlDentro } from "./tipi";

/**
 * Claude via Messages API con lo strumento di ricerca web e la località
 * approssimativa (città, regione, Italia, fuso orario). Le fonti sono le
 * citazioni dei blocchi di testo e i risultati di ricerca restituiti.
 */
const modello = () => process.env.ANTHROPIC_SCAN_MODEL ?? "claude-sonnet-5-5";

export const claude: Motore = {
  id: "claude",
  attivo: () => Boolean(process.env.ANTHROPIC_API_KEY),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      const res = await chiama("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY ?? "", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: modello(),
          max_tokens: 1500,
          system: istruzione(q.lingua),
          messages: [{ role: "user", content: q.domanda }],
          tools: [
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: 5,
              user_location: { type: "approximate", city: q.citta, region: q.regione, country: "IT", timezone: "Europe/Rome" },
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const dati = (await res.json()) as { model?: string; content?: { type?: string; text?: string; citations?: unknown; content?: unknown }[] };
      const testi: string[] = [];
      const fonti = new Set<string>();
      for (const b of dati.content ?? []) {
        if (b.type === "text" && b.text) {
          testi.push(b.text);
          for (const u of urlDentro(b.citations)) fonti.add(u);
        } else if (b.type === "web_search_tool_result") {
          for (const u of urlDentro(b.content)) fonti.add(u);
        }
      }
      return { motore: "claude", modello: dati.model ?? modello(), canale: "api", inizio, fine: new Date().toISOString(), testo: testi.join("").trim(), fonti: [...fonti] };
    } catch (e) {
      return fallita("claude", modello(), inizio, e);
    }
  },
};
