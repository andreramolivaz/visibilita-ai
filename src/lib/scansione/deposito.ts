import type { Report } from "../types";
import type { Cella, Scansione } from "./tipi";
import { supabaseAdmin } from "../supabase/admin";

/**
 * Dove stanno scansioni, celle e report. Due implementazioni con la stessa
 * interfaccia: in memoria (sviluppo e dimostrazione: vive finché vive il
 * processo) e Supabase (produzione). Si sceglie da sola in base alle chiavi.
 */
export interface Deposito {
  salvaScansione(s: Scansione): Promise<void>;
  salvaCella(id: string, c: Cella): Promise<void>;
  aggiornaStato(s: Scansione): Promise<void>;
  leggiScansione(id: string): Promise<Scansione | null>;
  /** Le scansioni con celle da fare già scadute. */
  scansioniDaAvanzare(ora: string): Promise<string[]>;
  salvaReport(r: Report, email?: string): Promise<void>;
  leggiReport(id: string): Promise<Report | null>;
  /** I report di un'email, dal più recente: l'area personale. */
  reportPerEmail(email: string): Promise<Report[]>;
  testGratuitiOggi(): Promise<number>;
  ultimoTestGratuito(placeId: string): Promise<{ quando: string; scansioneId: string } | null>;
  registraTestGratuito(x: { placeId?: string; nome: string; citta: string; scansioneId: string }): Promise<void>;
}

/* ---------- In memoria ---------- */

interface TestGratuito {
  placeId?: string;
  nome: string;
  citta: string;
  scansioneId: string;
  quando: string;
}
interface Memoria {
  scansioni: Map<string, Scansione>;
  report: Map<string, Report>;
  emailReport: Map<string, string>;
  test: TestGratuito[];
}
const g = globalThis as unknown as { __vai?: Memoria };
const mem: Memoria = (g.__vai ??= { scansioni: new Map<string, Scansione>(), report: new Map<string, Report>(), emailReport: new Map<string, string>(), test: [] });

const memoria: Deposito = {
  async salvaScansione(s) {
    mem.scansioni.set(s.id, s);
  },
  async salvaCella(id, c) {
    const s = mem.scansioni.get(id);
    if (!s) return;
    const i = s.celle.findIndex((x) => x.domandaId === c.domandaId && x.motore === c.motore && x.ripetizione === c.ripetizione);
    if (i >= 0) s.celle[i] = c;
    else s.celle.push(c);
  },
  async aggiornaStato(s) {
    const v = mem.scansioni.get(s.id);
    if (v) Object.assign(v, { stato: s.stato, aggiornataIl: s.aggiornataIl, reportId: s.reportId });
  },
  async leggiScansione(id) {
    return mem.scansioni.get(id) ?? null;
  },
  async scansioniDaAvanzare(ora) {
    return [...mem.scansioni.values()]
      .filter((s) => s.stato !== "completata" && s.stato !== "in attesa di pagamento" && s.celle.some((c) => c.stato === "da fare" && c.eseguiDopo <= ora))
      .map((s) => s.id);
  },
  async salvaReport(r, email) {
    mem.report.set(r.id, r);
    if (email) mem.emailReport.set(r.id, email.toLowerCase());
  },
  async leggiReport(id) {
    return mem.report.get(id) ?? null;
  },
  async reportPerEmail(email) {
    const e = email.toLowerCase();
    return [...mem.report.values()].filter((r) => mem.emailReport.get(r.id) === e).sort((a, b) => (a.data < b.data ? 1 : -1));
  },
  async testGratuitiOggi() {
    const oggi = new Date().toISOString().slice(0, 10);
    return mem.test.filter((t) => t.quando.slice(0, 10) === oggi).length;
  },
  async ultimoTestGratuito(placeId) {
    const t = [...mem.test].reverse().find((x) => x.placeId === placeId);
    return t ? { quando: t.quando, scansioneId: t.scansioneId } : null;
  },
  async registraTestGratuito(x) {
    mem.test.push({ ...x, quando: new Date().toISOString() });
  },
};

/* ---------- Supabase ---------- */

type Riga = { id: string; stato: string; dati: Omit<Scansione, "celle">; email: string | null };
type RigaCella = { scansione_id: string; domanda_id: string; motore: string; ripetizione: number; esegui_dopo: string; stato: string; risposta: Cella["risposta"] | null; analisi: Cella["analisi"] | null };

