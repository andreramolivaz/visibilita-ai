import { GIORNO, conCache, scarica } from "./rete";
import { tokenizza } from "./termini";

/**
 * Suggerimenti di ricerca Google per «categoria città»: le formulazioni che
 * le persone usano davvero in quella città. Da ogni suggerimento togliamo
 * categoria e città e teniamo il resto («senza glutine», «aperta ora»,
 * «economica»): sono i vincoli da mettere nelle domande.
 * Endpoint pubblico, senza chiave; se non risponde, niente suggerimenti.
 */

export async function suggerimentiGoogle(testo: string): Promise<string[]> {
  const q = testo.trim();
  if (!q) return [];
  return conCache(`suggest:${q.toLowerCase()}`, 7 * GIORNO, async () => {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=it&gl=it&q=${encodeURIComponent(q)}`;
    const res = await scarica(url, { headers: { "User-Agent": "Mozilla/5.0" } }, 4000);
    if (!res || !res.ok) return [];
    try {
      const dati = (await res.json()) as unknown;
      const lista = Array.isArray(dati) && Array.isArray(dati[1]) ? (dati[1] as unknown[]) : [];
      return lista.filter((x): x is string => typeof x === "string");
    } catch {
      return [];
    }
  });
}

/** Parole di luogo o di navigazione: non sono vincoli di una domanda. */
const NON_VINCOLI = new Set(["centro", "alta", "bassa", "nord", "sud", "est", "ovest", "periferia", "provincia", "migliore", "migliori", "recensioni", "prezzi", "orari", "telefono", "indirizzo", "foto", "sito", "menu", "numero", "vicino", "vicina", "vicine", "vicini", "zona", "me", "nuova", "nuovo", "aperte", "aperti"]);

/** I modificatori: quello che resta del suggerimento tolti categoria, città e parole di luogo o navigazione. */
export function modificatori(suggerimenti: string[], categoria: string, citta: string): string[] {
  const vietate = new Set([...tokenizza(categoria), ...tokenizza(citta), "a", "di", "in", "la", "il", "le", "i", "da", "del", "della", "con", "per"]);
  const out: string[] = [];
  for (const s of suggerimenti) {
    const resto = tokenizza(s).filter((t) => !vietate.has(t));
    if (resto.length === 0 || resto.length > 4) continue;
    if (resto.every((t) => NON_VINCOLI.has(t))) continue;
    const m = resto.join(" ");
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

/** Tre varianti di ricerca per una categoria in una città, in italiano. */
export async function modificatoriPer(categoria: string, citta: string): Promise<string[]> {
  const cat = categoria.toLowerCase();
  const query = [`${cat} ${citta}`, `${cat} a ${citta}`, `migliore ${cat} ${citta}`];
  const liste = await Promise.all(query.map(suggerimentiGoogle));
  return modificatori(liste.flat(), categoria, citta).slice(0, 10);
}
