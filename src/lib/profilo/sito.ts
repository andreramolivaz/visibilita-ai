import type { TermineRicorrente } from "../types";
import { GIORNO, conCache, scarica, testoLimitato } from "./rete";
import { estraiTermini, tokenizza } from "./termini";

/**
 * Il sito dell'attività: la pagina iniziale e fino a quattro pagine chiave
 * (menu, servizi, lavorazioni, prodotti, trattamenti, prestazioni, chi siamo).
 * Ne teniamo titoli, intestazioni, voci di elenco e testo in chiaro, più una
 * nota se il menu o il listino è solo in PDF o immagine: gli assistenti non lo leggono.
 */

export interface PaginaSito {
  url: string;
  titolo: string;
  /** Intestazioni e voci di elenco: dove stanno i nomi dei servizi. */
  voci: string[];
  /** Le sole intestazioni (h1–h3), che pesano di più. */
  intestazioni: string[];
  testo: string;
}

export interface LetturaSito {
  pagine: PaginaSito[];
  note: string[];
}

const PAGINE_CHIAVE = /\/(menu|carta|servizi|prestazioni|trattamenti|lavorazioni|prodotti|listino|chi-siamo|chi_siamo|azienda|about|specialit)/i;

function pulisci(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function decodifica(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&agrave;/g, "à")
    .replace(/&egrave;/g, "è")
    .replace(/&eacute;/g, "é")
    .replace(/&igrave;/g, "ì")
    .replace(/&ograve;/g, "ò")
    .replace(/&ugrave;/g, "ù")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function testoDi(frammento: string) {
  return decodifica(frammento.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Il testo di una pagina con un punto tra un blocco e l'altro, così le frasi non si incollano. */
function testoBlocchi(frammento: string) {
  return decodifica(
    frammento
      .replace(/<\/?(li|p|h[1-6]|div|br|tr|td|th|dt|dd|section|article|header|footer|nav|ul|ol)[^>]*>/gi, " . ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .replace(/(\s*\.\s*){2,}/g, ". ")
    .trim();
}

export function analizzaPagina(url: string, html: string): PaginaSito {
  const h = pulisci(html);
  const titolo = testoDi(h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const voci: string[] = [];
  const intestazioni: string[] = [];
  for (const m of h.matchAll(/<(h1|h2|h3|li|strong|dt)[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = testoDi(m[2]);
    if (t.length < 3 || t.length > 80) continue;
    voci.push(t);
    if (/^h[123]$/i.test(m[1])) intestazioni.push(t);
  }
  const meta = h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1];
  const corpo = h.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? h;
  const testo = [meta ? decodifica(meta) : "", testoBlocchi(corpo)].join(". ").slice(0, 20_000);
  return { url, titolo, voci: [...new Set(voci)].slice(0, 120), intestazioni: [...new Set(intestazioni)].slice(0, 40), testo };
}

const STOP_VOCE = new Set(["menu", "home", "contatti", "contattaci", "prenota", "scopri", "leggi", "chi siamo", "dove siamo", "orari", "galleria", "news", "blog", "privacy", "cookie", "login", "accedi", "carrello", "cerca", "english", "italiano", "seguici", "newsletter", "prenota ora", "scopri di più", "leggi tutto"]);

/** Una voce di elenco o intestazione ripulita: senza anni e code («Forno a legna dal 1987» → «forno a legna»). */
function pulisciVoce(v: string): string {
  return v
    .toLowerCase()
    .replace(/\s+(dal|dall'|da|dalla|anno|since)\s+\d{4}.*$/u, "")
    .replace(/\s+(su richiesta|su prenotazione|disponibile|disponibili|a richiesta)$/u, "")
    .replace(/[.:!?,;]+$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * I termini del sito, prima dalle voci (intestazioni e elenchi: sono già
 * frasi intere, «impasto a lunga lievitazione»), poi dagli n-grammi del testo.
 * Una voce pesa per le pagine in cui compare; le intestazioni il doppio.
 */
export function terminiDaSito(pagine: PaginaSito[], escludi: string[], massimo = 10): TermineRicorrente[] {
  const vietate = new Set(escludi.flatMap((e) => tokenizza(e)));
  const punteggio = new Map<string, number>();
  for (const p of pagine) {
    const viste = new Set<string>();
    for (const grezza of p.voci) {
      const v = pulisciVoce(grezza);
      const tok = tokenizza(v);
      if (!v || STOP_VOCE.has(v) || tok.length > 5 || v.length > 45) continue;
      if (tok.length === 1 && tok[0].length < 5) continue;
      if (tok.some((t) => vietate.has(t))) continue;
      if (tok.every((t) => /^\d+$/.test(t))) continue;
      if (viste.has(v)) continue;
      viste.add(v);
      const peso = p.intestazioni.includes(grezza) ? 2 : 1;
      punteggio.set(v, (punteggio.get(v) ?? 0) + peso);
    }
  }
  const voci = [...punteggio.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).map(([termine, volte]) => ({ termine, volte }));
  // Dal testo: solo quello che non è già coperto da una voce.
  if (voci.length >= 5) return voci.slice(0, massimo);
  const dalTesto = estraiTermini(pagine.map((p) => p.testo.slice(0, 6000)), escludi, { minimo: 2, massimo: 6 }).filter((t) => !voci.some((v) => v.termine.includes(t.termine) || t.termine.includes(v.termine)));
  return [...voci, ...dalTesto.slice(0, 3)].slice(0, massimo);
}

/** Link interni alle pagine chiave, assoluti, senza duplicati. */
export function linkChiave(base: string, html: string, max = 4): string[] {
  const origine = new URL(base);
  const trovati = new Set<string>();
  for (const m of html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
    let u: URL;
    try {
      u = new URL(m[1], base);
    } catch {
      continue;
    }
    if (u.origin !== origine.origin) continue;
    if (!PAGINE_CHIAVE.test(u.pathname)) continue;
    if (/\.(pdf|jpe?g|png|webp)$/i.test(u.pathname)) continue;
    trovati.add(u.toString());
    if (trovati.size >= max) break;
  }
  return [...trovati];
}

/** Il menu o il listino è solo un PDF o un'immagine? */
export function menuSoloPdf(html: string, pagine: PaginaSito[]): boolean {
  const pdfMenu = /href=["'][^"']*(menu|carta|listino)[^"']*\.pdf/i.test(html);
  const paginaMenu = pagine.some((p) => /menu|carta|listino/i.test(p.url) && p.voci.length >= 8);
  return pdfMenu && !paginaMenu;
}

export async function leggiSito(url: string | undefined): Promise<LetturaSito> {
  if (!url) return { pagine: [], note: ["Nessun sito sulla scheda Google: gli assistenti non hanno una fonte tua da leggere."] };
  return conCache(`sito:${url}`, 3 * GIORNO, async () => {
    const res = await scarica(url, { headers: { "User-Agent": "VisibilitaAI/1.0 (+lettura del sito dell'attività)" }, redirect: "follow" }, 6000);
    if (!res || !res.ok) return { pagine: [], note: ["Il sito non risponde: gli assistenti non possono leggerlo."] };
    const html = await testoLimitato(res);
    const home = analizzaPagina(res.url || url, html);
    const altre = await Promise.all(
      linkChiave(res.url || url, html).map(async (u) => {
        const r = await scarica(u, { headers: { "User-Agent": "VisibilitaAI/1.0" }, redirect: "follow" }, 5000);
        if (!r || !r.ok) return null;
        return analizzaPagina(u, await testoLimitato(r, 300_000));
      }),
    );
    const pagine = [home, ...altre.filter((p): p is PaginaSito => p !== null)];
    const note: string[] = [];
    if (menuSoloPdf(html, pagine)) note.push("Menu o listino solo in PDF: gli assistenti leggono il testo delle pagine, non i PDF.");
    if (home.testo.length < 400) note.push("La pagina iniziale ha pochissimo testo: gli assistenti hanno poco da leggere.");
    return { pagine, note };
  });
}
