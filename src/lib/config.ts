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
  get siteUrl() {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000")
    );
  },
};
