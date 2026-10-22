"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * L'apertura della home: sfondo verde, il marchio si compone riga per riga
 * (la bolla, poi le tre righe dell'elenco con la tua accesa, poi il nome) e
 * lascia il posto alla pagina. Una volta per sessione, mai con «riduci
 * movimento», e un tocco la salta.
 */

const CHIAVE = "apertura";
const DURATA_MS = 2500;

function giaVista(): boolean {
  try {
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem(CHIAVE) === "1"
    );
  } catch {
    return true;
  }
}

const sottoscrivi = () => () => {};

/** Segnata come vista solo quando finisce (o viene saltata): così non sparisce da sola a metà. */
function segnaVista() {
  try {
    sessionStorage.setItem(CHIAVE, "1");
  } catch {}
}

export function Apertura() {
  // Sul server si mostra; sul client, appena idratato, si toglie se è già stata vista in questa sessione.
  const salta = useSyncExternalStore(sottoscrivi, giaVista, () => false);
  const [finita, setFinita] = useState(false);

  useEffect(() => {
    if (salta) return;
    const t = window.setTimeout(() => {
      segnaVista();
      setFinita(true);
    }, DURATA_MS);
    return () => window.clearTimeout(t);
  }, [salta]);

  if (salta || finita) return null;

  const chiudi = () => {
    segnaVista();
    setFinita(true);
  };

  return (
    <>
      <div
        id="apertura"
        className="apertura fixed inset-0 z-[100] flex items-center justify-center bg-accent"
        role="presentation"
        aria-hidden="true"
        onClick={chiudi}
      >
        <div className="flex flex-col items-center gap-5">
          <svg width="120" height="120" viewBox="0 0 64 64">
            <path
              className="apertura-bolla"
              d="M14 6h36a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10H40l-8 9-8-9H14A10 10 0 0 1 4 42V16A10 10 0 0 1 14 6z"
              fill="#fff"
            />
            <g className="apertura-riga" style={{ animationDelay: "560ms" }}>
              <circle cx="17" cy="19" r="3" fill="var(--accent)" opacity=".3" />
              <rect
                x="24"
                y="16.5"
                width="18"
                height="5"
                rx="2.5"
                fill="var(--accent)"
                opacity=".3"
              />
            </g>
            <g className="apertura-riga" style={{ animationDelay: "780ms" }}>
              <circle cx="17" cy="29" r="3.5" fill="#9fe8c6" />
              <rect
                x="24"
                y="26"
                width="26"
                height="6"
                rx="3"
                fill="var(--accent)"
              />
            </g>
            <g className="apertura-riga" style={{ animationDelay: "1000ms" }}>
              <circle cx="17" cy="39" r="3" fill="var(--accent)" opacity=".3" />
              <rect
                x="24"
                y="36.5"
                width="14"
                height="5"
                rx="2.5"
                fill="var(--accent)"
                opacity=".3"
              />
            </g>
          </svg>
          <span className="apertura-nome text-2xl font-semibold tracking-[-0.01em] text-white">
            Visibilità AI
          </span>
        </div>
      </div>
      {/* Prima dell'idratazione: se è già stata vista in questa sessione, via subito, senza lampo verde. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${CHIAVE}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches){var a=document.getElementById("apertura");if(a)a.style.display="none"}}catch(e){}`,
        }}
      />
    </>
  );
}
