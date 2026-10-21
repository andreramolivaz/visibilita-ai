import { Bottone, Pagina, Titolo } from "@/components/ui";

export default function NonTrovata() {
  return (
    <Pagina>
      <Titolo>Pagina non trovata</Titolo>
      <p className="mt-3 text-muted">Il link potrebbe essere scaduto o sbagliato.</p>
      <div className="mt-6">
        <Bottone href="/">Torna all&apos;inizio</Bottone>
      </div>
    </Pagina>
  );
}
