import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { useCopy } from "../i18n/lang-context";

export function StageKickers({ greetingVisible = false }: { greetingVisible?: boolean }) {
  const { stage } = useCopy();
  return (
    <div className="relative grid place-items-center text-center">
      <div id="coverKicker" className="flex flex-col items-center gap-3.5 [grid-area:1/1]" style={{ opacity: greetingVisible ? 0 : 1 }}>
        <SectionKicker centered>{stage.coverKicker}</SectionKicker>
        <SectionHeading as="h1" size="cover" lead={stage.cover.lead} accent={stage.cover.accent} />
      </div>
      <div id="greetKicker" className="[grid-area:1/1]" style={{ opacity: greetingVisible ? 1 : 0 }}>
        <SectionKicker centered>{stage.greetKicker}</SectionKicker>
      </div>
    </div>
  );
}
