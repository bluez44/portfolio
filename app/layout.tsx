import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Võ Lê Quang Vinh | Portfolio",
  description:
    "Portfolio of Võ Lê Quang Vinh. Projects, skills, experience and contact.",

  verification: {
    google: "GSAj7DO0vmq3LpE0LJucIlCK_wTfgl3TdCGNiDgPpyQ",
  },

  metadataBase: new URL("https://www.vinhvolequang.io.vn/"),
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/vi",
      "en-US": "/en",
    },
  },

  openGraph: {
    title: "Võ Lê Quang Vinh | Portfolio",
    description:
      "Portfolio of Võ Lê Quang Vinh. Projects, skills, experience and contact.",
    url: "https://www.vinhvolequang.io.vn/",
    siteName: "Võ Lê Quang Vinh | Portfolio",
    locale: "vi_VN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Võ Lê Quang Vinh | Portfolio",
    description:
      "Portfolio of Võ Lê Quang Vinh. Projects, skills, experience and contact.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <a href="#top" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          storageKey="portfolio-theme"
        >
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
