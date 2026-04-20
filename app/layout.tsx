import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Energy Sharing Niedenstein — Sonnenstrom für die Nachbarschaft",
  description:
    "Pilotprojekt: Solarstrom lokal teilen statt anonym einspeisen. Für Niedenstein und Nordhessen. Jetzt auf Warteliste eintragen.",
  openGraph: {
    title: "Energy Sharing Niedenstein",
    description:
      "Pilotprojekt: Solarstrom lokal teilen statt anonym einspeisen.",
    type: "website",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Energy Sharing Niedenstein",
    description:
      "Pilotprojekt: Solarstrom lokal teilen statt anonym einspeisen.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${dmSerif.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
