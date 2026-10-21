/**
 * Ricostruzione di una risposta di un assistente AI a "Miglior pizzeria a
 * Bergamo": tre concorrenti elencati, tu no. È il problema reso visibile.
 * Dati inventati, coerenti con il report di esempio.
 */
export function RispostaChat() {
  const nomi = [
    { nome: "Pizzeria Fratelli Rossi", nota: "forno a legna, impasto a lunga lievitazione, in centro." },
    { nome: "Al Forno Antico", nota: "pizza napoletana, molto apprezzata per le margherite." },
    { nome: "La Margherita", nota: "buon rapporto qualità-prezzo, aperta anche a pranzo." },
  ];
  return (
    <figure className="w-full max-w-md rounded-2xl border border-line bg-bg shadow-[0_1px_2px_rgba(20,32,28,0.04),0_12px_40px_-12px_rgba(20,32,28,0.18)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs text-faint">
        <span className="h-2 w-2 rounded-full bg-[#b9c2be]" />
        <span className="h-2 w-2 rounded-full bg-[#b9c2be]" />
        <span className="h-2 w-2 rounded-full bg-[#b9c2be]" />
        <span className="ml-2">assistente AI</span>
      </div>
      <div className="space-y-3 px-4 py-4 text-[14.5px] leading-relaxed sm:px-5">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-soft px-3.5 py-2 text-ink">
            Miglior pizzeria a Bergamo?
          </p>
        </div>
        <div className="text-ink">
          <p>Ecco tre pizzerie molto apprezzate a Bergamo:</p>
          <ol className="mt-2 space-y-1.5">
            {nomi.map((n, i) => (
              <li key={n.nome} className="flex gap-2">
                <span className="tabular w-4 shrink-0 text-faint">{i + 1}.</span>
                <span>
                  <span className="font-semibold">{n.nome}</span>
                  <span className="text-muted"> – {n.nota}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption className="flex items-start gap-2.5 border-t border-line bg-danger-soft/60 px-4 py-3 text-sm sm:px-5">
        <span className="mt-0.5 font-bold text-danger" aria-hidden="true">
          ✕
        </span>
        <span>
          <span className="font-semibold text-danger">Pizzeria Da Gino non compare.</span>{" "}
          <span className="text-muted">Né qui, né in 7 delle 10 domande che abbiamo fatto.</span>
        </span>
      </figcaption>
    </figure>
  );
}
