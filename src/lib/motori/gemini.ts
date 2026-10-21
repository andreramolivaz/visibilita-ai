import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { ISTRUZIONE, chiama, fallita, urlDentro } from "./tipi";

/**
 * Gemini via Gemini API con grounding su Google Search e Google Maps, e la
 * posizione impostata con latitudine e longitudine (retrievalConfig.latLng):
 * è il canale più vicino a quello che vede un utente di Gemini per il locale.
 * Se la combinazione dei due strumenti non è accettata, si riprova con la sola ricerca.
 */
const modello = () => process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

interface RispostaGemini {
  candidates?: { content?: { parts?: { text?: string }[] }; groundingMetadata?: unknown }[];
  modelVersion?: string;
}

async function richiesta(q: Interrogazione, strumenti: unknown[]): Promise<Response> {
  const corpo: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: ISTRUZIONE }] },
    contents: [{ role: "user", parts: [{ text: q.domanda }] }],
    tools: strumenti,
  };
  if (q.coordinate) corpo.toolConfig = { retrievalConfig: { latLng: { latitude: q.coordinate.lat, longitude: q.coordinate.lng } } };
  return chiama(`https://generativelanguage.googleapis.com/v1beta/models/${modello()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
    body: JSON.stringify(corpo),
  });
}

export const gemini: Motore = {
  id: "gemini",
  attivo: () => Boolean(process.env.GEMINI_API_KEY),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      let res = await richiesta(q, q.coordinate ? [{ googleSearch: {} }, { googleMaps: {} }] : [{ googleSearch: {} }]);
      if (!res.ok && q.coordinate) res = await richiesta(q, [{ googleSearch: {} }]);
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const dati = (await res.json()) as RispostaGemini;
      const cand = dati.candidates?.[0];
      const testo = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
      return { motore: "gemini", modello: dati.modelVersion ?? modello(), canale: "api", inizio, fine: new Date().toISOString(), testo, fonti: urlDentro(cand?.groundingMetadata) };
    } catch (e) {
      return fallita("gemini", modello(), inizio, e);
    }
  },
};
