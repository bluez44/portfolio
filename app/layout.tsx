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

const SITE_URL = "https://www.vinhvolequang.io.vn";
const TITLE = "Võ Lê Quang Vinh – Fullstack Software Engineer | Portfolio";
const DESCRIPTION =
  "Võ Lê Quang Vinh – Fullstack Software Engineer in Ho Chi Minh City. Building fast, scalable web & mobile apps with React, Next.js, Vue, React Native and NestJS.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Võ Lê Quang Vinh Portfolio",
  authors: [{ name: "Võ Lê Quang Vinh", url: SITE_URL }],
  creator: "Võ Lê Quang Vinh",
  keywords: [
    "Võ Lê Quang Vinh",
    "Vo Le Quang Vinh",
    "Fullstack Software Engineer",
    "Frontend Developer",
    "React",
    "Next.js",
    "Vue.js",
    "React Native",
    "NestJS",
    "Ho Chi Minh City",
  ],

  verification: {
    google: "GSAj7DO0vmq3LpE0LJucIlCK_wTfgl3TdCGNiDgPpyQ",
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Võ Lê Quang Vinh Portfolio",
    locale: "en_US",
    type: "profile",
    firstName: "Vinh",
    lastName: "Võ Lê Quang",
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
