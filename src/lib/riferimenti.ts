/**
 * Riferimenti esterni: gli studi di settore con cui il report confronta il
 * risultato di un'attività, così uno zero si legge per quello che è (la norma)
 * e non come un difetto della misura. Una voce = un dato, una fonte, un anno.
 */
export interface Riferimento {
  dato: string;
  fonte: string;
  anno: number;
  url: string;
  /** Campione dello studio, in breve. */
  campione: string;
}

export const RIFERIMENTI: Riferimento[] = [
  {
    dato: "ChatGPT raccomanda l'1,2% delle sedi monitorate; Gemini l'11%, Perplexity il 7,4%. Nel riquadro locale di Google la presenza è del 35,9%.",
    fonte: "SOCi, Local Visibility Index",
    anno: 2026,
    url: "https://www.soci.ai/news/in-ai-driven-discovery-few-brands-are-chosen-most-disappear/",
    campione: "oltre 350.000 sedi di 2.751 marchi",
  },
  {
    dato: "Il 40,9% delle attività locali non è mai raccomandato da ChatGPT e il 68,8% da Perplexity su cinque domande di raccomandazione; il telefono è sbagliato nel 30–39% dei casi.",
    fonte: "Insites, AI Visibility Benchmark",
    anno: 2026,
    url: "https://insites.com/blog/the-ai-visibility-benchmark-how-10000-local-businesses-actually-perform-in-chatgpt-and-perplexity/",
    campione: "10.000 attività locali",
  },
  {
    dato: "L'83% dei ristoranti non compare mai nelle risposte di ChatGPT, contro il 14% invisibile su Google.",
    fonte: "Local Falcon",
    anno: 2026,
    url: "https://www.localfalcon.com/research/the-ai-visibility-crisis-why-83-percent-of-restaurants-dont-exist-in-chatgpt",
    campione: "189.905 risultati",
  },
  {
    dato: "La stessa domanda ripetuta restituisce la stessa lista meno di una volta su cento, e nello stesso ordine circa una su mille; i nomi forti restano però nel 60–90% delle risposte.",
    fonte: "SparkToro",
    anno: 2026,
    url: "https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/",
    campione: "2.961 esecuzioni su 12 domande",
  },
  {
    dato: "Il 45% dei consumatori ha usato un assistente AI per trovare un'attività locale nell'ultimo anno (il 6% l'anno prima); il 97% ricontrolla con le recensioni.",
    fonte: "BrightLocal, Local Consumer Review Survey",
    anno: 2026,
    url: "https://www.brightlocal.com/research/lcrs-ai-trust/",
    campione: "1.002 adulti, Stati Uniti",
  },
  {
    dato: "Il sito dell'attività è citato da ChatGPT nel 72% delle domande sul nome e sulla reputazione; schema, llms.txt e velocità del sito non hanno correlazione misurabile con la presenza.",
    fonte: "Insites, What AI uses to choose local businesses",
    anno: 2026,
    url: "https://insites.com/blog/what-ai-uses-to-choose-local-businesses-and-what-it-ignores/",
    campione: "10.000 attività locali",
  },
];
