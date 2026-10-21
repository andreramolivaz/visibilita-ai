import { Document, Page, Text, View, StyleSheet, Font, Svg, Rect, Circle, Path } from "@react-pdf/renderer";
import type { Report, TipoDomanda, Verdetto } from "@/lib/types";
import { ENGINES } from "@/lib/engines";
import { distribuzionePosizioni } from "@/components/report/Posizioni";
import { coerenzaDati, concentrazione, confrontoDiretto, copertura, datiCorretti, percentuale, posizioneMedia, primiTre, punteggioPerMotore, quotaVoce, spontanee, stabilita, tassoCitazione, territorio } from "@/lib/stats";
import { GLOSSARIO } from "@/lib/glossario";
import { RIFERIMENTI } from "@/lib/riferimenti";

/**
 * Il report in PDF: cinque pagine. Sintesi e azioni, concorrenti e dove ti
 * trovano, mappa e fonti, descrizioni e metodo, riferimenti e definizioni.
 * Rapporto tecnico: intestazione con marchio e identificativo, sezioni
 * numerate, tabelle, numeri tabellari, un solo colore. In white-label
 * `logo` è il nome dell'agenzia al posto del nostro.
 */

Font.registerHyphenationCallback((parola) => [parola]);

const C = {
  ink: "#14201c",
  muted: "#5b6661",
  faint: "#8a938f",
  line: "#d9dedb",
  lineSoft: "#e9edeb",
  soft: "#f3f5f4",
  accent: "#0e5a47",
  accentSoft: "#e2f0eb",
  danger: "#b3261e",
  warn: "#9a6400",
  grey: "#b9c2be",
};

const POS: Record<1 | 2 | 3 | 4 | 5, string> = { 1: "#0a4537", 2: "#0e5a47", 3: "#3f7f6b", 4: "#7fa99a", 5: "#b7d1c7" };

const NOME_TIPO: Record<TipoDomanda, string> = {
  generica: "Generica",
  bisogno: "Per bisogno",
  specialita: "Per specialità",
  requisito: "Per requisito",
  confronto: "Confronto",
  nome: "Sul nome",
};

const s = StyleSheet.create({
  page: { paddingTop: 64, paddingBottom: 54, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 9, color: C.ink, lineHeight: 1.4 },
  testata: { position: "absolute", top: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 6 },
  marchio: { flexDirection: "row", alignItems: "center", gap: 6 },
  marchioTesto: { fontSize: 10, fontFamily: "Helvetica-Bold", letterSpacing: -0.2 },
  testataDestra: { alignItems: "flex-end" },
  mono: { fontFamily: "Courier", fontSize: 7.5, color: C.muted },
  pie: { position: "absolute", bottom: 22, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: C.line, paddingTop: 5, fontSize: 7, color: C.faint },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: -0.4, lineHeight: 1.15 },
  sopratitolo: { fontSize: 8, color: C.muted, letterSpacing: 0.3, marginBottom: 3 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 4, paddingBottom: 3, borderBottomWidth: 0.75, borderBottomColor: C.ink },
  h3: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 3 },
  lettura: { fontSize: 9, lineHeight: 1.4, marginBottom: 5 },
  p: { fontSize: 9, lineHeight: 1.45 },
  nota: { fontSize: 7.5, color: C.muted, lineHeight: 1.35 },
  riga: { flexDirection: "row", alignItems: "center" },
  colonne: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  th: { flexDirection: "row", backgroundColor: C.soft, borderBottomWidth: 0.75, borderBottomColor: C.ink, paddingVertical: 3, paddingHorizontal: 4 },
  thTesto: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.ink },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.lineSoft, paddingVertical: 2.5, paddingHorizontal: 4, alignItems: "center" },
  td: { fontSize: 8.5 },
  tdNum: { fontSize: 8.5, textAlign: "right" },
  kv: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.lineSoft, paddingVertical: 2.5 },
  k: { width: 110, fontSize: 8, color: C.muted },
  v: { flex: 1, fontSize: 8.5 },
  kpi: { flex: 1, borderWidth: 0.5, borderColor: C.line, padding: 6 },
  kpiNumero: { fontSize: 16, fontFamily: "Helvetica-Bold", lineHeight: 1.1, letterSpacing: -0.3 },
  kpiTesto: { fontSize: 7, color: C.muted, marginTop: 1 },
  punteggio: { fontSize: 44, fontFamily: "Helvetica-Bold", letterSpacing: -1.5, lineHeight: 1.05 },
  barraSfondo: { height: 4, backgroundColor: C.soft },
  barra: { height: 4 },
  cella: { height: 14, alignItems: "center", justifyContent: "center", borderRightWidth: 0.5, borderRightColor: "#ffffff" },
  riquadro: { borderWidth: 0.5, borderColor: C.accent, padding: 8 },
});

const nomeMotore = (id: string) => ENGINES.find((e) => e.id === id)?.nome ?? id;
const motore = (id: string) => ENGINES.find((e) => e.id === id);
const dataIt = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
const dataLunga = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
const oraIt = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");
const n1 = (x: number) => x.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const maiuscola = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const volteDi = (c: { posizione: number | null; volte?: number; frequenza: string }) => (c.posizione === null ? 0 : (c.volte ?? Number(c.frequenza.split(" ")[0])));

