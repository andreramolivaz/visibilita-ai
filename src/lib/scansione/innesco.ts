import { config } from "../config";

/**
 * Fa partire (o continuare) l'avanzamento di una scansione chiamando la
 * propria API: ogni chiamata esegue un lotto e, se restano celle, si richiama.
 * Così la coda vive dentro le funzioni serverless, senza un processo a parte.
 */
export async function avviaAvanzamento(id: string): Promise<void> {
  try {
    await fetch(`${config.siteUrl}/api/scansioni/${encodeURIComponent(id)}/avanza`, {
      method: "POST",
      headers: { "x-coda-segreto": process.env.CODA_SEGRETO ?? "" },
      cache: "no-store",
    });
  } catch {
    /* il passaggio giornaliero riprende le celle rimaste */
  }
}

/** La richiesta può avanzare una scansione? Con CODA_SEGRETO impostato, solo chi lo conosce. */
export function innescoAutorizzato(req: Request): boolean {
  const segreto = process.env.CODA_SEGRETO;
  if (!segreto) return true;
  return req.headers.get("x-coda-segreto") === segreto || req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET ?? segreto}`;
}
