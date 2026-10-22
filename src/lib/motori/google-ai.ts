import type { Interrogazione, Motore, RispostaGrezza } from "./tipi";
import { chiama, fallita, urlDentro } from "./tipi";

/**
 * Google AI (AI Mode e AI Overviews) non ha un'API ufficiale: si legge la pagina
 * dei risultati con località italiana tramite DataForSEO. Prima AI Mode (una
 * risposta conversazionale), in mancanza l'AI Overview della ricerca classica.
 * Il canale è dichiarato nel report.
 */
const ENDPOINT_AI_MODE = "https://api.dataforseo.com/v3/serp/google/ai_mode/live/advanced";
const ENDPOINT_ORGANICO = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced";

function autorizzazione() {
  const login = process.env.DATAFORSEO_LOGIN ?? "";
  const password = process.env.DATAFORSEO_PASSWORD ?? "";
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

/** Testi e riferimenti degli elementi AI (ai_mode, ai_overview e i loro figli), ovunque siano nel risultato. */
function estraiAI(x: unknown, testi: string[], fonti: Set<string>, profondita = 0) {
  if (profondita > 10 || !x || typeof x !== "object") return;
  if (Array.isArray(x)) {
    for (const v of x) estraiAI(v, testi, fonti, profondita + 1);
    return;
  }
  const o = x as Record<string, unknown>;
  const tipo = typeof o.type === "string" ? o.type : "";
  if (/^ai_(mode|overview)/.test(tipo)) {
    if (typeof o.text === "string" && o.text.trim()) testi.push(o.text.trim());
    if (typeof o.markdown === "string" && o.markdown.trim()) testi.push(o.markdown.trim());
    for (const u of urlDentro(o.references)) fonti.add(u);
    for (const u of urlDentro(o.links)) fonti.add(u);
  }
  for (const v of Object.values(o)) estraiAI(v, testi, fonti, profondita + 1);
}

async function leggi(endpoint: string, q: Interrogazione): Promise<{ testo: string; fonti: string[] }> {
  const res = await chiama(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: autorizzazione() },
    body: JSON.stringify([
      {
        keyword: q.domanda,
        // Con le coordinate la posizione è il punto esatto (zoom 14 ≈ quartiere); altrimenti la città.
        ...(q.coordinate ? { location_coordinate: `${q.coordinate.lat},${q.coordinate.lng},14` } : { location_name: `${q.citta},${q.regione ? `${q.regione},` : ""}Italy` }),
        language_code: "it",
        device: "desktop",
        os: "windows",
        load_async_ai_overview: true,
      },
    ]),
  });
  if (!res.ok) throw new Error(`DataForSEO ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const dati = (await res.json()) as { tasks?: { status_code?: number; status_message?: string; result?: unknown }[] };
  const task = dati.tasks?.[0];
  if (!task || (task.status_code && task.status_code >= 40000)) throw new Error(`DataForSEO: ${task?.status_message ?? "nessun risultato"}`);
  const testi: string[] = [];
  const fonti = new Set<string>();
  estraiAI(task.result, testi, fonti);
  return { testo: [...new Set(testi)].join("\n\n").trim(), fonti: [...fonti] };
}

export const googleAi: Motore = {
  id: "google-ai",
  attivo: () => Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD),
  async interroga(q: Interrogazione): Promise<RispostaGrezza> {
    const inizio = new Date().toISOString();
    try {
      let r = await leggi(ENDPOINT_AI_MODE, q).catch(() => ({ testo: "", fonti: [] as string[] }));
      let modello = "google-ai-mode";
      if (!r.testo) {
        r = await leggi(ENDPOINT_ORGANICO, q);
        modello = "google-ai-overview";
      }
      return { motore: "google-ai", modello, canale: "api", inizio, fine: new Date().toISOString(), testo: r.testo, fonti: r.fonti, errore: r.testo ? undefined : "Nessuna risposta AI nella pagina dei risultati." };
    } catch (e) {
      return fallita("google-ai", "google-ai-mode", inizio, e);
    }
  },
};
