"use client";

import { useState } from "react";
import { Bottone } from "@/components/ui";

/** Copia il link di questo report negli appunti. */
export function CopiaLink() {
  const [fatto, setFatto] = useState(false);

  async function copia() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("?")[0]);
      setFatto(true);
      setTimeout(() => setFatto(false), 2000);
    } catch {
      window.prompt("Copia il link:", window.location.href.split("?")[0]);
    }
  }

  return (
    <Bottone type="button" onClick={copia} secondario className="!w-auto !px-4 !py-2 !text-sm">
      {fatto ? "Link copiato" : "Copia il link"}
    </Bottone>
  );
}
