import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { useCopy } from "../i18n/lang-context";

/** Mobile: cover and greeting share one centred cell and cross-fade. Desktop: cover sits left, greeting right. */
export function StageKickers({ greetingVisible = false }: { greetingVisible?: boolean }) {
  const { stage } = useCopy();
  return (
    <div className="relative w-full max-w-6xl flex flex-col items-center justify-center text-center">
      <div
        id="coverKicker"
        className="col-start-1 row-start-1 flex flex-col items-center gap-3.5 min-[760px]:items-stretch min-[760px]:text-left"
        style={{ opacity: greetingVisible ? 0 : 1 }}
      >
        <SectionKicker align="center" desktopAlign="center">{stage.coverKicker}</SectionKicker>
        <SectionHeading as="h1" size="cover" lead={stage.cover.lead} accent={stage.cover.accent} />
      </div>
      <div id="greetKicker" className="col-start-1 row-start-1 min-[760px]:col-start-2" style={{ opacity: greetingVisible ? 1 : 0 }}>
        <SectionKicker align="center" desktopAlign="end">{stage.greetKicker}</SectionKicker>
      </div>
    </div>
  );
}
