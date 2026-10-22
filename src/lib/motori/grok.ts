import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { chiama, fallita, istruzione, urlDentro } from "./tipi";

/**
 * Grok via xAI API (Responses, compatibile con OpenAI) con lo strumento web_search.
 * La località non è un parametro dell'API: la città resta nella domanda,
 * come la scriverebbe l'utente. Le fonti sono le annotazioni e le citazioni.
 */
const modello = () => process.env.XAI_MODEL ?? "grok-4";

export const grok: Motore = {
  id: "grok",
  attivo: () => Boolean(process.env.XAI_API_KEY),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      const res = await chiama("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: JSON.stringify({
          model: modello(),
          instructions: istruzione(q.lingua),
          input: [{ role: "user", content: q.domanda }],
          tools: [{ type: "web_search" }],
        }),
      });
      if (!res.ok) throw new Error(`xAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const dati = (await res.json()) as { model?: string; output?: unknown[]; output_text?: string; citations?: unknown };
      const testi: string[] = [];
      const fonti = new Set<string>(urlDentro(dati.citations));
      for (const item of (dati.output ?? []) as { type?: string; content?: { type?: string; text?: string; annotations?: unknown }[] }[]) {
        if (item.type !== "message") continue;
        for (const c of item.content ?? []) {
          if (c.type === "output_text" && c.text) testi.push(c.text);
          for (const u of urlDentro(c.annotations)) fonti.add(u);
        }
      }
      const testo = (testi.length ? testi.join("\n\n") : (dati.output_text ?? "")).trim();
      return { motore: "grok", modello: dati.model ?? modello(), canale: "api", inizio, fine: new Date().toISOString(), testo, fonti: [...fonti] };
    } catch (e) {
      return fallita("grok", modello(), inizio, e);
    }
  },
};
