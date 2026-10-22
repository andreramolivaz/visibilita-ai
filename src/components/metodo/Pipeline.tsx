/**
 * Il percorso dei dati, da sinistra a destra: scheda → profilo → domande →
 * assistenti → risposte → riconoscimento → report. SVG inline, un solo colore.
 * `scuro` per la banda scura della home.
 */
const PASSI = [
  { titolo: "Scheda e sito", sotto: "nome, indirizzo, orari, categoria, menu o servizi" },
  { titolo: "Profilo", sotto: "categoria, specialità, zona, portali" },
  { titolo: "Domande", sotto: "36–72 intenti, generati dal profilo" },
  { titolo: "Sei assistenti", sotto: "API ufficiali, posizione impostata" },
  { titolo: "Risposte", sotto: "ogni domanda 2–3 volte" },
  { titolo: "Riconoscimento", sotto: "nome + indirizzo + telefono" },
  { titolo: "Report", sotto: "punteggio, mappa, fonti, azioni" },
];

export function Pipeline({ scuro = false, didascalia = true }: { scuro?: boolean; didascalia?: boolean }) {
  const w = 1120;
  const h = 160;
  const n = PASSI.length;
  const gap = 18;
  const bw = (w - gap * (n - 1)) / n;
  const c = scuro
    ? { scatola: "rgba(255,255,255,0.04)", bordo: "rgba(255,255,255,0.18)", titolo: "#fff", sotto: "rgba(255,255,255,0.62)", numero: "rgba(255,255,255,0.45)", freccia: "rgba(255,255,255,0.35)", ultimoBg: "#9fe8c6", ultimoBordo: "#9fe8c6", ultimoTitolo: "#14201c", ultimoSotto: "rgba(20,32,28,0.75)" }
    : { scatola: "var(--bg)", bordo: "var(--line)", titolo: "var(--ink)", sotto: "var(--muted)", numero: "var(--faint)", freccia: "var(--faint)", ultimoBg: "var(--accent)", ultimoBordo: "var(--accent)", ultimoTitolo: "#fff", ultimoSotto: "rgba(255,255,255,0.85)" };
  const marker = scuro ? "freccia-scura" : "freccia";
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`Percorso dei dati: ${PASSI.map((p) => p.titolo).join(", poi ")}`}>
        {PASSI.map((p, i) => {
          const x = i * (bw + gap);
          const ultimo = i === n - 1;
          return (
            <g key={p.titolo}>
              <rect x={x} y={30} width={bw} height={100} rx={12} fill={ultimo ? c.ultimoBg : c.scatola} stroke={ultimo ? c.ultimoBordo : c.bordo} strokeWidth={1.5} />
              <text x={x + 14} y={60} fontSize={14} fontWeight={600} fill={ultimo ? c.ultimoTitolo : c.titolo}>
                {p.titolo}
              </text>
              <foreignObject x={x + 14} y={68} width={bw - 24} height={58}>
                <p style={{ fontSize: 11.5, lineHeight: 1.3, color: ultimo ? c.ultimoSotto : c.sotto, margin: 0 }}>{p.sotto}</p>
              </foreignObject>
              <text x={x + 14} y={20} fontSize={11} fill={c.numero}>
                {i + 1}
              </text>
              {!ultimo && <path d={`M${x + bw + 3},80 L${x + bw + gap - 3},80`} stroke={c.freccia} strokeWidth={1.5} markerEnd={`url(#${marker})`} />}
            </g>
          );
        })}
        <defs>
          <marker id={marker} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill={c.freccia} />
          </marker>
        </defs>
      </svg>
      {didascalia && (
        <figcaption className={`mt-2 text-sm ${scuro ? "text-white/60" : "text-muted"}`}>
          Da sinistra a destra, per ogni scansione. Il passo 6 è codice nostro, deterministico; i consigli (passo 7) sono l&apos;unico punto in cui un modello scrive testo, e riceve solo dati già verificati.
        </figcaption>
      )}
    </figure>
  );
}