function senzaCelle(s: Scansione): Omit<Scansione, "celle"> {
  const copia: Partial<Scansione> = { ...s };
  delete copia.celle;
  return copia as Omit<Scansione, "celle">;
}

function supabase(): Deposito {
  const db = supabaseAdmin()!;
  const aCella = (r: RigaCella): Cella => ({ domandaId: r.domanda_id, motore: r.motore as Cella["motore"], ripetizione: r.ripetizione, eseguiDopo: r.esegui_dopo, stato: r.stato as Cella["stato"], risposta: r.risposta ?? undefined, analisi: r.analisi ?? undefined });
  const aRiga = (id: string, c: Cella): RigaCella => ({ scansione_id: id, domanda_id: c.domandaId, motore: c.motore, ripetizione: c.ripetizione, esegui_dopo: c.eseguiDopo, stato: c.stato, risposta: c.risposta ?? null, analisi: c.analisi ?? null });
  return {
    async salvaScansione(s) {
      await db.from("scansioni").upsert({ id: s.id, stato: s.stato, email: s.email ?? null, dati: senzaCelle(s), aggiornata_il: s.aggiornataIl });
      if (s.celle.length) await db.from("celle").upsert(s.celle.map((c) => aRiga(s.id, c)));
    },
    async salvaCella(id, c) {
      await db.from("celle").upsert(aRiga(id, c));
    },
    async aggiornaStato(s) {
      const dati = senzaCelle(s);
      await db.from("scansioni").update({ stato: s.stato, dati, aggiornata_il: s.aggiornataIl }).eq("id", s.id);
    },
    async leggiScansione(id) {
      const { data } = await db.from("scansioni").select("id, stato, dati, email").eq("id", id).maybeSingle<Riga>();
      if (!data) return null;
      const { data: celle } = await db.from("celle").select("*").eq("scansione_id", id).returns<RigaCella[]>();
      return { ...data.dati, id: data.id, stato: data.stato as Scansione["stato"], celle: (celle ?? []).map(aCella) };
    },
    async scansioniDaAvanzare(ora) {
      const { data } = await db.from("celle").select("scansione_id").eq("stato", "da fare").lte("esegui_dopo", ora).returns<{ scansione_id: string }[]>();
      const ids = [...new Set((data ?? []).map((r) => r.scansione_id))];
      if (ids.length === 0) return [];
      const { data: pronte } = await db.from("scansioni").select("id").in("id", ids).not("stato", "in", '("in attesa di pagamento","completata")').returns<{ id: string }[]>();
      return (pronte ?? []).map((r) => r.id);
    },
    async salvaReport(r, email) {
      await db.from("report").upsert({ id: r.id, email: email ?? null, punteggio: r.punteggio, verdetto: r.verdetto, dati: r });
    },
    async leggiReport(id) {
      const { data } = await db.from("report").select("dati").eq("id", id).maybeSingle<{ dati: Report }>();
      return data?.dati ?? null;
    },
    async reportPerEmail(email) {
      const { data } = await db.from("report").select("dati").ilike("email", email).order("creato_il", { ascending: false }).returns<{ dati: Report }[]>();
      return (data ?? []).map((r) => r.dati);
    },
    async testGratuitiOggi() {
      const inizio = new Date();
      inizio.setUTCHours(0, 0, 0, 0);
      const { count } = await db.from("test_gratuiti").select("*", { count: "exact", head: true }).gte("creato_il", inizio.toISOString());
      return count ?? 0;
    },
    async ultimoTestGratuito(placeId) {
      const { data } = await db.from("test_gratuiti").select("creato_il, scansione_id").eq("google_place_id", placeId).order("creato_il", { ascending: false }).limit(1).maybeSingle<{ creato_il: string; scansione_id: string }>();
      return data ? { quando: data.creato_il, scansioneId: data.scansione_id } : null;
    },
    async registraTestGratuito(x) {
      await db.from("test_gratuiti").insert({ google_place_id: x.placeId ?? null, nome: x.nome, citta: x.citta, scansione_id: x.scansioneId });
    },
  };
}

export function deposito(): Deposito {
  return supabaseAdmin() ? supabase() : memoria;
}
