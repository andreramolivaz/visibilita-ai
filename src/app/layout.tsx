import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Visibilità AI – ChatGPT consiglia te o i tuoi concorrenti?",
    template: "%s · Visibilità AI",
  },
  description:
    "In 60 secondi scopri se ChatGPT, Gemini e Google AI consigliano la tua attività, chi ti passa davanti e le tre cose da sistemare. Test gratuito, senza registrazione.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <header className="no-print border-b border-line">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Visibilità<span className="text-accent"> AI</span>
            </Link>
            <nav className="flex gap-4 text-sm text-muted">
              <Link href="/report/esempio" className="hover:text-fg">
                Esempio
              </Link>
              <Link href="/prezzi" className="hover:text-fg">
                Prezzi
              </Link>
              <Link href="/agenzie" className="hover:text-fg">
                Agenzie
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-line">
          <div className="mx-auto max-w-2xl px-4 py-6 text-sm text-muted">
            <p>
              Funziona con ChatGPT, Gemini e Google AI. Non siamo affiliati a OpenAI, Google o
              Anthropic. Le risposte dei motori cambiano: mostriamo sempre quante volte su quante.
            </p>
            <p className="mt-2">
              <Link href="/privacy" className="underline">
                Privacy
              </Link>{" "}
              · usiamo solo dati pubblici della tua attività e la tua email.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
