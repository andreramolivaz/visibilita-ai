import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Report, Verdetto } from "@/lib/types";
import { ENGINES } from "@/lib/engines";

/**
 * Il report su due pagine A4, stesso stile del sito: un colore, barre
 * orizzontali, verdetti a semaforo. In white-label `logo` sostituisce il marchio.
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
};

const s = StyleSheet.create({
  page: { padding: 40, paddingBottom: 48, fontFamily: "Helvetica", fontSize: 10, color: C.ink, lineHeight: 1.4 },
  marchio: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  marchioTesto: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  piccolo: { fontSize: 8.5, color: C.muted },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 2, marginBottom: 6, letterSpacing: -0.3, lineHeight: 1.2 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  riga: { flexDirection: "row", alignItems: "center" },
  punteggio: { fontSize: 56, fontFamily: "Helvetica-Bold", letterSpacing: -2, lineHeight: 1.05 },
  verdetto: { fontSize: 16, fontFamily: "Helvetica-Bold", lineHeight: 1.2, marginBottom: 2 },
  barraRiga: { marginBottom: 4 },
  barraTesto: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  barraSfondo: { height: 5, backgroundColor: C.soft, borderRadius: 3 },
  barra: { height: 5, borderRadius: 3 },
  tabella: { marginTop: 2 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 4 },
  th: { fontSize: 8.5, color: C.muted, fontFamily: "Helvetica-Bold" },
  tdDomanda: { flex: 2.4, paddingRight: 6 },
  td: { flex: 1, fontSize: 8.5 },
  azione: { flexDirection: "row", marginBottom: 7 },
  numero: { width: 16, height: 16, borderRadius: 8, backgroundColor: C.accent, color: "#fff", fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center", lineHeight: 1, paddingTop: 3.5, marginRight: 8 },
  etichetta: { fontSize: 8, fontFamily: "Helvetica-Bold", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  pie: { position: "absolute", bottom: 22, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: C.faint },
});

const nomeMotore = (id: string) => ENGINES.find((e) => e.id === id)?.nome ?? id;

function coloreVerdetto(v: Verdetto) {
  if (v === "Invisibile") return C.danger;
  if (v === "Poco visibile") return C.warn;
  return C.accent;
}

function Barra({ etichetta, valore, massimo, testo, pieno }: { etichetta: string; valore: number; massimo: number; testo: string; pieno?: boolean }) {
  const pct = massimo > 0 ? Math.max(0, Math.min(100, (valore / massimo) * 100)) : 0;
  return (
    <View style={s.barraRiga}>
      <View style={s.barraTesto}>
        <Text style={pieno ? { fontFamily: "Helvetica-Bold", color: C.accent } : undefined}>{etichetta}</Text>
        <Text style={{ color: C.muted }}>{testo}</Text>
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
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden" }}>
        {fasce.map((f) => (
          <View key={f.nome} style={{ width: `${f.a - f.da + (f.da ? 1 : 0)}%`, backgroundColor: f.colore, opacity: punteggio >= f.da ? 1 : 0.25 }} />
        ))}
      </View>
      <View style={{ position: "relative", height: 8 }}>
        <View style={{ position: "absolute", left: `${punteggio}%`, top: -9, width: 2, height: 12, backgroundColor: C.ink }} />
      </View>
      <View style={{ flexDirection: "row" }}>
        {fasce.map((f) => (
          <Text key={f.nome} style={[{ width: "25%", fontSize: 7.5, color: C.faint }, punteggio >= f.da && punteggio <= f.a ? { color: C.ink, fontFamily: "Helvetica-Bold" } : {}]}>
            {f.nome} {f.da}–{f.a}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Pie({ r }: { r: Report }) {
  return (
    <View style={s.pie} fixed>
      <Text>
        {r.attivita.nome}, {r.attivita.citta} · Report di visibilità AI
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} di ${totalPages}`} />
    </View>
  );
}

export function ReportPdf({ report: r, logo }: { report: Report; logo?: string }) {
  const totale = r.domande * r.motori.length * r.ripetizioni;
  const data = new Date(r.data + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const col = coloreVerdetto(r.verdetto);

  return (
    <Document title={`Visibilità AI – ${r.attivita.nome}, ${r.attivita.citta}`} author={logo ?? "Visibilità AI"} language="it">
      <Page size="A4" style={s.page}>
        <View style={s.marchio}>
          <Text style={s.marchioTesto}>{logo ?? "Visibilità AI"}</Text>
          <Text style={s.piccolo}>{data}</Text>
        </View>

        <Text style={s.piccolo}>Report di visibilità AI</Text>
        <Text style={s.h1}>
          {r.attivita.nome}, {r.attivita.citta}
        </Text>
        <Text style={[s.piccolo, { marginTop: 4 }]}>
          {r.domande} domande × {r.motori.length} motori × {r.ripetizioni} ripetizioni = {totale} risposte. Motori:{" "}
          {r.motori.map(nomeMotore).join(", ")}.
        </Text>

        <Text style={s.h2}>Punteggio di visibilità AI</Text>
        <View style={[s.riga, { alignItems: "flex-end" }]}>
          <Text style={[s.punteggio, { color: col }]}>{r.punteggio}</Text>
          <View style={{ marginLeft: 14, marginBottom: 4 }}>
            <Text style={[s.verdetto, { color: col }]}>{r.verdetto}</Text>
            <Text style={s.piccolo}>su 100</Text>
          </View>
        </View>
        <Scala punteggio={r.punteggio} />
        <Text style={[s.piccolo, { marginTop: 6 }]}>
          Quante volte compari, pesato per la posizione (1° posto vale 1, 5° vale 0,4) e per quanti italiani usano ogni motore.
        </Text>

        <View style={{ flexDirection: "row", gap: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.h2}>Per motore</Text>
            {r.perMotore.map((m) => (
              <Barra key={m.motore} etichetta={nomeMotore(m.motore)} valore={m.comparse} massimo={m.totale} testo={`${m.comparse} su ${m.totale} domande`} pieno />
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h2}>Chi consigliano al posto tuo</Text>
            {r.concorrenti.map((c) => (
              <Barra key={c.nome} etichetta={c.seiTu ? `${c.nome} (tu)` : c.nome} valore={c.citazioni} massimo={r.concorrenti[0]?.totale ?? 1} testo={`${c.citazioni} su ${c.totale}`} pieno={c.seiTu} />
            ))}
          </View>
        </View>

        <Text style={s.h2}>Tre azioni, in ordine di impatto</Text>
        {r.azioni.map((a, i) => (
          <View key={a.titolo} style={s.azione}>
            <Text style={s.numero}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{a.titolo}</Text>
              <Text style={{ color: C.muted }}>{a.dato}</Text>
            </View>
          </View>
        ))}
        <Pie r={r} />
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={[s.h2, { marginTop: 0, borderTopWidth: 0, paddingTop: 0 }]}>Domanda per domanda</Text>
        <View style={s.tabella}>
          <View style={s.tr}>
            <Text style={[s.th, s.tdDomanda]}>Domanda</Text>
            {r.motori.map((m) => (
              <Text key={m} style={[s.th, s.td]}>
                {nomeMotore(m)}
              </Text>
            ))}
          </View>
          {r.righe.map((riga) => (
            <View key={riga.domanda.id} style={s.tr} wrap={false}>
              <Text style={s.tdDomanda}>{riga.domanda.testo}</Text>
              {riga.celle.map((c) => (
                <Text key={c.motore} style={s.td}>
                  {c.posizione === null ? <Text style={{ color: C.faint }}>–</Text> : <Text style={{ fontFamily: "Helvetica-Bold", color: C.accent }}>{c.posizione}°</Text>}
                  <Text style={{ color: C.muted }}> {c.frequenza}</Text>
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={[s.piccolo, { marginTop: 4 }]}>Posizione in cui compari e quante volte su {r.ripetizioni} ripetizioni. – = mai.</Text>


        <Text style={s.h2}>Da dove prendono le informazioni</Text>
        <View style={{ flexDirection: "row", gap: 24 }}>
          {[r.fonti.slice(0, Math.ceil(r.fonti.length / 2)), r.fonti.slice(Math.ceil(r.fonti.length / 2))].map((colonna, i) => (
            <View key={i} style={{ flex: 1 }}>
              {colonna.map((f) => (
                <View key={f.nome} style={[s.tr, { justifyContent: "space-between", alignItems: "center" }]}>
                  <Text>
                    {f.nome} <Text style={{ color: C.muted }}>{f.citazioni}</Text>
                  </Text>
                  <Text style={[s.etichetta, f.ciSei ? { backgroundColor: C.accentSoft, color: C.accent } : { backgroundColor: C.dangerSoft, color: C.danger }]}>
                    {f.ciSei ? "ci sei" : "non ci sei"}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <Text style={s.h2}>Cosa dicono di te</Text>
        <Text style={{ backgroundColor: C.soft, padding: 8, borderRadius: 4 }}>{r.descrizioneAI}</Text>
        {r.errori.map((e, i) => (
          <View key={i} style={[s.riga, { marginTop: 5 }]}>
            <Text style={[s.etichetta, { backgroundColor: C.dangerSoft, color: C.danger, marginRight: 6 }]}>errore</Text>
            <Text>{e.testo}</Text>
          </View>
        ))}

        <Text style={[s.piccolo, { marginTop: 18 }]}>
          Le risposte dei motori cambiano nel tempo: ogni numero riporta quante volte compari su quante risposte. Funziona con
          ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok; non siamo affiliati a OpenAI, Google, Anthropic, Perplexity o xAI.
        </Text>
        <Pie r={r} />
      </Page>
    </Document>
  );
}
