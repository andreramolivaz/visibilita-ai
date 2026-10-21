import type { ConcorrenteVicino, ProfiloAttivita } from "../types";
import { profiloDaCategoriaGoogle } from "../profiles";
import { GIORNO, conCache, scarica } from "./rete";

/**
 * Google Places API (New): la scheda dell'attività, le sue recensioni e i
 * concorrenti vicini della stessa categoria. Una ricerca testuale con i campi
 * che servono (SKU «Enterprise + Atmosphere» per rating e recensioni), una
 * ricerca nelle vicinanze per i concorrenti. In italiano, regione IT.
 */

const BASE = "https://places.googleapis.com/v1";

const CAMPI_SCHEDA = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.types",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.regularOpeningHours",
  "places.reviews",
  "places.delivery",
  "places.takeout",
  "places.dineIn",
  "places.reservable",
  "places.outdoorSeating",
  "places.servesVegetarianFood",
  "places.goodForChildren",
  "places.allowsDogs",
  "places.parkingOptions",
  "places.accessibilityOptions",
].join(",");

const CAMPI_VICINI = ["places.id", "places.displayName", "places.rating", "places.userRatingCount", "places.location"].join(",");

interface ComponenteIndirizzo {
  longText?: string;
  shortText?: string;
  types?: string[];
}

export interface PostoGoogle {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: ComponenteIndirizzo[];
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[]; periods?: { open?: { day?: number } }[] };
  reviews?: { text?: { text?: string }; originalText?: { text?: string }; rating?: number }[];
  delivery?: boolean;
  takeout?: boolean;
  dineIn?: boolean;
  reservable?: boolean;
  outdoorSeating?: boolean;
  servesVegetarianFood?: boolean;
  goodForChildren?: boolean;
  allowsDogs?: boolean;
  parkingOptions?: Record<string, boolean>;
  accessibilityOptions?: Record<string, boolean>;
}

export const placesAttivo = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);

