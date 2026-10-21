/**
 * Rete con timeout e cache in memoria. Tutto quello che esce verso Google,
 * il sito dell'attività o le API passa da qui, così i limiti sono in un posto solo.
 * La cache vive nel processo (su Vercel, per istanza): in produzione va nel database.
 */

const CACHE = new Map<string, { scade: number; valore: unknown }>();

export async function conCache<T>(chiave: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const ora = Date.now();
  const voce = CACHE.get(chiave);
  if (voce && voce.scade > ora) return voce.valore as T;
  const valore = await fn();
  CACHE.set(chiave, { scade: ora + ttlMs, valore });
  if (CACHE.size > 500) {
    for (const [k, v] of CACHE) if (v.scade <= ora) CACHE.delete(k);
  }
  return valore;
}

export const GIORNO = 24 * 60 * 60 * 1000;

/** fetch con timeout; non lancia: ritorna null se qualcosa va storto. */
export async function scarica(url: string, init: RequestInit = {}, timeoutMs = 6000): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Testo di una risposta, con un tetto in byte (i siti possono essere enormi). */
export async function testoLimitato(res: Response, maxBytes = 600_000): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return await res.text();
  const parti: Uint8Array[] = [];
  let letti = 0;
  while (letti < maxBytes) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    parti.push(value);
    letti += value.byteLength;
  }
  reader.cancel().catch(() => {});
  const tutto = new Uint8Array(letti);
  let off = 0;
  for (const p of parti) {
    tutto.set(p.subarray(0, Math.min(p.byteLength, letti - off)), off);
    off += p.byteLength;
    if (off >= letti) break;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(tutto);
}
