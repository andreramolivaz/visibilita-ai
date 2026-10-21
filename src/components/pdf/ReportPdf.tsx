import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { Report, TipoDomanda, Verdetto } from "@/lib/types";
import { ENGINES } from "@/lib/engines";
import { distribuzionePosizioni } from "@/components/report/Posizioni";

/**
 * Il report in PDF, stesso stile del sito: un colore, barre orizzontali,
 * mappa domanda × assistente, verdetti a semaforo.
 * In white-label `logo` sostituisce il marchio.
 */

const C = {
  ink: "#14201c",
  muted: "#5b6661",
  faint: "#8a938f",
  line: "#e4e8e6",
  soft: "#f3f5f4",
  accent: "#0e5a47",
  accentSoft: "#e2f0eb",
  danger: "#b3261e",
  dangerSoft: "#fbeae8",
  warn: "#9a6400",
  grey: "#b9c2be",
  entrambi: "#7fa99a",
};

// Niente sillabazione: "Berg-amo" in un report non si può vedere.
Font.registerHyphenationCallback((parola) => [parola]);

const POS: Record<1 | 2 | 3 | 4 | 5, string> = { 1: "#0a4537", 2: "#0e5a47", 3: "#3f7f6b", 4: "#7fa99a", 5: "#b7d1c7" };

const NOME_TIPO: Record<TipoDomanda, string> = {
  generica: "Domande generiche",
  bisogno: "Domande per bisogno",
  specialita: "Domande per specialità",
  nome: "Domanda sul tuo nome",
};

const s = StyleSheet.create({
  page: { padding: 36, paddingBottom: 46, fontFamily: "Helvetica", fontSize: 9.5, color: C.ink, lineHeight: 1.4 },
  marchio: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  marchioTesto: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  piccolo: { fontSize: 8, color: C.muted },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 2, marginBottom: 4, letterSpacing: -0.3, lineHeight: 1.2 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 5, paddingTop: 9, borderTopWidth: 1, borderTopColor: C.line },
  h3: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  riga: { flexDirection: "row", alignItems: "center" },
  colonne: { flexDirection: "row", gap: 20 },
  col: { flex: 1 },
  punteggio: { fontSize: 52, fontFamily: "Helvetica-Bold", letterSpacing: -2, lineHeight: 1.05 },
  verdetto: { fontSize: 15, fontFamily: "Helvetica-Bold", lineHeight: 1.2, marginBottom: 2 },
  barraRiga: { marginBottom: 4 },
  barraTesto: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  barraSfondo: { height: 5, backgroundColor: C.soft, borderRadius: 3 },
  barra: { height: 5, borderRadius: 3 },
  etichetta: { fontSize: 7.5, fontFamily: "Helvetica-Bold", paddingHorizontal: 4, paddingVertical: 1.5, borderRadius: 3 },
  azione: { flexDirection: "row", marginBottom: 6 },
  numero: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: C.accent, color: "#fff", fontSize: 8.5, fontFamily: "Helvetica-Bold", textAlign: "center", lineHeight: 1, paddingTop: 3.5, marginRight: 7 },
  kpi: { flex: 1, borderLeftWidth: 2, borderLeftColor: C.line, paddingLeft: 6 },
  kpiNumero: { fontSize: 16, fontFamily: "Helvetica-Bold", lineHeight: 1.1 },
  cella: { flex: 1, height: 18, borderRadius: 3, alignItems: "center", justifyContent: "center", marginLeft: 2 },
  cellaTesto: { fontSize: 7.5, fontFamily: "Helvetica-Bold", lineHeight: 1 },
  cellaSotto: { fontSize: 5.5, lineHeight: 1, marginTop: 1.5, opacity: 0.85 },
  pie: { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: C.faint },
});

const nomeMotore = (id: string) => ENGINES.find((e) => e.id === id)?.nome ?? id;
const dataIt = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
const oraIt = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

function coloreVerdetto(v: Verdetto) {
  if (v === "Invisibile") return C.danger;
  if (v === "Poco visibile") return C.warn;
  return C.accent;
}