/** «18–20 ottobre 2026» oppure «20 ottobre 2026, 10:12–10:14». */
function periodo(inizio: string, fine: string) {
  const a = new Date(inizio);
  const b = new Date(fine);
  if (a.toDateString() === b.toDateString()) return `${dataLunga(inizio)}, ${oraIt(inizio)}–${oraIt(fine)}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return `${a.getDate()}–${dataLunga(fine)}`;
  return `${dataLunga(inizio)} – ${dataLunga(fine)}`;
}

function coloreVerdetto(v: Verdetto) {
  if (v === "Invisibile") return C.danger;
  if (v === "Poco visibile") return C.warn;
  return C.accent;
}

/** Identificativo del documento: VAI-AAAAMMGG-ID. */
function docId(r: Report) {
  return `VAI-${r.data.replaceAll("-", "")}-${r.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
}

function Marchio({ nome }: { nome: string }) {
  return (
    <View style={s.marchio}>
      <Svg width={15} height={15} viewBox="0 0 64 64">
        <Path d="M14 6h36a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10H40l-8 9-8-9H14A10 10 0 0 1 4 42V16A10 10 0 0 1 14 6z" fill={C.accent} />
        <Circle cx={17} cy={19} r={3} fill="#ffffff" opacity={0.4} />
        <Rect x={24} y={16.5} width={18} height={5} rx={2.5} ry={2.5} fill="#ffffff" opacity={0.4} />
        <Circle cx={17} cy={29} r={3.5} fill="#9fe8c6" />
        <Rect x={24} y={26} width={26} height={6} rx={3} ry={3} fill="#ffffff" />
        <Circle cx={17} cy={39} r={3} fill="#ffffff" opacity={0.4} />
        <Rect x={24} y={36.5} width={14} height={5} rx={2.5} ry={2.5} fill="#ffffff" opacity={0.4} />
      </Svg>
      <Text style={s.marchioTesto}>{nome}</Text>
    </View>
  );
}

function Testata({ r, logo }: { r: Report; logo?: string }) {
  return (
    <View style={s.testata} fixed>
      <View>
        <Marchio nome={logo ?? "Visibilità AI"} />
        <Text style={[s.mono, { marginTop: 2 }]}>Report di visibilità AI · metodo v1.1</Text>
      </View>
      <View style={s.testataDestra}>
        <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>
          {r.attivita.nome}, {r.attivita.citta}
        </Text>
        <Text style={s.mono}>
          {docId(r)} · {dataIt(r.data)}
        </Text>
      </View>
    </View>
  );
}

function Pie({ r }: { r: Report }) {
  return (
    <View style={s.pie} fixed>
      <Text>Documento {docId(r)} · riservato al titolare dell&apos;attività</Text>
      <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} di ${totalPages}`} />
    </View>
  );
}

type Colonna = { testo: string; larghezza: number; num?: boolean };

function Tabella({ colonne, righe, evidenzia }: { colonne: Colonna[]; righe: (string | React.ReactNode)[][]; evidenzia?: number }) {
  return (
    <View>
      <View style={s.th}>
        {colonne.map((c, i) => (
          <Text key={i} style={[s.thTesto, { flex: c.larghezza, paddingRight: 4, textAlign: c.num ? "right" : "left" }]}>
            {c.testo}
          </Text>
        ))}
      </View>
      {righe.map((riga, i) => (
        <View key={i} style={[s.tr, evidenzia === i ? { backgroundColor: C.accentSoft } : {}]} wrap={false}>
          {riga.map((cella, j) => {
            const c = colonne[j];
            return typeof cella === "string" ? (
              <Text key={j} style={[c.num ? s.tdNum : s.td, { flex: c.larghezza, paddingRight: 4 }, evidenzia === i ? { fontFamily: "Helvetica-Bold" } : {}]}>
                {cella}
              </Text>
            ) : (
              <View key={j} style={{ flex: c.larghezza, paddingRight: 4 }}>
                {cella}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function BarraCella({ valore, massimo, pieno = true }: { valore: number; massimo: number; pieno?: boolean }) {
  const w = massimo > 0 ? Math.max(0, Math.min(100, (valore / massimo) * 100)) : 0;
  return (
    <View style={s.barraSfondo}>
      <View style={[s.barra, { width: `${w}%`, backgroundColor: pieno ? C.accent : C.grey }]} />
    </View>
  );
}

function Scala({ punteggio, riferimento }: { punteggio: number; riferimento?: number }) {
  const fasce = [
    { nome: "Invisibile", da: 0, a: 10, colore: C.danger },
    { nome: "Poco visibile", da: 11, a: 40, colore: C.warn },
    { nome: "Visibile", da: 41, a: 70, colore: C.accent },
    { nome: "Dominante", da: 71, a: 100, colore: "#0a4537" },
  ];
  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ flexDirection: "row", height: 5 }}>
        {fasce.map((f) => (
          <View key={f.nome} style={{ width: `${f.a - f.da + (f.da ? 1 : 0)}%`, backgroundColor: f.colore, opacity: punteggio >= f.da ? 1 : 0.25 }} />
        ))}
      </View>
      <View style={{ position: "relative", height: 7 }}>
        <View style={{ position: "absolute", left: `${punteggio}%`, top: -9, width: 1.5, height: 12, backgroundColor: C.ink }} />
        {riferimento !== undefined && <View style={{ position: "absolute", left: `${riferimento}%`, top: -8, width: 1.5, height: 10, backgroundColor: C.faint }} />}
      </View>
      <View style={{ flexDirection: "row" }}>
        {fasce.map((f) => {
          const attiva = punteggio >= f.da && punteggio <= f.a;
          return (
            <View key={f.nome} style={{ width: "25%" }}>
              <Text style={[{ fontSize: 6.5, color: C.faint, lineHeight: 1.2 }, attiva ? { color: C.ink, fontFamily: "Helvetica-Bold" } : {}]}>{f.nome}</Text>
              <Text style={{ fontSize: 6.5, color: C.faint, lineHeight: 1.2 }}>
                {f.da}–{f.a}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Segmenti({ parti, totale, altezza = 10 }: { parti: { v: number; colore: string; testo?: string; chiaro?: boolean }[]; totale: number; altezza?: number }) {
  return (
    <View style={{ flexDirection: "row", height: altezza, gap: 1 }}>
      {parti
        .filter((p) => p.v > 0)
        .map((p, i) => (
          <View key={i} style={{ width: `${(p.v / totale) * 100}%`, backgroundColor: p.colore, alignItems: "center", justifyContent: "center" }}>
            {p.testo && (p.v / totale) * 100 >= 7 && <Text style={{ fontSize: 6.5, fontFamily: "Helvetica-Bold", color: p.chiaro ? C.ink : "#fff", lineHeight: 1 }}>{p.testo}</Text>}
          </View>
        ))}
    </View>
  );
}

function Chiavi({ voci }: { voci: [string, string][] }) {
  return (
    <View>
      {voci.map(([k, v]) => (
        <View key={k} style={s.kv}>
          <Text style={s.k}>{k}</Text>
          <Text style={s.v}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReportPdf({ report: r, logo }: { report: Report; logo?: string }) {
  const totale = r.domande * r.motori.length * r.ripetizioni;
  const spont = r.domandeSpontanee * r.motori.length * r.ripetizioni;
  const confronti = confrontoDiretto(r.righe);
  const col = coloreVerdetto(r.verdetto);
  const dist = distribuzionePosizioni(r.righe);
  const distTot = Object.values(dist).reduce((a, b) => a + b, 0);
  const tue = r.concorrenti.find((c) => c.seiTu);
  const tueCitazioni = tue?.citazioni ?? 0;
  const gratuito = r.piano === "gratuito";
  const indiceTuo = r.concorrenti.findIndex((c) => c.seiTu);
  const testa = (nome: string) => r.testaATesta.find((t) => t.nome === nome);
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  const potenziale = guadagno > 0 ? Math.min(100, r.punteggio + guadagno) : null;
  const cit = tassoCitazione(r.righe, r.ripetizioni);
  const cop = copertura(r.righe);
  const stab = stabilita(r.righe, r.ripetizioni);
  const conc = concentrazione(r.concorrenti);
  const coer = coerenzaDati(r.attivita);
  const parziali = punteggioPerMotore(r.righe, r.ripetizioni);
  const qv = quotaVoce(r.concorrenti, r.citazioniTotali);
  const top3 = primiTre(r.righe);
  const posMedia = posizioneMedia(r.righe);
  const terr = territorio(r.righe);
  const dc = datiCorretti(r.descrizioniPerMotore);
  const critici = r.descrizioniPerMotore.filter((d) => d.tono === "critico");
  const primo = r.concorrenti.filter((c) => !c.seiTu)[0];
  const piuForte = (nome: string) => {
    const chi = r.citaChi.find((x) => x.nome === nome);
    if (!chi) return "–";
    const [m, n] = Object.entries(chi.perMotore).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0] ?? [];
    return m && n ? `${nomeMotore(m)} (${n})` : "–";
  };

  return (
    <Document title={`${docId(r)} – ${r.attivita.nome}, ${r.attivita.citta}`} author={logo ?? "Visibilità AI"} subject="Report di visibilità AI" language="it">
      {/* Pagina 1: sintesi e azioni */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />

        <Text style={s.sopratitolo}>REPORT DI VISIBILITÀ AI</Text>
        <Text style={s.h1}>
          {r.attivita.nome}, {r.attivita.citta}
        </Text>
        <Text style={[s.p, { color: C.muted, marginTop: 3 }]}>
          {r.attivita.categoriaGoogle} · {r.attivita.indirizzo}
          {r.attivita.telefono ? ` · ${r.attivita.telefono}` : ""}
        </Text>
        <Text style={[s.mono, { marginTop: 6, color: C.muted }]}>
          {docId(r)} · {periodo(r.metodo.inizio, r.metodo.fine)} · {r.metodo.posizione} · {r.domande} domande × {r.motori.length} assistenti × {r.ripetizioni} ripetizioni = {totale} risposte · punteggio sulle {r.domandeSpontanee} domande spontanee ({spont} risposte) · {gratuito ? "test gratuito" : `piano ${r.piano}`}
        </Text>

        {/* In 30 secondi */}
        <View style={[s.riga, { marginTop: 12, gap: 6, alignItems: "stretch" }]}>
          <View style={[s.kpi, { flex: 1 }]}>
            <Text style={s.kpiTesto}>Dove sei</Text>
            <View style={[s.riga, { alignItems: "flex-end", gap: 6, marginTop: 2 }]}>
              <Text style={[s.kpiNumero, { fontSize: 24, color: col }]}>{r.punteggio}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: col, marginBottom: 2 }}>{r.verdetto}</Text>
            </View>
            <Text style={[s.p, { fontSize: 8.5, marginTop: 3 }]}>
              Compari in {tueCitazioni} risposte su {spont} alle domande senza il tuo nome; quota di voce {percentuale(qv[tue?.nome ?? ""] ?? 0)}.
              {r.contesto ? ` Più alto del ${r.contesto.percentile}% delle ${r.contesto.categoria} analizzate a ${r.contesto.citta} (mediana ${r.contesto.mediana}).` : ""}
            </Text>
          </View>
          <View style={[s.kpi, { flex: 1.2 }]}>
            <Text style={s.kpiTesto}>Chi ti passa davanti</Text>
            {r.concorrenti.filter((c) => !c.seiTu).slice(0, 3).map((c, i) => {
              const t = testa(c.nome);
              return (
                <Text key={c.nome} style={[s.p, { fontSize: 8.5, marginTop: i === 0 ? 2 : 1 }]}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{i + 1}. {c.nome}</Text> · {c.citazioni} citazioni, quota di voce {percentuale(qv[c.nome] ?? 0)}{t ? `; in ${t.loroSenzaTe} domande su ${r.domandeSpontanee} c'è lui e non tu` : ""}
                </Text>
              );
            })}
          </View>
          <View style={[s.kpi, { flex: 1.2, backgroundColor: C.accentSoft, borderColor: C.accent }]}>
            <Text style={s.kpiTesto}>La prima cosa da fare</Text>
            {r.azioni[0] && (
              <>
                <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 2 }}>{r.azioni[0].titolo}</Text>
                <Text style={[s.p, { fontSize: 8.5, marginTop: 2 }]}>{r.azioni[0].dato}</Text>
                {r.azioni[0].impattoStimato !== undefined && (
                  <Text style={{ fontSize: 8.5, marginTop: 3, fontFamily: "Helvetica-Bold", color: C.accent }}>
                    Stima +{r.azioni[0].impattoStimato} punti{potenziale !== null ? `; con tutte e tre, ${potenziale}.` : "."}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        <Text style={s.h2}>1. Sintesi</Text>
        <View style={s.colonne}>
          <View style={[s.col, { flex: 0.9 }]}>
            <View style={[s.riga, { alignItems: "flex-end", gap: 10 }]}>
              <Text style={[s.punteggio, { color: col }]}>{r.punteggio}</Text>
              <View style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: col }}>{r.verdetto}</Text>
                <Text style={s.nota}>su 100</Text>
              </View>
            </View>
            <Scala punteggio={r.punteggio} riferimento={r.contesto?.mediana} />
            {r.contesto && <Text style={[s.nota, { marginTop: 3 }]}>Segno grigio: mediana delle {r.contesto.attivitaAnalizzate} {r.contesto.categoria} analizzate a {r.contesto.citta} ({r.contesto.mediana}).</Text>}
            {distTot > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>Quando compari, dove ti mettono</Text>
                <Segmenti totale={distTot} parti={([1, 2, 3, 4, 5] as const).map((p) => ({ v: dist[p], colore: POS[p], testo: `${p}°`, chiaro: p >= 4 }))} />
                <Text style={[s.nota, { marginTop: 2 }]}>
                  {([1, 2, 3, 4, 5] as const).filter((p) => dist[p] > 0).map((p) => `${p}° ${dist[p]}`).join(" · ")} su {distTot} citazioni; nei primi tre {percentuale(top3.quota)}.
                </Text>
              </View>
            )}
            {potenziale !== null && (
              <View style={{ marginTop: 8 }}>
                <View style={[s.riga, { justifyContent: "space-between", marginBottom: 2 }]}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>Stima con le azioni della sezione 2</Text>
                  <Text style={{ fontSize: 8.5 }}>
                    da {r.punteggio} a <Text style={{ fontFamily: "Helvetica-Bold", color: C.accent }}>{potenziale}</Text>
                  </Text>
                </View>
                <Segmenti
                  totale={100}
                  parti={[
                    { v: r.punteggio, colore: C.ink, testo: String(r.punteggio) },
                    ...r.azioni.filter((a) => (a.impattoStimato ?? 0) > 0).map((a, i) => ({ v: a.impattoStimato ?? 0, colore: ["#0a4537", C.accent, "#3f7f6b"][i % 3], testo: `+${a.impattoStimato}` })),
                    { v: Math.max(0, 100 - potenziale), colore: C.soft },
                  ]}
                />
              </View>
            )}
          </View>
          <View style={[s.col, { flex: 1.1 }]}>
            <Text style={[s.h3, { marginTop: 0 }]}>1.1 Numeri chiave</Text>
            <Tabella
              colonne={[
                { testo: "Metrica", larghezza: 1.5 },
                { testo: "Valore", larghezza: 0.6, num: true },
                { testo: "Campione e nota", larghezza: 2 },
              ]}
              righe={[
                ["Risposte in cui compari", percentuale(cit.quota), `${cit.k} su ${cit.n}; intervallo al 95%: ${percentuale(cit.ic.basso)}–${percentuale(cit.ic.alto)}`],
                ["Quota di voce", percentuale(qv[tue?.nome ?? ""] ?? 0), `${tueCitazioni} su ${r.citazioniTotali ?? conc.totale} citazioni di attività; primo: ${primo ? percentuale(qv[primo.nome] ?? 0) : "–"}`],
                ["Domande in cui compari", percentuale(cop.quota), `${cop.k} su ${cop.n}; ${terr.contese.length} con un concorrente e non tu, ${terr.libere.length} senza nessuno`],
                ["Nei primi tre, quando compari", percentuale(top3.quota), `${top3.k} su ${top3.n}; posizione media ${posMedia ? n1(posMedia) : "–"}`],
                ["Stabilità delle risposte", percentuale(stab.quota), `${stab.concordi} celle su ${stab.totale} concordano su ${r.ripetizioni} ripetizioni`],
                ["Dati corretti", dc.n ? `${dc.k} su ${dc.n}` : `${coer.coerenti} su ${coer.totale}`, dc.n ? `assistenti che riportano i tuoi dati senza errori; ${r.errori.length} errori (sezione 7)` : coer.coerenti === coer.totale ? "nessuna incoerenza" : r.attivita.incoerenze.join(" ")],
              ]}
            />
            <Text style={[s.nota, { marginTop: 4 }]}>
              Punteggio = media, pesata per quota d&apos;uso di ogni assistente, del peso della posizione in cui compari (1° = 1,00 · 2° = 0,85 · 3° = 0,70 · 4° = 0,55 · 5° = 0,40 · assente = 0). Definizioni in Allegato C.
            </Text>
          </View>
        </View>

        <Text style={s.h2}>2. Azioni, in ordine di impatto</Text>
        <Tabella
          colonne={[
            { testo: "Priorità", larghezza: 0.5 },
            { testo: "Azione", larghezza: 2 },
            { testo: "Dato di riferimento", larghezza: 2.6 },
            { testo: "Impatto", larghezza: 0.6 },
            { testo: "Punti stimati", larghezza: 0.7, num: true },
          ]}
          righe={r.azioni.map((a, i) => [String(i + 1), a.titolo, a.dato, maiuscola(a.impatto), a.impattoStimato !== undefined ? `+${a.impattoStimato}` : "–"])}
        />
        <Pie r={r} />
      </Page>

      {/* Pagina 2: concorrenti e dove ti trovano */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />
        <Text style={[s.h2, { marginTop: 0 }]}>3. Chi consigliano al posto tuo</Text>
        {primo && tue && (
          <Text style={s.lettura}>
            {primo.nome}: {primo.citazioni} citazioni contro le tue {tueCitazioni}; quota di voce {percentuale(qv[primo.nome] ?? 0)} contro {percentuale(qv[tue.nome] ?? 0)}.
            {testa(primo.nome) ? ` In ${testa(primo.nome)!.loroSenzaTe} domande su ${r.domandeSpontanee} c'è lui e non tu.` : ""}
          </Text>
        )}
        <Tabella
          colonne={[
            { testo: "#", larghezza: 0.3 },
            { testo: "Attività", larghezza: 2 },
            { testo: `Citazioni (su ${spont})`, larghezza: 1, num: true },
            { testo: "Quota di voce", larghezza: 0.9, num: true },
            { testo: "Nei primi 3", larghezza: 0.8, num: true },
            { testo: "Domande senza di te", larghezza: 1, num: true },
            { testo: "Più forte su", larghezza: 1.2 },
            { testo: "", larghezza: 1.1 },
          ]}
          evidenzia={indiceTuo}
          righe={r.concorrenti.map((c, i) => {
            const t = c.seiTu ? undefined : testa(c.nome);
            return [
              String(i + 1),
              c.seiTu ? `${c.nome} (questa attività)` : c.nome,
              String(c.citazioni),
              percentuale(qv[c.nome] ?? 0),
              c.primiTre !== undefined && c.citazioni > 0 ? pct(c.primiTre, c.citazioni) : "–",
              t ? `${t.loroSenzaTe} su ${r.domandeSpontanee}` : "–",
              piuForte(c.nome),
              <BarraCella key={c.nome} valore={c.citazioni} massimo={r.concorrenti[0]?.citazioni ?? 1} pieno={Boolean(c.seiTu)} />,
            ];
          })}
        />
        <Text style={[s.nota, { marginTop: 4 }]}>
          Risposte alle {r.domandeSpontanee} domande senza il tuo nome. Quota di voce: citazioni dell&apos;attività su tutte le citazioni di attività in quelle risposte ({r.citazioniTotali ?? conc.totale}); i tre nomi più citati ne raccolgono il {percentuale(conc.quotaTop3)} tra i primi cinque. Nei primi 3: quota delle sue citazioni in 1ª, 2ª o 3ª posizione. Più forte su: assistente che lo cita in più domande (su {r.domandeSpontanee}).
        </Text>
        {confronti.map((c) => (
          <Text key={c.domanda.id} style={[s.p, { marginTop: 4 }]}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Confronto diretto{c.concorrente ? ` con ${c.concorrente}` : ""}:</Text> ti mettono per primo {c.preferito.length} {c.preferito.length === 1 ? "assistente" : "assistenti"} su {c.assistenti}
            {c.preferito.length > 0 ? ` (${c.preferito.map(nomeMotore).join(", ")})` : ""}. Non entra nel punteggio.
          </Text>
        ))}

        <Text style={s.h2}>4. Dove ti trovano</Text>
        <Text style={s.lettura}>
          Ci sei in {terr.tue.length} domande su {terr.n}; in {terr.contese.length} c&apos;è un concorrente e tu no; in {terr.libere.length} non c&apos;è nessuno.
        </Text>
        <Segmenti
          totale={terr.n}
          altezza={12}
          parti={[
            { v: terr.tue.length, colore: C.accent, testo: `ci sei ${terr.tue.length}` },
            { v: terr.contese.length, colore: C.grey, testo: `concorrente ${terr.contese.length}`, chiaro: true },
            { v: terr.libere.length, colore: C.soft, testo: `nessuno ${terr.libere.length}`, chiaro: true },
          ]}
        />
        <Text style={[s.nota, { marginTop: 3 }]}>Le domande con un concorrente e non tu sono da conquistare: l&apos;assistente ha già una risposta. Quelle senza nessuno sono libere: basta una fonte buona per essere l&apos;unico nome.</Text>

        <Text style={s.h3}>4.1 Per assistente</Text>
        <Tabella
          colonne={[
            { testo: "Assistente", larghezza: 1.2 },
            { testo: "Utenti in Italia (mln)", larghezza: 1, num: true },
            { testo: "Peso", larghezza: 0.6, num: true },
            { testo: `Domande in cui compari (su ${r.domandeSpontanee})`, larghezza: 1.3, num: true },
            { testo: `Risposte in cui compari (su ${r.domandeSpontanee * r.ripetizioni})`, larghezza: 1.4, num: true },
            { testo: "Punteggio parziale", larghezza: 0.9, num: true },
            { testo: "", larghezza: 1.1 },
          ]}
          righe={r.perMotore.map((m) => {
            const celle = spontanee(r.righe).map((x) => x.celle.find((c) => c.motore === m.motore)!);
            const risposte = celle.reduce((acc, c) => acc + volteDi(c), 0);
            const e = motore(m.motore);
            return [nomeMotore(m.motore), e ? n1(e.utentiMln) : "–", e ? pct(e.peso, 1) : "–", String(m.comparse), String(risposte), String(parziali[m.motore] ?? 0), <BarraCella key={m.motore} valore={parziali[m.motore] ?? 0} massimo={100} />];
          })}
        />
        <Text style={[s.nota, { marginTop: 3 }]}>Domande spontanee. In ordine di quota d&apos;uso in Italia (Audicom/Comscore, luglio 2026); peso rinormalizzato sugli assistenti interrogati. Punteggio parziale: la formula del punteggio, ristretta a quell&apos;assistente.</Text>

        <Text style={s.h3}>4.2 Per tipo di domanda</Text>
        <Tabella
          colonne={[
            { testo: "Tipo", larghezza: 1.2 },
            { testo: "Domande", larghezza: 0.7, num: true },
            { testo: "Risposte", larghezza: 0.8, num: true },
            { testo: "In cui compari", larghezza: 0.9, num: true },
            { testo: "Quota", larghezza: 0.7, num: true },
            { testo: "", larghezza: 1.6 },
          ]}
          righe={r.perTipo.map((t) => [NOME_TIPO[t.tipo], String(t.domande), String(t.totale), String(t.comparse), pct(t.comparse, t.totale), <BarraCella key={t.tipo} valore={t.comparse} massimo={t.totale} />])}
        />
        <Text style={[s.nota, { marginTop: 3 }]}>Generica: categoria e luogo. Per bisogno: urgenza, orario, prezzo, situazione. Per specialità: la prestazione. Per requisito: certificazione, convenzione, servizio accessorio. Confronto: «meglio X o Y?». Sul nome: la verifica dell&apos;attività. Nelle ultime due compari quasi per forza: non entrano nel punteggio.</Text>
        <Pie r={r} />
      </Page>

      {/* Pagina 3: mappa, fonti, terminologia */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />
        <Text style={[s.h2, { marginTop: 0 }]}>5. Mappa domanda × assistente</Text>
        <Text style={[s.nota, { marginBottom: 6 }]}>Ogni cella è una domanda posta a un assistente: posizione in cui compari e quante volte su {r.ripetizioni}. Più scura la cella, più in alto ti mettono. «Conc.»: concorrenti distinti citati per quella domanda.</Text>
        <View style={s.th}>
          <Text style={[s.thTesto, { width: 16 }]}>#</Text>
          <Text style={[s.thTesto, { flex: 2.8 }]}>Domanda</Text>
          <Text style={[s.thTesto, { flex: 0.8 }]}>Tipo</Text>
          {r.motori.map((m) => (
            <Text key={m} style={[s.thTesto, { flex: 0.8, textAlign: "center" }]}>
              {nomeMotore(m)}
            </Text>
          ))}
          <Text style={[s.thTesto, { flex: 0.6, textAlign: "right" }]}>Compari</Text>
          <Text style={[s.thTesto, { flex: 0.5, textAlign: "right" }]}>Conc.</Text>
        </View>
        {r.righe.map((riga, i) => {
          const compari = riga.celle.reduce((acc, c) => acc + volteDi(c), 0);
          return (
            <View key={riga.domanda.id} style={[s.tr, { paddingVertical: 1 }]} wrap={false}>
              <Text style={[s.td, { width: 16, color: C.muted }]}>{i + 1}</Text>
              <Text style={[s.td, { flex: 2.8, paddingRight: 4, fontSize: 7.8 }]}>{riga.domanda.testo}</Text>
              <Text style={[s.td, { flex: 0.8, color: C.muted, fontSize: 7 }]}>{NOME_TIPO[riga.domanda.tipo]}</Text>
              {riga.celle.map((c) => {
                const volte = volteDi(c);
                const vuota = c.posizione === null;
                return (
                  <View key={c.motore} style={[s.cella, { flex: 0.8, backgroundColor: vuota ? C.soft : POS[c.posizione!] }]}>
                    {vuota ? (
                      <Text style={{ fontSize: 7, color: C.faint, lineHeight: 1 }}>–</Text>
                    ) : (
                      <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: c.posizione! >= 4 ? C.ink : "#fff", lineHeight: 1 }}>
                        {c.posizione}°{" "}
                        <Text style={{ fontFamily: "Helvetica", fontSize: 6 }}>
                          {volte}/{r.ripetizioni}
                        </Text>
                      </Text>
                    )}
                  </View>
                );
              })}
              <Text style={[s.tdNum, { flex: 0.6 }]}>
                {compari}/{r.motori.length * r.ripetizioni}
              </Text>
              <Text style={[s.tdNum, { flex: 0.5, color: C.muted }]}>{riga.concorrentiCitati ?? "–"}</Text>
            </View>
          );
        })}
        <View style={[s.riga, { marginTop: 5, gap: 8 }]}>
          <Text style={s.nota}>Legenda posizione:</Text>
          {([1, 2, 3, 4, 5] as const).map((p) => (
            <View key={p} style={[s.riga, { gap: 3 }]}>
              <View style={{ width: 7, height: 7, backgroundColor: POS[p] }} />
              <Text style={s.nota}>{p}°</Text>
            </View>
          ))}
          <View style={[s.riga, { gap: 3 }]}>
            <View style={{ width: 7, height: 7, backgroundColor: C.soft }} />
            <Text style={s.nota}>assente</Text>
          </View>
        </View>

        <Text style={s.h2}>{gratuito ? "6. Fonti citate" : "6. Fonti citate e terminologia"}</Text>
        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={[s.h3, { marginTop: 0 }]}>6.1 Fonti citate dagli assistenti</Text>
            {r.fonti[0] && (
              <Text style={[s.lettura, { fontSize: 8.5 }]}>
                {r.fonti[0].nome} è la fonte più citata ({r.fonti[0].citazioni} risposte): {r.fonti[0].ciSei ? "hai una scheda" : "non hai una scheda"}
                {r.fonti[0].concorrentiPresenti !== undefined ? `; concorrenti presenti: ${r.fonti[0].concorrentiPresenti} su 5` : ""}.
              </Text>
            )}
            <Tabella
              colonne={[
                { testo: "Fonte", larghezza: 1.5 },
                { testo: "Citazioni", larghezza: 0.8, num: true },
                { testo: "Quota", larghezza: 0.6, num: true },
                { testo: "Ci sei", larghezza: 0.6, num: true },
                { testo: "Concorrenti (su 5)", larghezza: 1, num: true },
              ]}
              righe={r.fonti.map((f) => [f.nome, String(f.citazioni), pct(f.citazioni, totale), f.ciSei ? "Sì" : "No", f.concorrentiPresenti !== undefined ? String(f.concorrentiPresenti) : "–"])}
            />
            <Text style={[s.nota, { marginTop: 4 }]}>Ci sei: l&apos;attività ha una scheda o una pagina su quella fonte. Dove è «No», gli assistenti non possono trovarla lì. Il sito dell&apos;attività pesa più di ogni directory nelle domande sul nome (Insites, 2026).</Text>
          </View>
          <View style={s.col}>
            {gratuito ? (
              <View style={[s.riquadro, { marginTop: 14 }]}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: C.accent }}>6.2 Terminologia: nel piano Base</Text>
                <Text style={[s.nota, { marginTop: 3 }]}>I termini più usati dagli assistenti quando consigliano nella categoria, e se compaiono già nelle recensioni e sul sito dell&apos;attività.</Text>
              </View>
            ) : (
              <>
                <Text style={[s.h3, { marginTop: 0 }]}>6.2 Terminologia ricorrente</Text>
                {r.termini.find((t) => !t.ceLHai) && (
                  <Text style={[s.lettura, { fontSize: 8.5 }]}>
                    «{r.termini.find((t) => !t.ceLHai)!.termine}»: {r.termini.find((t) => !t.ceLHai)!.volte} volte nelle risposte, {r.termini.find((t) => !t.ceLHai)!.volteTue ?? 0} nelle tue recensioni.
                  </Text>
                )}
                <Tabella
                  colonne={[
                    { testo: "Termine", larghezza: 1.8 },
                    { testo: "Nelle risposte", larghezza: 0.9, num: true },
                    { testo: "Nelle tue recensioni", larghezza: 1.1, num: true },
                  ]}
                  righe={r.termini.map((t) => [t.termine, String(t.volte), t.volteTue !== undefined ? String(t.volteTue) : t.ceLHai ? "Sì" : "No"])}
                />
                <Text style={[s.nota, { marginTop: 4 }]}>Occorrenze nelle {totale} risposte della categoria, e quante volte il termine compare nelle recensioni Google dell&apos;attività.</Text>
              </>
            )}
          </View>
        </View>
        <Pie r={r} />
      </Page>

      {/* Pagina 4: descrizioni, errori, metodo */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />
        <Text style={[s.h2, { marginTop: 0 }]}>7. Cosa dicono di te</Text>
        <Text style={s.lettura}>
          {dc.n ? `Dati corretti in ${dc.k} assistenti su ${dc.n}; ` : ""}
          {r.errori.length} {r.errori.length === 1 ? "errore" : "errori"}; {critici.length ? `tono critico su ${critici.map((d) => nomeMotore(d.motore)).join(", ")}` : "nessuna descrizione critica"}.
        </Text>
        <Tabella
          colonne={[
            { testo: "Assistente", larghezza: 0.8 },
            { testo: "Descrizione restituita alla domanda sul nome", larghezza: 3.6 },
            { testo: "Tono", larghezza: 0.6 },
            { testo: "Dati", larghezza: 0.6 },
          ]}
          righe={r.descrizioniPerMotore.map((d) => [nomeMotore(d.motore), d.testo, d.tono ? maiuscola(d.tono) : "–", d.datiCorretti === undefined ? "–" : d.datiCorretti ? "Corretti" : "Da correggere"])}
        />
        <Text style={s.h3}>7.1 Errori rilevati nei dati</Text>
        {r.errori.length > 0 ? (
          <Tabella
            colonne={[
              { testo: "Tipo", larghezza: 0.8 },
              { testo: "Assistente", larghezza: 0.8 },
              { testo: "Dettaglio", larghezza: 3.2 },
            ]}
            righe={r.errori.map((e) => [maiuscola(e.tipo), nomeMotore(e.motore), e.testo])}
          />
        ) : (
          <Text style={s.p}>Nessun errore rilevato.</Text>
        )}
        <Text style={[s.nota, { marginTop: 4 }]}>Il tono è segnalato solo quando è critico: negli studi di settore è positivo per quasi tutte le attività e un punteggio di sentiment non direbbe cosa fare. Un errore si corregge alla fonte da cui l&apos;assistente l&apos;ha preso.</Text>

        <Text style={s.h2}>Allegato A. Metodo e dati della scansione</Text>
        <View style={[s.colonne, { marginBottom: 4 }]}>
          <View style={s.col}>
            <Chiavi
              voci={[
                ["Identificativo", docId(r)],
                ["Scansione", periodo(r.metodo.inizio, r.metodo.fine)],
                ["Posizione, lingua, canale", `${r.metodo.posizione}; ${r.metodo.lingua}${r.metodo.canale ? `; ${r.metodo.canale}` : ""}`],
                ["Piano e metodo", `${gratuito ? "Test gratuito" : maiuscola(r.piano)} · v1.1 · pesi Audicom/Comscore, luglio 2026`],
              ]}
            />
          </View>
          <View style={s.col}>
            <Chiavi
              voci={[
                ["Assistenti e pesi", r.motori.map((m) => `${nomeMotore(m)} ${pct(motore(m)?.peso ?? 0, 1)}`).join(", ")],
                ["Domande", `${r.domande} (${r.perTipo.map((t) => `${t.domande} ${NOME_TIPO[t.tipo].toLowerCase()}`).join(", ")})`],
                ["Risposte analizzate", `${totale} (${r.domande} × ${r.motori.length} × ${r.ripetizioni}); ${spont} alle ${r.domandeSpontanee} domande spontanee`],
              ]}
            />
          </View>
        </View>
        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={[s.h3, { marginTop: 0 }]}>A.1 Raccolta e riconoscimento</Text>
            <Text style={[s.p, { fontSize: 8.5 }]}>
              Ogni domanda è stata posta {r.ripetizioni} volte a ciascun assistente tramite le interfacce ufficiali, con posizione impostata su «{r.metodo.posizione}»; di ogni risposta sono registrati testo, ordine dei nomi citati e fonti consultate. L&apos;attività risulta citata quando nome, indirizzo o telefono coincidono con la scheda Google Business Profile; i concorrenti sono le attività della stessa categoria citate nelle risposte, aggregate per nome e indirizzo.
            </Text>
            <Text style={s.h3}>A.2 Punteggio e quota di voce</Text>
            <Text style={[s.p, { fontSize: 8.5 }]}>Solo sulle domande spontanee, quelle senza il nome dell&apos;attività. Per ogni assistente: media del peso della posizione sulle sue risposte (1° = 1,00 · 2° = 0,85 · 3° = 0,70 · 4° = 0,55 · 5° = 0,40 · assente = 0); punteggio = media di questi valori pesata per la quota d&apos;uso degli assistenti, su scala 0–100. Quota di voce = citazioni dell&apos;attività su tutte le citazioni di attività nelle stesse risposte.</Text>
          </View>
          <View style={s.col}>
            <Text style={[s.h3, { marginTop: 0 }]}>A.3 Note e limiti</Text>
            {r.metodo.note.map((nota) => (
              <Text key={nota} style={[s.p, { fontSize: 8.5 }]}>
                – {nota}
              </Text>
            ))}
            <Text style={[s.p, { fontSize: 8.5 }]}>– Le interfacce ufficiali possono differire dalle app: lo scarto è misurato ogni trimestre su un campione di domande e pubblicato.</Text>
            <Text style={[s.p, { fontSize: 8.5 }]}>– Nessuna previsione: le risposte degli assistenti non hanno una base statistica che le renda prevedibili.</Text>
            <Text style={[s.p, { fontSize: 8.5 }]}>– Le azioni (sezione 2) sono scelte tra quelle previste per la categoria, in ordine di impatto atteso; i punti stimati si verificano alla scansione successiva.</Text>
          </View>
        </View>
        <Pie r={r} />
      </Page>

      {/* Pagina 5: riferimenti esterni e definizioni */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />
        <Text style={[s.h2, { marginTop: 0 }]}>Allegato B. Riferimenti esterni</Text>
        <Text style={[s.nota, { marginBottom: 5 }]}>Quanto è normale non comparire, secondo gli studi di settore. Servono a leggere il numero di questo report, non a sostituirlo.</Text>
        <Tabella
          colonne={[
            { testo: "Dato", larghezza: 3.4 },
            { testo: "Fonte", larghezza: 1.5 },
            { testo: "Campione", larghezza: 1.1 },
          ]}
          righe={RIFERIMENTI.map((x) => [x.dato, `${x.fonte}, ${x.anno}`, x.campione])}
        />
        <Text style={s.h2}>Allegato C. Definizioni</Text>
        <Text style={[s.nota, { marginBottom: 5 }]}>Per ogni metrica del report, cos&apos;è. Nessun numero è stimato senza campione: tutto si ricava dalla mappa domanda × assistente. Formule e «come si legge» sono nelle note tecniche del report online.</Text>
        <View style={s.colonne}>
          {[GLOSSARIO.slice(0, Math.ceil(GLOSSARIO.length / 2)), GLOSSARIO.slice(Math.ceil(GLOSSARIO.length / 2))].map((colonna, i) => (
            <View key={i} style={s.col}>
              {colonna.map((v) => (
                <View key={v.id} style={{ marginBottom: 3, paddingBottom: 2.5, borderBottomWidth: 0.5, borderBottomColor: C.lineSoft }} wrap={false}>
                  <Text style={[s.p, { fontSize: 8, lineHeight: 1.35 }]}>
                    <Text style={{ fontFamily: "Helvetica-Bold" }}>{v.nome}. </Text>
                    {v.cosa}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <Text style={[s.nota, { marginTop: 8 }]}>
          Funziona con ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok; non siamo affiliati a OpenAI, Google, Anthropic, Perplexity o xAI. I marchi citati appartengono ai rispettivi proprietari.
        </Text>
        <Pie r={r} />
      </Page>
    </Document>
  );
}
