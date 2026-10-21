import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://visibilita-ai-beta.vercel.app"),
  title: {
    default: "Visibilità AI – ChatGPT consiglia te o i tuoi concorrenti?",
    template: "%s · Visibilità AI",
  },
  description:
    "In 60 secondi scopri se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok consigliano la tua attività, chi ti passa davanti e le tre cose da sistemare. Test gratuito, senza registrazione.",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Visibilità AI",
    title: "ChatGPT consiglia te o i tuoi concorrenti?",
    description:
      "In 60 secondi scopri se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok consigliano la tua attività, chi ti passa davanti e le tre cose da sistemare.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${instrument.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