function Barra({ etichetta, valore, massimo, testo, pieno, stato }: { etichetta: string; valore: number; massimo: number; testo: string; pieno?: boolean; stato?: { testo: string; ok: boolean } }) {
  const pct = massimo > 0 ? Math.max(0, Math.min(100, (valore / massimo) * 100)) : 0;
  return (
    <View style={s.barraRiga}>
      <View style={s.barraTesto}>
        <Text style={pieno && !stato ? { fontFamily: "Helvetica-Bold", color: C.accent } : undefined}>{etichetta}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ color: C.muted }}>{testo}</Text>
          {stato && (
            <Text style={[s.etichetta, stato.ok ? { backgroundColor: C.accentSoft, color: C.accent } : { backgroundColor: C.dangerSoft, color: C.danger }]}>{stato.testo}</Text>
          )}
        </View>
      </View>
      <View style={s.barraSfondo}>
        <View style={[s.barra, { width: `${pct}%`, backgroundColor: pieno ? C.accent : C.grey }]} />
      </View>
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
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden" }}>
        {fasce.map((f) => (
          <View key={f.nome} style={{ width: `${f.a - f.da + (f.da ? 1 : 0)}%`, backgroundColor: f.colore, opacity: punteggio >= f.da ? 1 : 0.25 }} />
        ))}
      </View>
      <View style={{ position: "relative", height: 7 }}>
        <View style={{ position: "absolute", left: `${punteggio}%`, top: -9, width: 2, height: 12, backgroundColor: C.ink }} />
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

function Segmenti({ parti, totale }: { parti: { v: number; colore: string; testo?: string; chiaro?: boolean }[]; totale: number }) {
  return (
    <View style={{ flexDirection: "row", height: 13, borderRadius: 3, overflow: "hidden", gap: 1.5 }}>
      {parti
        .filter((p) => p.v > 0)
        .map((p, i) => (
          <View key={i} style={{ width: `${(p.v / totale) * 100}%`, backgroundColor: p.colore, alignItems: "center", justifyContent: "center" }}>
            {p.testo && (p.v / totale) * 100 >= 9 && <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: p.chiaro ? C.ink : "#fff", lineHeight: 1 }}>{p.testo}</Text>}
          </View>
        ))}
    </View>
  );
}

