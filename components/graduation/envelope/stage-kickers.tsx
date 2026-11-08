import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";

export function StageKickers({ greetingVisible = false }: { greetingVisible?: boolean }) {
  return (
    <div className="relative grid place-items-center text-center">
      <div id="coverKicker" className="flex flex-col items-center gap-3.5 [grid-area:1/1]" style={{ opacity: greetingVisible ? 0 : 1 }}>
        <SectionKicker centered>01 · Bạn được mời · You&apos;re invited</SectionKicker>
        <SectionHeading as="h1" size="cover" lead="Graduation" accent="day." />
      </div>
      <div id="greetKicker" className="[grid-area:1/1]" style={{ opacity: greetingVisible ? 1 : 0 }}>
        <SectionKicker centered>02 · Lời chào · Hello</SectionKicker>
      </div>
    </div>
  );
}
