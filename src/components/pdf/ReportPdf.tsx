import { Document, Page, Text, View, StyleSheet, Font, Svg, Rect, Circle, Path } from "@react-pdf/renderer";
import type { Report, TipoDomanda, Verdetto } from "@/lib/types";
import { ENGINES } from "@/lib/engines";
import { distribuzionePosizioni } from "@/components/report/Posizioni";

/**
 * Il report in PDF: un rapporto tecnico. Intestazione con il marchio e
 * l'identificativo del documento, sezioni numerate, tabelle con righe,
 * numeri tabellari, metodo in allegato. Un solo colore, come il sito.
 * In white-label `logo` è il nome dell'agenzia al posto del nostro.
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
  entrambi: "#7fa99a",
};

const POS: Record<1 | 2 | 3 | 4 | 5, string> = { 1: "#0a4537", 2: "#0e5a47", 3: "#3f7f6b", 4: "#7fa99a", 5: "#b7d1c7" };
const PESO_POSIZIONE = [1, 0.85, 0.7, 0.55, 0.4];

const NOME_TIPO: Record<TipoDomanda, string> = {
  generica: "Generica",
  bisogno: "Per bisogno",
  specialita: "Per specialità",
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
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 0.75, borderBottomColor: C.ink },
  h3: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 },
  p: { fontSize: 9, lineHeight: 1.45 },
  nota: { fontSize: 7.5, color: C.muted, lineHeight: 1.35 },
  riga: { flexDirection: "row", alignItems: "center" },
  colonne: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  th: { flexDirection: "row", backgroundColor: C.soft, borderBottomWidth: 0.75, borderBottomColor: C.ink, paddingVertical: 3, paddingHorizontal: 4 },
  thTesto: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.ink },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.lineSoft, paddingVertical: 3, paddingHorizontal: 4, alignItems: "center" },
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
  cella: { height: 16, alignItems: "center", justifyContent: "center", borderRightWidth: 0.5, borderRightColor: "#ffffff" },
  riquadro: { borderWidth: 0.5, borderColor: C.accent, padding: 8 },
});

const nomeMotore = (id: string) => ENGINES.find((e) => e.id === id)?.nome ?? id;
const motore = (id: string) => ENGINES.find((e) => e.id === id);
const dataIt = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
const dataLunga = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
const oraIt = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");
const n1 = (x: number) => x.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const n2 = (x: number) => x.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const maiuscola = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const volteDi = (c: { posizione: number | null; volte?: number; frequenza: string }) => (c.posizione === null ? 0 : (c.volte ?? Number(c.frequenza.split(" ")[0])));

function coloreVerdetto(v: Verdetto) {
  if (v === "Invisibile") return C.danger;
  if (v === "Poco visibile") return C.warn;
  return C.accent;
}

/** Identificativo del documento: VAI-AAAAMMGG-ID. */
function docId(r: Report) {
  return `VAI-${r.data.replaceAll("-", "")}-${r.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
}

/** Posizione media quando compari, pesata per quante volte. */
function posizioneMedia(celle: { posizione: number | null; volte?: number; frequenza: string }[]) {
  let somma = 0;
  let n = 0;
  for (const c of celle) {
    const v = volteDi(c);
    if (!v || c.posizione === null) continue;
    somma += c.posizione * v;
    n += v;
  }
  return n ? somma / n : null;
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
        <Text style={[s.mono, { marginTop: 2 }]}>Report di visibilità AI · metodo v1.0</Text>
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

function Scala({ punteggio }: { punteggio: number }) {
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
            {p.testo && (p.v / totale) * 100 >= 9 && <Text style={{ fontSize: 6.5, fontFamily: "Helvetica-Bold", color: p.chiaro ? C.ink : "#fff", lineHeight: 1 }}>{p.testo}</Text>}
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
  const col = coloreVerdetto(r.verdetto);
  const dist = distribuzionePosizioni(r.righe);
  const distTot = Object.values(dist).reduce((a, b) => a + b, 0);
  const tue = r.concorrenti.find((c) => c.seiTu);
  const tueCitazioni = tue?.citazioni ?? 0;
  const domandeInCuiCompari = r.righe.filter((x) => x.celle.some((c) => c.posizione !== null)).length;
  const posMedia = posizioneMedia(r.righe.flatMap((x) => x.celle));
  const gratuito = r.piano === "gratuito";
  const durata = Math.max(0, Math.round((new Date(r.metodo.fine).getTime() - new Date(r.metodo.inizio).getTime()) / 1000));
  const indiceTuo = r.concorrenti.findIndex((c) => c.seiTu);
  const testa = (nome: string) => r.testaATesta.find((t) => t.nome === nome);
  const guadagno = r.azioni.reduce((acc, a) => acc + (a.impattoStimato ?? 0), 0);
  const potenziale = guadagno > 0 ? Math.min(100, r.punteggio + guadagno) : null;

  const sezioni = [
    "1. Sintesi dei risultati",
    "2. Visibilità per assistente e per tipo di domanda",
    "3. Concorrenti citati e confronto diretto",
    "4. Mappa domanda × assistente",
    gratuito ? "5. Fonti citate" : "5. Fonti citate e terminologia",
    "6. Descrizione dell'attività secondo gli assistenti",
    "7. Azioni consigliate",
    "Allegato A. Metodo e limiti",
    "Allegato B. Elenco delle domande",
  ];

  return (
    <Document title={`${docId(r)} – ${r.attivita.nome}, ${r.attivita.citta}`} author={logo ?? "Visibilità AI"} subject="Report di visibilità AI" language="it">
      {/* Pagina 1: frontespizio e sintesi */}
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

        <View style={[s.colonne, { marginTop: 14 }]}>
          <View style={s.col}>
            <Chiavi
              voci={[
                ["Identificativo", docId(r)],
                ["Data scansione", `${dataLunga(r.metodo.inizio)}, ${oraIt(r.metodo.inizio)}–${oraIt(r.metodo.fine)} (${Math.floor(durata / 60)} min ${durata % 60} s)`],
                ["Posizione impostata", r.metodo.posizione],
                ["Lingua", r.metodo.lingua],
                ["Piano", gratuito ? "Test gratuito" : maiuscola(r.piano)],
              ]}
            />
          </View>
          <View style={s.col}>
            <Chiavi
              voci={[
                ["Assistenti interrogati", `${r.motori.length}: ${r.motori.map(nomeMotore).join(", ")}`],
                ["Domande", String(r.domande)],
                ["Ripetizioni per domanda", String(r.ripetizioni)],
                ["Risposte analizzate", `${totale} (${r.domande} × ${r.motori.length} × ${r.ripetizioni})`],
                ["Metodo", "v1.0 · pesi Audicom/Comscore, luglio 2026"],
              ]}
            />
          </View>
        </View>

        <View style={[s.riga, { marginTop: 14, gap: 6 }]}>
          {[
            [String(r.punteggio), "Punteggio di visibilità AI (0–100)"],
            [r.verdetto, "Verdetto"],
            [`${tueCitazioni} / ${totale}`, "Risposte in cui compari"],
            [`${domandeInCuiCompari} / ${r.domande}`, "Domande in cui compari"],
            [posMedia ? `${n1(posMedia)}°` : "–", "Posizione media quando compari"],
          ].map(([n, t], i) => (
            <View key={t} style={s.kpi}>
              <Text style={[s.kpiNumero, i <= 1 ? { color: col } : {}, i === 1 ? { fontSize: 11, marginTop: 4 } : {}]}>{n}</Text>
              <Text style={s.kpiTesto}>{t}</Text>
            </View>
          ))}
        </View>

        <Text style={s.h2}>1. Sintesi dei risultati</Text>
        <View style={s.colonne}>
          <View style={[s.col, { flex: 0.9 }]}>
            <View style={[s.riga, { alignItems: "flex-end", gap: 10 }]}>
              <Text style={[s.punteggio, { color: col }]}>{r.punteggio}</Text>
              <View style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: col }}>{r.verdetto}</Text>
                <Text style={s.nota}>su 100</Text>
              </View>
            </View>
            <Scala punteggio={r.punteggio} />
            {r.contesto && (
              <Text style={[s.p, { marginTop: 6, fontSize: 8.5 }]}>
                Contesto: su {r.contesto.attivitaAnalizzate} {r.contesto.categoria} analizzate a {r.contesto.citta} la mediana è {r.contesto.mediana}; questo punteggio è più alto del {r.contesto.percentile}% di loro.
              </Text>
            )}
            {potenziale !== null && (
              <View style={{ marginTop: 6 }}>
                <View style={[s.riga, { justifyContent: "space-between", marginBottom: 2 }]}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>Stima con le azioni della sezione 7</Text>
                  <Text style={{ fontSize: 8.5 }}>
                    {r.punteggio} → <Text style={{ fontFamily: "Helvetica-Bold", color: C.accent }}>{potenziale}</Text>
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
            <Text style={[s.nota, { marginTop: 5 }]}>
              Punteggio = media, pesata per quota d&apos;uso di ogni assistente, del peso della posizione in cui compari (1° = 1,00 · 2° = 0,85 · 3° = 0,70 · 4° = 0,55 · 5° = 0,40 · assente = 0). Dettagli in Allegato A.
            </Text>
          </View>
          <View style={[s.col, { flex: 1.1 }]}>
            {gratuito ? (
              <View style={s.riquadro}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: C.accent }}>1.1 Sintesi scritta: disponibile nel piano Base</Text>
                <Text style={[s.nota, { marginTop: 3 }]}>Nel piano Base il report include la sintesi in breve scritta dai dati, la terminologia usata dagli assistenti, 15 domande e 3 ripetizioni, scansione mensile e andamento del punteggio.</Text>
              </View>
            ) : (
              <>
                <Text style={[s.h3, { marginTop: 0 }]}>1.1 In breve</Text>
                <Text style={s.p}>{r.sintesi}</Text>
              </>
            )}
          </View>
        </View>

        {distTot > 0 && (
          <>
            <Text style={s.h3}>1.2 Distribuzione delle posizioni quando compari</Text>
            <Segmenti totale={distTot} parti={([1, 2, 3, 4, 5] as const).map((p) => ({ v: dist[p], colore: POS[p], testo: `${p}°`, chiaro: p >= 4 }))} />
            <Text style={[s.nota, { marginTop: 3 }]}>
              {([1, 2, 3, 4, 5] as const)
                .filter((p) => dist[p] > 0)
                .map((p) => `${p}° posto: ${dist[p]} risposte (${pct(dist[p], distTot)}, peso ${n2(PESO_POSIZIONE[p - 1])})`)
                .join(" · ")}
              . Totale {distTot} risposte in cui compari.
            </Text>
          </>
        )}

        <Text style={s.h3}>Indice</Text>
        {sezioni.map((x) => (
          <Text key={x} style={[s.p, { fontSize: 8.5, lineHeight: 1.5 }]}>
            {x}
          </Text>
        ))}
        <Pie r={r} />
      </Page>

      {/* Pagina 2: assistenti, tipi, concorrenti */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />
        <Text style={[s.h2, { marginTop: 0 }]}>2. Visibilità per assistente e per tipo di domanda</Text>
        <Text style={[s.h3, { marginTop: 4 }]}>2.1 Per assistente</Text>
        <Tabella
          colonne={[
            { testo: "Assistente", larghezza: 1.2 },
            { testo: "Utenti in Italia (mln)", larghezza: 1, num: true },
            { testo: "Peso", larghezza: 0.6, num: true },
            { testo: `Domande in cui compari (su ${r.domande})`, larghezza: 1.3, num: true },
            { testo: `Risposte in cui compari (su ${r.domande * r.ripetizioni})`, larghezza: 1.4, num: true },
            { testo: "Posizione media", larghezza: 0.9, num: true },
            { testo: "", larghezza: 1.3 },
          ]}
          righe={r.perMotore.map((m) => {
            const celle = r.righe.map((x) => x.celle.find((c) => c.motore === m.motore)!);
            const risposte = celle.reduce((acc, c) => acc + volteDi(c), 0);
            const pm = posizioneMedia(celle);
            const e = motore(m.motore);
            return [nomeMotore(m.motore), e ? n1(e.utentiMln) : "–", e ? pct(e.peso, 1) : "–", String(m.comparse), String(risposte), pm ? `${n1(pm)}°` : "–", <BarraCella key={m.motore} valore={m.comparse} massimo={m.totale} />];
          })}
        />
        <Text style={[s.nota, { marginTop: 4 }]}>
          Assistenti in ordine di quota d&apos;uso in Italia; peso rinormalizzato sugli assistenti interrogati. Fonte utenti: Osservatorio Cosenza su dati Audicom, luglio 2026; per Google AI, Sensemakers su dati Comscore.
        </Text>

        <Text style={s.h3}>2.2 Per tipo di domanda</Text>
        <Tabella
          colonne={[
            { testo: "Tipo di domanda", larghezza: 1.4 },
            { testo: "Domande", larghezza: 0.8, num: true },
            { testo: "Risposte analizzate", larghezza: 1, num: true },
            { testo: "Risposte in cui compari", larghezza: 1.1, num: true },
            { testo: "Quota", larghezza: 0.8, num: true },
            { testo: "", larghezza: 1.6 },
          ]}
          righe={r.perTipo.map((t) => [NOME_TIPO[t.tipo], String(t.domande), String(t.totale), String(t.comparse), pct(t.comparse, t.totale), <BarraCella key={t.tipo} valore={t.comparse} massimo={t.totale} />])}
        />
        <Text style={[s.nota, { marginTop: 4 }]}>Generica: «miglior pizzeria a Bergamo». Per bisogno: orario, prezzo, servizio. Per specialità: un piatto o una lavorazione. Sul nome: cosa dice l&apos;assistente quando gli chiedi direttamente dell&apos;attività.</Text>

        <Text style={s.h2}>3. Concorrenti citati e confronto diretto</Text>
        <Tabella
          colonne={[
            { testo: "#", larghezza: 0.3 },
            { testo: "Attività", larghezza: 2 },
            { testo: `Citazioni (su ${totale})`, larghezza: 1, num: true },
            { testo: "Quota", larghezza: 0.7, num: true },
            { testo: "Domande: solo lui", larghezza: 0.9, num: true },
            { testo: "Entrambi", larghezza: 0.8, num: true },
            { testo: "Solo tu", larghezza: 0.7, num: true },
            { testo: "", larghezza: 1.3 },
          ]}
          evidenzia={indiceTuo}
          righe={r.concorrenti.map((c, i) => {
            const t = c.seiTu ? undefined : testa(c.nome);
            return [String(i + 1), c.seiTu ? `${c.nome} (questa attività)` : c.nome, String(c.citazioni), pct(c.citazioni, c.totale), t ? String(t.loroSenzaTe) : "–", t ? String(t.entrambi) : "–", t ? String(t.tuSenzaLoro) : "–", <BarraCella key={c.nome} valore={c.citazioni} massimo={r.concorrenti[0]?.totale ?? 1} pieno={Boolean(c.seiTu)} />];
          })}
        />
        <Text style={[s.nota, { marginTop: 4 }]}>
          «Solo lui»: domande, su {r.domande}, in cui il concorrente compare e questa attività no; «Entrambi» e «Solo tu» a specchio. I concorrenti seguiti nel confronto diretto sono i tre più citati.
        </Text>

        {r.citaChi.length > 0 && (
          <>
            <Text style={s.h3}>3.1 Chi cita chi: domande (su {r.domande}) in cui ogni assistente cita l&apos;attività</Text>
            <Tabella
              colonne={[{ testo: "Attività", larghezza: 2 }, ...r.motori.map((m) => ({ testo: nomeMotore(m), larghezza: 0.8, num: true }))]}
              evidenzia={r.citaChi.findIndex((c) => c.seiTu)}
              righe={r.citaChi.map((c) => [c.seiTu ? `${c.nome} (questa attività)` : c.nome, ...r.motori.map((m) => String(c.perMotore[m] ?? 0))])}
            />
          </>
        )}
        <Pie r={r} />
      </Page>

      {/* Pagina 3: mappa, fonti, terminologia */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />
        <Text style={[s.h2, { marginTop: 0 }]}>4. Mappa domanda × assistente</Text>
        <Text style={[s.nota, { marginBottom: 6 }]}>Ogni cella è una domanda posta a un assistente: posizione media in cui compari e quante volte su {r.ripetizioni}. Più scura la cella, più in alto ti mettono. Vuota: non compari.</Text>
        <View style={s.th}>
          <Text style={[s.thTesto, { width: 16 }]}>#</Text>
          <Text style={[s.thTesto, { flex: 2.3 }]}>Domanda</Text>
          <Text style={[s.thTesto, { flex: 0.9 }]}>Tipo</Text>
          {r.motori.map((m) => (
            <Text key={m} style={[s.thTesto, { flex: 0.8, textAlign: "center" }]}>
              {nomeMotore(m)}
            </Text>
          ))}
          <Text style={[s.thTesto, { flex: 0.7, textAlign: "right" }]}>Compari</Text>
        </View>
        {r.righe.map((riga, i) => {
          const compari = riga.celle.reduce((acc, c) => acc + volteDi(c), 0);
          return (
            <View key={riga.domanda.id} style={[s.tr, { paddingVertical: 1.5 }]} wrap={false}>
              <Text style={[s.td, { width: 16, color: C.muted }]}>{i + 1}</Text>
              <Text style={[s.td, { flex: 2.3, paddingRight: 4 }]}>{riga.domanda.testo}</Text>
              <Text style={[s.td, { flex: 0.9, color: C.muted, fontSize: 7.5 }]}>{NOME_TIPO[riga.domanda.tipo]}</Text>
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
              <Text style={[s.tdNum, { flex: 0.7 }]}>
                {compari}/{r.motori.length * r.ripetizioni}
              </Text>
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

        <Text style={s.h2}>{gratuito ? "5. Fonti citate" : "5. Fonti citate e terminologia"}</Text>
        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={[s.h3, { marginTop: 0 }]}>5.1 Fonti citate dagli assistenti</Text>
            <Tabella
              colonne={[
                { testo: "Fonte", larghezza: 1.5 },
                { testo: "Citazioni", larghezza: 0.8, num: true },
                { testo: "Quota", larghezza: 0.6, num: true },
                { testo: "Presenza", larghezza: 0.8, num: true },
                { testo: "Concorrenti presenti (su 5)", larghezza: 1.1, num: true },
              ]}
              righe={r.fonti.map((f) => [f.nome, String(f.citazioni), pct(f.citazioni, totale), f.ciSei ? "Sì" : "No", f.concorrentiPresenti !== undefined ? String(f.concorrentiPresenti) : "–"])}
            />
            <Text style={[s.nota, { marginTop: 4 }]}>Presenza: l&apos;attività ha una scheda o una pagina su quella fonte. Dove è «No», gli assistenti non possono trovarla lì.</Text>
          </View>
          <View style={s.col}>
            {gratuito ? (
              <View style={[s.riquadro, { marginTop: 14 }]}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: C.accent }}>5.2 Terminologia: disponibile nel piano Base</Text>
                <Text style={[s.nota, { marginTop: 3 }]}>I termini più usati dagli assistenti quando consigliano nella categoria, e se compaiono già nelle recensioni e sul sito dell&apos;attività.</Text>
              </View>
            ) : (
              <>
                <Text style={[s.h3, { marginTop: 0 }]}>5.2 Terminologia ricorrente</Text>
                <Tabella
                  colonne={[
                    { testo: "Termine", larghezza: 1.8 },
                    { testo: "Occorrenze", larghezza: 0.9, num: true },
                    { testo: "Nelle tue recensioni", larghezza: 1.1, num: true },
                  ]}
                  righe={r.termini.map((t) => [t.termine, String(t.volte), t.volteTue !== undefined ? String(t.volteTue) : t.ceLHai ? "Sì" : "No"])}
                />
                <Text style={[s.nota, { marginTop: 4 }]}>Occorrenze nelle {totale} risposte, e quante volte il termine compare nelle recensioni Google dell&apos;attività.</Text>
              </>
            )}
          </View>
        </View>
        <Pie r={r} />
      </Page>

      {/* Pagina 4: descrizioni, azioni, allegati */}
      <Page size="A4" style={s.page}>
        <Testata r={r} logo={logo} />
        <Text style={[s.h2, { marginTop: 0 }]}>6. Descrizione dell&apos;attività secondo gli assistenti</Text>
        <Tabella
          colonne={[
            { testo: "Assistente", larghezza: 0.8 },
            { testo: "Descrizione restituita alla domanda sul nome", larghezza: 4 },
          ]}
          righe={r.descrizioniPerMotore.map((d) => [nomeMotore(d.motore), d.testo])}
        />
        <Text style={s.h3}>6.1 Errori rilevati nei dati</Text>
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

        <Text style={s.h2}>7. Azioni consigliate</Text>
        <Tabella
          colonne={[
            { testo: "Priorità", larghezza: 0.5 },
            { testo: "Azione", larghezza: 2 },
            { testo: "Dato di riferimento", larghezza: 2.6 },
            { testo: "Impatto atteso", larghezza: 0.8 },
            { testo: "Punti stimati", larghezza: 0.7, num: true },
          ]}
          righe={r.azioni.map((a, i) => [String(i + 1), a.titolo, a.dato, maiuscola(a.impatto), a.impattoStimato !== undefined ? `+${a.impattoStimato}` : "–"])}
        />
        <Text style={[s.nota, { marginTop: 4 }]}>Le azioni sono scelte tra quelle previste per la categoria dell&apos;attività e ordinate per impatto atteso. I punti stimati sono una stima dai dati di questo report{potenziale !== null ? ` (punteggio stimato dopo le azioni: ${potenziale})` : ""}; la verifica avviene alla scansione successiva.</Text>

        <Text style={[s.h2, { marginTop: 0 }]} break>
          Allegato A. Metodo e limiti
        </Text>
        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={[s.h3, { marginTop: 0 }]}>A.1 Raccolta</Text>
            <Text style={s.p}>
              Ogni domanda è stata posta {r.ripetizioni} volte a ciascun assistente tramite le interfacce ufficiali, con posizione impostata su «{r.metodo.posizione}» e lingua {r.metodo.lingua}, tra le {oraIt(r.metodo.inizio)} e le {oraIt(r.metodo.fine)} del {dataLunga(r.metodo.inizio)}.
            </Text>
            <Text style={s.h3}>A.2 Riconoscimento</Text>
            <Text style={s.p}>L&apos;attività risulta citata quando nome, indirizzo o telefono coincidono con la scheda Google Business Profile. I concorrenti sono le attività della stessa categoria citate nelle risposte, aggregate per nome e indirizzo.</Text>
            <Text style={s.h3}>A.3 Punteggio</Text>
            <Text style={s.p}>Per ogni assistente si calcola la media del peso della posizione su tutte le sue risposte (1° = 1,00 · 2° = 0,85 · 3° = 0,70 · 4° = 0,55 · 5° = 0,40 · assente = 0). Il punteggio è la media di questi valori pesata per la quota d&apos;uso degli assistenti interrogati, su scala 0–100.</Text>
          </View>
          <View style={s.col}>
            <Text style={[s.h3, { marginTop: 0 }]}>A.4 Pesi degli assistenti</Text>
            <Tabella
              colonne={[
                { testo: "Assistente", larghezza: 1.4 },
                { testo: "Utenti IT (mln)", larghezza: 1, num: true },
                { testo: "Peso", larghezza: 0.8, num: true },
              ]}
              righe={r.motori.map((m) => {
                const e = motore(m);
                return [nomeMotore(m), e ? n1(e.utentiMln) : "–", e ? pct(e.peso, 1) : "–"];
              })}
            />
            <Text style={s.h3}>A.5 Limiti</Text>
            {r.metodo.note.map((nota) => (
              <Text key={nota} style={[s.p, { fontSize: 8.5 }]}>
                – {nota}
              </Text>
            ))}
            <Text style={[s.p, { fontSize: 8.5 }]}>– Le interfacce ufficiali possono differire dalle app: lo scarto è misurato ogni trimestre su un campione di domande.</Text>
          </View>
        </View>

        <Text style={s.h2}>Allegato B. Elenco delle domande</Text>
        <Tabella
          colonne={[
            { testo: "#", larghezza: 0.3 },
            { testo: "Domanda", larghezza: 3.5 },
            { testo: "Tipo", larghezza: 1 },
          ]}
          righe={r.righe.map((x, i) => [String(i + 1), x.domanda.testo, NOME_TIPO[x.domanda.tipo]])}
        />
        <Text style={[s.nota, { marginTop: 10 }]}>
          Funziona con ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok; non siamo affiliati a OpenAI, Google, Anthropic, Perplexity o xAI. I marchi citati appartengono ai rispettivi proprietari.
        </Text>
        <Pie r={r} />
      </Page>
    </Document>
  );
}