function Pie({ r }: { r: Report }) {
  return (
    <View style={s.pie} fixed>
      <Text>
        {r.attivita.nome}, {r.attivita.citta} · Report di visibilità AI · {dataIt(r.data)}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} di ${totalPages}`} />
    </View>
  );
}

export function ReportPdf({ report: r, logo }: { report: Report; logo?: string }) {
  const totale = r.domande * r.motori.length * r.ripetizioni;
  const col = coloreVerdetto(r.verdetto);
  const dist = distribuzionePosizioni(r.righe);
  const distTot = Object.values(dist).reduce((a, b) => a + b, 0);
  const tue = r.concorrenti.find((c) => c.seiTu);

  return (
    <Document title={`Visibilità AI – ${r.attivita.nome}, ${r.attivita.citta}`} author={logo ?? "Visibilità AI"} language="it">
      {/* Pagina 1: punteggio, sintesi, per assistente, per tipo, concorrenti, azioni */}
      <Page size="A4" style={s.page}>
        <View style={s.marchio}>
          <Text style={s.marchioTesto}>{logo ?? "Visibilità AI"}</Text>
          <Text style={s.piccolo}>{dataIt(r.data)}</Text>
        </View>

        <Text style={s.piccolo}>Report di visibilità AI</Text>
        <Text style={s.h1}>
          {r.attivita.nome}, {r.attivita.citta}
        </Text>
        <Text style={s.piccolo}>
          {r.attivita.categoriaGoogle} · {r.attivita.indirizzo}
        </Text>

        <View style={[s.riga, { marginTop: 10, gap: 10 }]}>
          {[
            [String(r.domande), "domande"],
            [String(r.motori.length), "assistenti AI"],
            [`${r.ripetizioni}×`, "ogni domanda"],
            [String(totale), "risposte lette"],
          ].map(([n, t]) => (
            <View key={t} style={s.kpi}>
              <Text style={s.kpiNumero}>{n}</Text>
              <Text style={s.piccolo}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={[s.colonne, { marginTop: 4 }]}>
          <View style={s.col}>
            <Text style={s.h2}>Punteggio di visibilità AI</Text>
            <View style={[s.riga, { alignItems: "flex-end" }]}>
              <Text style={[s.punteggio, { color: col }]}>{r.punteggio}</Text>
              <View style={{ marginLeft: 12, marginBottom: 4 }}>
                <Text style={[s.verdetto, { color: col }]}>{r.verdetto}</Text>
                <Text style={s.piccolo}>su 100</Text>
              </View>
            </View>
            <Scala punteggio={r.punteggio} />
            {distTot > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Quando compari, dove ti mettono</Text>
                <Segmenti totale={distTot} parti={([1, 2, 3, 4, 5] as const).map((p) => ({ v: dist[p], colore: POS[p], testo: `${p}°`, chiaro: p >= 4 }))} />
                <Text style={[s.piccolo, { marginTop: 3 }]}>
                  1° posto {Math.round((dist[1] / distTot) * 100)}% delle volte.{" "}
                  {([1, 2, 3, 4, 5] as const)
                    .filter((p) => dist[p] > 0)
                    .map((p) => `${p}° ${dist[p]}`)
                    .join(" · ")}{" "}
                  su {distTot} risposte in cui compari.
                </Text>
              </View>
            )}
          </View>
          <View style={s.col}>
            <Text style={s.h2}>In breve</Text>
            <Text style={{ fontSize: 9.5, lineHeight: 1.5 }}>{r.sintesi}</Text>
          </View>
        </View>

        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={s.h2}>Per assistente</Text>
            {r.perMotore.map((m) => (
              <Barra key={m.motore} etichetta={nomeMotore(m.motore)} valore={m.comparse} massimo={m.totale} testo={`${m.comparse} su ${m.totale} domande`} pieno />
            ))}
          </View>
          <View style={s.col}>
            <Text style={s.h2}>Per tipo di domanda</Text>
            {r.perTipo.map((t) => (
              <Barra key={t.tipo} etichetta={`${NOME_TIPO[t.tipo]} (${t.domande})`} valore={t.comparse} massimo={t.totale} testo={`${t.comparse} su ${t.totale} risposte`} pieno />
            ))}
          </View>
        </View>

        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={s.h2}>Chi consigliano al posto tuo</Text>
            {r.concorrenti.map((c) => (
              <Barra key={c.nome} etichetta={c.seiTu ? `${c.nome} (tu)` : c.nome} valore={c.citazioni} massimo={r.concorrenti[0]?.totale ?? 1} testo={`${c.citazioni} su ${c.totale}`} pieno={c.seiTu} />
            ))}
          </View>
          <View style={s.col}>
            <Text style={s.h2}>Testa a testa</Text>
            {r.testaATesta.map((t) => (
              <View key={t.nome} style={{ marginBottom: 6 }}>
                <View style={s.barraTesto}>
                  <Text>{t.nome}</Text>
                  <Text style={{ color: C.muted }}>
                    {t.loroSenzaTe + t.entrambi + t.tuSenzaLoro} domande su {r.domande}
                  </Text>
                </View>
                <Segmenti
                  totale={r.domande}
                  parti={[
                    { v: t.loroSenzaTe, colore: C.grey, testo: String(t.loroSenzaTe), chiaro: true },
                    { v: t.entrambi, colore: C.entrambi, testo: String(t.entrambi) },
                    { v: t.tuSenzaLoro, colore: C.accent, testo: String(t.tuSenzaLoro) },
                    { v: r.domande - t.loroSenzaTe - t.entrambi - t.tuSenzaLoro, colore: C.soft },
                  ]}
                />
              </View>
            ))}
            <Text style={s.piccolo}>Grigio: solo lui · verde chiaro: entrambi · verde scuro: solo tu · vuoto: nessuno dei due.</Text>
          </View>
        </View>

        <Pie r={r} />
      </Page>

      {/* Pagina 2: mappa domanda × assistente, parole, fonti */}
      <Page size="A4" style={s.page}>
        <Text style={[s.h2, { marginTop: 0, borderTopWidth: 0, paddingTop: 0 }]}>Dove ti trovano, domanda per domanda</Text>
        <Text style={[s.piccolo, { marginBottom: 6 }]}>Una cella per ogni domanda e assistente: più è scura, più in alto ti mettono. Il numero piccolo è quante volte su {r.ripetizioni}.</Text>
        <View style={[s.riga, { marginBottom: 3 }]}>
          <View style={{ flex: 2.2 }} />
          {r.motori.map((m) => (
            <Text key={m} style={{ flex: 1, marginLeft: 2, fontSize: 7.5, color: C.muted, textAlign: "center", fontFamily: "Helvetica-Bold" }}>
              {nomeMotore(m)}
            </Text>
          ))}
        </View>
        {r.righe.map((riga) => (
          <View key={riga.domanda.id} style={[s.riga, { marginBottom: 2 }]} wrap={false}>
            <Text style={{ flex: 2.2, fontSize: 8.5, paddingRight: 4 }}>{riga.domanda.testo}</Text>
            {riga.celle.map((c) => {
              const volte = c.volte ?? Number(c.frequenza.split(" ")[0]);
              const vuota = c.posizione === null;
              return (
                <View key={c.motore} style={[s.cella, { backgroundColor: vuota ? C.soft : POS[c.posizione!] }]}>
                  {vuota ? (
                    <Text style={[s.cellaTesto, { color: C.faint, fontFamily: "Helvetica" }]}>–</Text>
                  ) : (
                    <>
                      <Text style={[s.cellaTesto, { color: c.posizione! >= 4 ? C.ink : "#fff" }]}>{c.posizione}°</Text>
                      <Text style={[s.cellaSotto, { color: c.posizione! >= 4 ? C.ink : "#fff" }]}>
                        {volte}/{r.ripetizioni}
                      </Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        ))}
        <View style={[s.riga, { marginTop: 5, gap: 8 }]}>
          <Text style={s.piccolo}>Posizione:</Text>
          {([1, 2, 3, 4, 5] as const).map((p) => (
            <View key={p} style={[s.riga, { gap: 3 }]}>
              <View style={{ width: 7, height: 7, borderRadius: 1.5, backgroundColor: POS[p] }} />
              <Text style={s.piccolo}>{p}°</Text>
            </View>
          ))}
          <View style={[s.riga, { gap: 3 }]}>
            <View style={{ width: 7, height: 7, borderRadius: 1.5, backgroundColor: C.soft }} />
            <Text style={s.piccolo}>mai</Text>
          </View>
        </View>

        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={s.h2}>Le parole che usano</Text>
            {r.termini.map((t) => (
              <Barra key={t.termine} etichetta={t.termine} valore={t.volte} massimo={r.termini[0]?.volte ?? 1} testo={String(t.volte)} pieno={t.ceLHai} stato={{ testo: t.ceLHai ? "ce l'hai" : "manca", ok: t.ceLHai }} />
            ))}
          </View>
          <View style={s.col}>
            <Text style={s.h2}>Da dove prendono le informazioni</Text>
            {r.fonti.map((f) => (
              <Barra key={f.nome} etichetta={f.nome} valore={f.citazioni} massimo={r.fonti[0]?.citazioni ?? 1} testo={String(f.citazioni)} pieno={f.ciSei} stato={{ testo: f.ciSei ? "ci sei" : "non ci sei", ok: f.ciSei }} />
            ))}
          </View>
        </View>
        <Pie r={r} />
      </Page>

      {/* Pagina 3: azioni, cosa dicono di te, errori, metodo */}
      <Page size="A4" style={s.page}>
        <Text style={[s.h2, { marginTop: 0, borderTopWidth: 0, paddingTop: 0 }]}>Tre azioni, in ordine di impatto</Text>
        {r.azioni.map((a, i) => (
          <View key={a.titolo} style={s.azione}>
            <Text style={s.numero}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{a.titolo}</Text>
              <Text style={{ color: C.muted }}>{a.dato}</Text>
            </View>
          </View>
        ))}

        <Text style={s.h2}>Cosa dicono di te</Text>
        <Text style={[s.piccolo, { marginBottom: 6 }]}>La descrizione che ogni assistente dà della tua attività quando gli chiedi di te.</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {r.descrizioniPerMotore.map((d) => (
            <View key={d.motore} style={{ width: "48.5%", backgroundColor: C.soft, padding: 7, borderRadius: 4 }}>
              <Text style={[s.piccolo, { fontFamily: "Helvetica-Bold", marginBottom: 2 }]}>{nomeMotore(d.motore)}</Text>
              <Text style={{ fontSize: 9 }}>«{d.testo}»</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 8 }}>
          {r.errori.map((e, i) => (
            <View key={i} style={[s.riga, { marginBottom: 4 }]}>
              <Text style={[s.etichetta, { backgroundColor: C.dangerSoft, color: C.danger, marginRight: 6 }]}>errore</Text>
              <Text>{e.testo}</Text>
            </View>
          ))}
        </View>

        <Text style={s.h2}>Come è stato fatto</Text>
        <View style={s.colonne}>
          <View style={s.col}>
            <Text style={s.piccolo}>Scansione</Text>
            <Text>
              {dataIt(r.metodo.inizio)}, dalle {oraIt(r.metodo.inizio)} alle {oraIt(r.metodo.fine)}
            </Text>
            <Text style={[s.piccolo, { marginTop: 5 }]}>Posizione e lingua</Text>
            <Text>
              {r.metodo.posizione}, {r.metodo.lingua}
            </Text>
          </View>
          <View style={s.col}>
            <Text style={s.piccolo}>Assistenti e peso nel punteggio</Text>
            <Text>{r.motori.map((m) => `${nomeMotore(m)} ${Math.round((ENGINES.find((e) => e.id === m)?.peso ?? 0) * 100)}%`).join(", ")}, rinormalizzati sugli assistenti interrogati.</Text>
            <Text style={[s.piccolo, { marginTop: 5 }]}>Campione</Text>
            <Text>
              {r.domande} domande × {r.motori.length} assistenti × {r.ripetizioni} ripetizioni = {totale} risposte.{tue ? ` Compari in ${tue.citazioni}.` : ""}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 8 }}>
          {r.metodo.note.map((n) => (
            <Text key={n} style={[s.piccolo, { marginBottom: 2 }]}>
              • {n}
            </Text>
          ))}
        </View>
        <Text style={[s.piccolo, { marginTop: 14 }]}>
          Funziona con ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok; non siamo affiliati a OpenAI, Google, Anthropic, Perplexity o xAI. I marchi appartengono ai rispettivi proprietari.
        </Text>
        <Pie r={r} />
      </Page>
    </Document>
  );
}
