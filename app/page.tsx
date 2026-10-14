import { Header } from "@/components/portfolio/header";
import { Hero } from "@/components/portfolio/hero";
import { About } from "@/components/portfolio/about";
import { Skills } from "@/components/portfolio/skills";
import { Projects } from "@/components/portfolio/projects";
import { Experience } from "@/components/portfolio/experience";
import { Education } from "@/components/portfolio/education";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";
import { SceneLoadingGate } from "@/components/portfolio/scene-loading-gate";
import { VisitorTracker } from "@/components/VisitorTracker";
import { education, socials } from "@/lib/portfolio-data";

const SITE_URL = "https://www.vinhvolequang.io.vn";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Võ Lê Quang Vinh",
      alternateName: ["Vo Le Quang Vinh", "Quang Vinh", "Tom"],
      jobTitle: "Fullstack Software Engineer",
      url: SITE_URL,
      image: `${SITE_URL}/portrait.jpg`,
      email: "mailto:vlqvinh444@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ho Chi Minh City",
        addressCountry: "VN",
      },
      alumniOf: education.map((entry) => ({
        "@type": "CollegeOrUniversity",
        name: entry.school,
      })),
      knowsAbout: [
        "React",
        "Next.js",
        "Vue.js",
        "React Native",
        "NestJS",
        "Node.js",
        "TypeScript",
      ],
      sameAs: socials
        .map((social) => social.href)
        .filter((href) => href.startsWith("http")),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Võ Lê Quang Vinh Portfolio",
      inLanguage: "en",
      author: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <VisitorTracker />
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
      <SceneLoadingGate />
    </>
  );
}
