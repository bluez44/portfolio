import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted: Google Fonts sometimes returns `/l/font?kit=…&skey=…` URLs that Turbopack's
// next/font/google cannot resolve. Files are the Google Fonts variable fonts pinned to the same
// instances Google serves (wght axis only) and subset to the same character ranges.
const bricolage = localFont({
  src: "./fonts/bricolage-grotesque.woff2",
  variable: "--font-bricolage",
  weight: "400 800",
  display: "swap",
});

const instrument = localFont({
  src: "./fonts/instrument-sans.woff2",
  variable: "--font-instrument",
  weight: "400 700",
  display: "swap",
});

const jetbrains = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "400 600",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  adjustFontFallback: false,
});

const TITLE = "Võ Lê Quang Vinh – Fullstack Software Engineer | Portfolio";
const DESCRIPTION =
  "Võ Lê Quang Vinh – Fullstack Software Engineer in Ho Chi Minh City. Building fast, scalable web & mobile apps with React, Next.js, Vue, React Native and NestJS.";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

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
