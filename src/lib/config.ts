/**
 * Cosa è configurato in questo ambiente. Senza chiavi il sito funziona
 * in modalità dimostrativa: niente pagamenti, niente accesso.
 */
export const config = {
  get stripe() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },
  get supabase() {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
  /** Profilo da Google Places (scheda, recensioni, concorrenti vicini). */
  get places() {
    return Boolean(process.env.GOOGLE_PLACES_API_KEY);
  },
  /** Quanti assistenti hanno una chiave: 0 = scansione dimostrativa. */
  get motori() {
    return ["OPENAI_API_KEY", "GEMINI_API_KEY", "ANTHROPIC_API_KEY", "PERPLEXITY_API_KEY", "XAI_API_KEY"].filter((k) => process.env[k]).length + (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD ? 1 : 0);
  },
  /** Varianti delle domande e, poi, consigli: modello linguistico Anthropic. */
  get claude() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },
  get siteUrl() {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000")
    );
  },
};
