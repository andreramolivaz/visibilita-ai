import { NextResponse, after } from "next/server";
import { config } from "@/lib/config";
import { utenteCorrente } from "@/lib/supabase/server";
import { creaScansione } from "@/lib/scansione/coda";
import { deposito } from "@/lib/scansione/deposito";
import { avviaAvanzamento } from "@/lib/scansione/innesco";
import type { Domanda, ProfiloAttivita, SegnaliProfilo } from "@/lib/types";

const MAX_GIORNO = Number(process.env.MAX_TEST_GRATUITI_AL_GIORNO ?? 100);
const GIORNI_TRA_TEST = 30;

/**
 * Avvia una scansione.
 * - Test gratuito: profilo, domande e segnali dalla conferma; limiti per attività (30 giorni) e per giorno.
 * - Abbonati: `attivitaId` (l'attività salvata nell'area); per ora va in coda come prima.
 * La scansione parte subito dopo la risposta e la pagina di scansione la segue.
 */
export async function POST(req: Request) {
  let body: { attivitaId?: string; attivita?: ProfiloAttivita; domande?: Domanda[]; segnali?: SegnaliProfilo; recensioni?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errore: "Richiesta non valida." }, { status: 400 });
  }

  if (body.attivitaId) {
    if (config.supabase) {
      const utente = await utenteCorrente();
      if (!utente) return NextResponse.json({ errore: "Devi prima accedere." }, { status: 401 });
    }
    // TODO: caricare l'attività dalla tabella `attivita` e creare la scansione con il piano dell'abbonamento.
    return NextResponse.json({ id: `scan-${Date.now().toString(36)}`, stato: "in coda", minuti: 3 });
  }

  const { attivita, domande } = body;
  if (!attivita?.nome || !attivita.citta || !Array.isArray(domande) || domande.length === 0) {
    return NextResponse.json({ errore: "Profilo o domande mancanti." }, { status: 400 });
  }
  if (domande.length > 15) return NextResponse.json({ errore: "Troppe domande per un test gratuito." }, { status: 400 });

  const dep = deposito();
  // Senza motori la scansione è una dimostrazione: nessun limite.
  if (attivita.placeId && config.motori > 0) {
    const ultimo = await dep.ultimoTestGratuito(attivita.placeId);
    if (ultimo && Date.now() - new Date(ultimo.quando).getTime() < GIORNI_TRA_TEST * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ id: ultimo.scansioneId, giaFatto: true, quando: ultimo.quando });
    }
  }
  if (config.motori > 0 && (await dep.testGratuitiOggi()) >= MAX_GIORNO) {
    return NextResponse.json({ errore: "I test gratuiti di oggi sono finiti: riprova domani." }, { status: 429 });
  }

  const s = await creaScansione({ piano: "gratuito", attivita, domande, segnali: body.segnali, recensioni: body.recensioni });
  await dep.registraTestGratuito({ placeId: attivita.placeId, nome: attivita.nome, citta: attivita.citta, scansioneId: s.id });
  if (!s.simulata) after(() => avviaAvanzamento(s.id));
  return NextResponse.json({ id: s.id, simulata: s.simulata, totale: s.celle.length });
}
