import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "[Your Name] — [Job Title] | Portfolio",
  description:
    "Portfolio of [Your Name], [Job Title]. Projects, skills, experience and contact.",
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
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="portfolio-theme"
        >
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
