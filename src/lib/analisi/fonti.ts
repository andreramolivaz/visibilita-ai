/**
 * Dalle URL citate o consultate ai nomi delle fonti: i portali di categoria
 * con il loro nome, il sito dell'attività come «Sito ufficiale», il resto
 * per dominio. Per risposta, senza doppioni.
 */

const PORTALI: [RegExp, string][] = [
  [/(^|\.)thefork\./, "TheFork"],
  [/(^|\.)tripadvisor\./, "TripAdvisor"],
  [/(^|\.)(maps\.google\.|google\.[a-z.]+$|maps\.app\.goo\.gl|goo\.gl)/, "Google Maps"],
  [/(^|\.)booking\.com/, "Booking"],
  [/(^|\.)airbnb\./, "Airbnb"],
  [/(^|\.)(expedia|hotels)\./, "Expedia"],
  [/(^|\.)miodottore\.it/, "MioDottore"],
  [/(^|\.)dottori\.it/, "Dottori.it"],
  [/(^|\.)treatwell\./, "Treatwell"],
  [/(^|\.)fresha\.com/, "Fresha"],
  [/(^|\.)paginegialle\.it/, "PagineGialle"],
  [/(^|\.)prontopro\.it/, "ProntoPro"],
  [/(^|\.)instapro\.it/, "Instapro"],
  [/(^|\.)habitissimo\.it/, "Habitissimo"],
  [/(^|\.)houzz\./, "Houzz"],
  [/(^|\.)immobiliare\.it/, "Immobiliare.it"],
  [/(^|\.)idealista\.it/, "Idealista"],
  [/(^|\.)casa\.it/, "Casa.it"],
  [/(^|\.)subito\.it/, "Subito"],
  [/(^|\.)linkedin\.com/, "LinkedIn"],
  [/(^|\.)instagram\.com/, "Instagram"],
  [/(^|\.)facebook\.com/, "Facebook"],
  [/(^|\.)gamberorosso\.it/, "Gambero Rosso"],
  [/(^|\.)michelin\./, "Michelin"],
  [/(^|\.)wikipedia\.org/, "Wikipedia"],
  [/(^|\.)europages\./, "Europages"],
  [/(^|\.)kompass\./, "Kompass"],
  [/(^|\.)directindustry\./, "DirectIndustry"],
  [/(^|\.)yelp\./, "Yelp"],
  [/(^|\.)reddit\.com/, "Reddit"],
  [/(^|\.)youtube\.com|youtu\.be/, "YouTube"],
  [/(^|\.)trustpilot\./, "Trustpilot"],
  [/(^|\.)autoscout24\./, "AutoScout24"],
  [/(^|\.)agriturismo\.it/, "Agriturismo.it"],
  [/(^|\.)getyourguide\./, "GetYourGuide"],
  [/(^|\.)dissapore\.com/, "Dissapore"],
  [/(^|\.)sortlist\./, "Sortlist"],
  [/(^|\.)clutch\.co/, "Clutch"],
];

function dominio(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Il nome della fonte per una URL. */
export function portaleDa(url: string, sitoAttivita?: string): string | null {
  const h = dominio(url);
  if (!h) return null;
  const mio = sitoAttivita ? dominio(sitoAttivita) : null;
  if (mio && (h === mio || h.endsWith(`.${mio}`))) return "Sito ufficiale";
  for (const [re, nome] of PORTALI) if (re.test(h)) return nome;
  return h;
}

/** Le fonti di una risposta, senza doppioni, nell'ordine di prima comparsa. */
export function portaliDa(urls: string[], sitoAttivita?: string): string[] {
  const out: string[] = [];
  for (const u of urls) {
    const p = portaleDa(u, sitoAttivita);
    if (p && !out.includes(p)) out.push(p);
  }
  return out;
}

/** Una fonte è un portale con un nome proprio (non un dominio qualsiasi)? */
export function ePortale(nome: string): boolean {
  return nome === "Sito ufficiale" || PORTALI.some(([, n]) => n === nome);
}