async function chiamata<T>(percorso: string, body: unknown, campi: string): Promise<T | null> {
  const chiave = process.env.GOOGLE_PLACES_API_KEY;
  if (!chiave) return null;
  const res = await scarica(
    `${BASE}/${percorso}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": chiave, "X-Goog-FieldMask": campi },
      body: JSON.stringify(body),
    },
    7000,
  );
  if (!res || !res.ok) return null;
  return (await res.json()) as T;
}

/** La scheda che corrisponde meglio a «nome, città» (o a un link di Google Maps). */
export async function cercaScheda(query: string): Promise<PostoGoogle | null> {
  const q = query.trim();
  if (!q) return null;
  return conCache(`places:testo:${q.toLowerCase()}`, 7 * GIORNO, async () => {
    const out = await chiamata<{ places?: PostoGoogle[] }>("places:searchText", { textQuery: q, languageCode: "it", regionCode: "IT", maxResultCount: 3 }, CAMPI_SCHEDA);
    return out?.places?.[0] ?? null;
  });
}

/** Attività della stessa categoria entro `raggioM`, dalla più nota (per numero di recensioni). */
export async function concorrentiVicini(posto: PostoGoogle, raggioM = 3000): Promise<ConcorrenteVicino[]> {
  if (!posto.location || !posto.primaryType) return [];
  const { latitude, longitude } = posto.location;
  return conCache(`places:vicini:${posto.id}`, 7 * GIORNO, async () => {
    const out = await chiamata<{ places?: PostoGoogle[] }>(
      "places:searchNearby",
      {
        includedPrimaryTypes: [posto.primaryType],
        languageCode: "it",
        regionCode: "IT",
        maxResultCount: 10,
        rankPreference: "POPULARITY",
        locationRestriction: { circle: { center: { latitude, longitude }, radius: raggioM } },
      },
      CAMPI_VICINI,
    );
    return (out?.places ?? [])
      .filter((p) => p.id !== posto.id && p.displayName?.text)
      .map((p) => ({
        nome: p.displayName!.text!,
        rating: p.rating,
        recensioni: p.userRatingCount,
        distanzaM: p.location ? Math.round(distanzaM(latitude, longitude, p.location.latitude, p.location.longitude)) : undefined,
      }))
      .sort((a, b) => (b.recensioni ?? 0) - (a.recensioni ?? 0));
  });
}

function distanzaM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

const FASCIA: Record<string, ProfiloAttivita["fasciaPrezzo"]> = {
  PRICE_LEVEL_INEXPENSIVE: "€",
  PRICE_LEVEL_MODERATE: "€€",
  PRICE_LEVEL_EXPENSIVE: "€€€",
  PRICE_LEVEL_VERY_EXPENSIVE: "€€€€",
};

/** Gli attributi della scheda che un cliente usa come vincolo nelle domande. */
export function serviziDaScheda(p: PostoGoogle): string[] {
  const s: string[] = [];
  if (p.delivery) s.push("consegna a domicilio");
  if (p.takeout) s.push("asporto");
  if (p.reservable) s.push("prenotazione");
  if (p.outdoorSeating) s.push("dehors");
  if (p.servesVegetarianFood) s.push("menu vegetariano");
  if (p.goodForChildren) s.push("adatto ai bambini");
  if (p.allowsDogs) s.push("cani ammessi");
  if (p.parkingOptions && Object.values(p.parkingOptions).some(Boolean)) s.push("parcheggio");
  if (p.accessibilityOptions?.wheelchairAccessibleEntrance) s.push("accessibile in carrozzina");
  const giorni = new Set((p.regularOpeningHours?.periods ?? []).map((x) => x.open?.day).filter((d) => d !== undefined));
  if (giorni.has(0)) s.push("aperto la domenica");
  return s;
}

function componente(p: PostoGoogle, tipo: string, breve = false): string | undefined {
  const c = p.addressComponents?.find((x) => x.types?.includes(tipo));
  return (breve ? c?.shortText : c?.longText) ?? c?.longText;
}

/** Da una scheda Google al profilo dell'attività. Specialità e servizi arrivano dopo, dai segnali. */
export function profiloDaScheda(p: PostoGoogle): ProfiloAttivita {
  const nome = p.displayName?.text ?? "";
  const citta = componente(p, "locality") ?? componente(p, "postal_town") ?? componente(p, "administrative_area_level_3") ?? "";
  const categoriaGoogle = p.primaryTypeDisplayName?.text ?? (p.primaryType ?? "").replaceAll("_", " ");
  const profilo = profiloDaCategoriaGoogle(categoriaGoogle);
  return {
    id: p.id,
    placeId: p.id,
    nome,
    citta,
    zona: componente(p, "sublocality_level_1") ?? componente(p, "neighborhood") ?? undefined,
    provincia: componente(p, "administrative_area_level_2") ?? undefined,
    regione: componente(p, "administrative_area_level_1") ?? undefined,
    indirizzo: p.formattedAddress ?? "",
    telefono: p.nationalPhoneNumber,
    sito: p.websiteUri,
    categoriaGoogle,
    categoria: profilo.id,
    specialita: [],
    servizi: serviziDaScheda(p),
    fasciaPrezzo: p.priceLevel ? FASCIA[p.priceLevel] : undefined,
    orari: p.regularOpeningHours?.weekdayDescriptions?.join("; "),
    rating: p.rating,
    recensioni: p.userRatingCount,
    portaliPresenti: ["Google Maps", ...(p.websiteUri ? (["Sito ufficiale"] as const) : [])],
    portaliAssenti: p.websiteUri ? [] : ["Sito ufficiale"],
    incoerenze: [],
    coordinate: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : undefined,
  };
}

/** I testi delle recensioni della scheda (al massimo 5 dalle API). */
export function testiRecensioni(p: PostoGoogle): string[] {
  return (p.reviews ?? []).map((r) => r.text?.text ?? r.originalText?.text ?? "").filter((t) => t.length > 0);
}
