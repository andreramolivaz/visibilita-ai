import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagina } from "@/components/ui";
import { Scansione } from "@/components/Scansione";

export const metadata: Metadata = { title: "Sto chiedendo ai motori…" };

export default function PaginaScansione() {
  return (
    <Pagina className="!max-w-3xl">
      <Suspense fallback={null}>
        <Scansione />
      </Suspense>
    </Pagina>
  );
}
