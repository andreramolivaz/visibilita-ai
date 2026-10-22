import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { chiama, fallita, istruzione, stringhe, urlDentro } from "./tipi";

/**
 * Gemini via Gemini API con grounding su Google Search. Il grounding su Google
 * Maps, l'unico che accetta la posizione (retrievalConfig.latLng), è documentato
 * solo per prompt e risposte in inglese: lo usiamo per le domande in inglese con
 * un punto, mentre le domande italiane vanno sulla sola ricerca, con la città nel
 * testo. Se la combinazione dei due strumenti non è accettata, si riprova con la ricerca.
 */
const modello = () => process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

interface RispostaGemini {
  candidates?: { content?: { parts?: { text?: string }[] }; groundingMetadata?: { webSearchQueries?: unknown } & Record<string, unknown> }[];
  modelVersion?: string;
}

async function richiesta(q: Interrogazione, strumenti: unknown[], conPosizione: boolean): Promise<Response> {
  const corpo: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: istruzione(q.lingua) }] },
    contents: [{ role: "user", parts: [{ text: q.domanda }] }],
    tools: strumenti,
  };
  if (conPosizione && q.coordinate) corpo.toolConfig = { retrievalConfig: { latLng: { latitude: q.coordinate.lat, longitude: q.coordinate.lng } } };
  return chiama(`https://generativelanguage.googleapis.com/v1beta/models/${modello()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
    body: JSON.stringify(corpo),
  });
}

/** Maps solo in inglese e con un punto: è il solo caso documentato. */
export function usaMaps(q: Interrogazione): boolean {
  return q.lingua === "en" && Boolean(q.coordinate);
}

export const gemini: Motore = {
  id: "gemini",
  attivo: () => Boolean(process.env.GEMINI_API_KEY),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      const maps = usaMaps(q);
      let res = await richiesta(q, maps ? [{ googleSearch: {} }, { googleMaps: {} }] : [{ googleSearch: {} }], maps);
      if (!res.ok && maps) res = await richiesta(q, [{ googleSearch: {} }], false);
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const dati = (await res.json()) as RispostaGemini;
      const cand = dati.candidates?.[0];
      const testo = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
      const ricerche = stringhe(cand?.groundingMetadata?.webSearchQueries);
      return {
        motore: "gemini",
        modello: dati.modelVersion ?? modello(),
        canale: "api",
        inizio,
        fine: new Date().toISOString(),
        testo,
        fonti: urlDentro(cand?.groundingMetadata),
        ricerche,
        cercato: Boolean(cand?.groundingMetadata && (ricerche.length > 0 || urlDentro(cand.groundingMetadata).length > 0)),
      };
    } catch (e) {
      return fallita("gemini", modello(), inizio, e);
    }
  },
};
