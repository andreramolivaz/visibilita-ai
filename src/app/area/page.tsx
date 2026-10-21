import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Bottone, Etichetta, Pagina, Scheda, Titolo } from "@/components/ui";
import { utenteCorrente } from "@/lib/supabase/server";
import { abbonamentoDi } from "@/lib/supabase/abbonamenti";
import { piano as pianoDi, euro, prezzo } from "@/lib/prezzi";
import { REPORT_ESEMPIO } from "@/lib/mock-report";
import { Portale } from "@/components/Portale";

export const metadata: Metadata = { title: "Area personale" };

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

export default function Area() {
  return (
    <Pagina larga>
      <Suspense fallback={<p className="text-muted">Carico la tua area…</p>}>
        <Contenuto />
      </Suspense>
    </Pagina>
  );
}

async function Contenuto() {
  const utente = await utenteCorrente();
  if (!utente?.email) redirect("/accedi");

  const abb = await abbonamentoDi(utente.email);
  // TODO: storico vero dalla tabella `report`; per ora il report di esempio.
  const report = [REPORT_ESEMPIO];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{utente.email}</p>
          <Titolo>La tua area</Titolo>
        </div>
        <form action="/esci" method="post">
          <button type="submit" className="text-sm text-muted underline underline-offset-2 hover:text-ink">
            Esci
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="text-lg font-semibold">Report</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {report.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link href={`/report/${r.id}?abbonato=1`} className="font-medium hover:underline">
                    {r.attivita.nome}, {r.attivita.citta}
                  </Link>
                  <p className="text-sm text-muted">{dataIt(r.data)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular text-2xl font-bold">{r.punteggio}</span>
                  <Etichetta tono={r.punteggio <= 10 ? "errore" : r.punteggio <= 40 ? "attenzione" : "accento"}>
                    {r.verdetto}
                  </Etichetta>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">La prossima scansione parte automaticamente; ti arriva via email.</p>
        </section>

        <aside>
          <Scheda>
            <h2 className="font-semibold">Abbonamento</h2>
            {abb ? (
              <>
                <p className="mt-2 text-[15px]">
                  Piano <span className="font-medium">{pianoDi(abb.piano).nome}</span>,{" "}
                  {abb.periodo === "annuale" ? "annuale" : "mensile"}:{" "}
                  <span className="tabular">{euro(prezzo(pianoDi(abb.piano), abb.periodo))}</span> + IVA.
                </p>
                <p className="mt-1 text-sm text-muted">
                  {abb.stato === "canceled"
                    ? `Disdetto${abb.disdetto_il ? ` il ${dataIt(abb.disdetto_il)}` : ""}.`
                    : abb.rinnovo_il
                      ? `Si rinnova il ${dataIt(abb.rinnovo_il)}.`
                      : "Attivo."}
                </p>
                <div className="mt-4">
                  <Portale />
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted">Nessun abbonamento collegato a questa email.</p>
                <div className="mt-4">
                  <Bottone href="/prezzi" className="w-full sm:w-full">
                    Scegli un piano
                  </Bottone>
                </div>
              </>
            )}
          </Scheda>
        </aside>
      </div>
    </>
  );
}
