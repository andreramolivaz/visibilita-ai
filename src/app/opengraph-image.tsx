import { ImageResponse } from "next/og";

export const alt = "Visibilità AI – ChatGPT consiglia te o i tuoi concorrenti?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Anteprima per link condivisi: marchio, domanda, risposta ricostruita. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          color: "#14201c",
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="44" height="44" viewBox="0 0 64 64">
              <path d="M14 6h36a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10H40l-8 9-8-9H14A10 10 0 0 1 4 42V16A10 10 0 0 1 14 6z" fill="#0e5a47" />
              <circle cx="17" cy="19" r="3" fill="#fff" opacity="0.4" />
              <rect x="24" y="16.5" width="18" height="5" rx="2.5" fill="#fff" opacity="0.4" />
              <circle cx="17" cy="29" r="3.5" fill="#9fe8c6" />
              <rect x="24" y="26" width="26" height="6" rx="3" fill="#fff" />
              <circle cx="17" cy="39" r="3" fill="#fff" opacity="0.4" />
              <rect x="24" y="36.5" width="14" height="5" rx="2.5" fill="#fff" opacity="0.4" />
            </svg>
            <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.5 }}>Visibilità AI</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.02, maxWidth: 720 }}>
              Quando un cliente chiede a ChatGPT, fa il tuo nome?
            </div>
            <div style={{ fontSize: 28, color: "#5b6661", maxWidth: 760 }}>
              Scopri se gli assistenti AI consigliano te o i tuoi concorrenti, e cosa fare.
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 360,
            marginLeft: 24,
            borderRadius: 24,
            border: "2px solid #e4e8e6",
            padding: 28,
            gap: 16,
            alignSelf: "center",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span style={{ background: "#f3f5f4", borderRadius: 18, padding: "10px 16px", fontSize: 22 }}>Miglior pizzeria a Bergamo?</span>
          </div>
          {["Pizzeria Fratelli Rossi", "Al Forno Antico", "La Margherita"].map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22 }}>
              <span style={{ color: "#8a938f", width: 24 }}>{i + 1}.</span>
              <span style={{ fontWeight: 600 }}>{n}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fbeae8", color: "#b3261e", padding: "12px 14px", borderRadius: 12, fontSize: 20, fontWeight: 600 }}>
            Pizzeria Da Gino non compare
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
