import { RisoButton } from "@/components/ui/riso/button";
import { SectionHeading } from "@/components/graduation/shared/section-heading";
import { SectionKicker } from "@/components/graduation/shared/section-kicker";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";

export default async function GraduationNotFound() {
  const lang = await getGraduationLang();
  const t = GRADUATION_COPY[lang].notFound;
  return (
    <main lang={lang} className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
      <div className="flex flex-col items-center gap-6">
        <SectionKicker align="center">{t.kicker}</SectionKicker>
        <SectionHeading as="h1" size="cover" lead={t.heading.lead} accent={t.heading.accent} />
        <p className="m-0 max-w-[40ch] text-ink-2">{t.body}</p>
        <RisoButton variant="secondary" size="md" href="/">← Portfolio</RisoButton>
      </div>
    </main>
  );
}
