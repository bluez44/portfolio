import { RisoButton } from "@/components/ui/riso/button";
import { SectionHeading } from "@/components/graduation/shared/section-heading";
import { SectionKicker } from "@/components/graduation/shared/section-kicker";

export default function GraduationNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
      <div className="flex flex-col items-center gap-6">
        <SectionKicker centered>404 · Return to sender</SectionKicker>
        <SectionHeading as="h1" size="cover" lead="Thiệp này" accent="không tồn tại." />
        <p className="m-0 max-w-[40ch] text-ink-2">This invitation doesn&apos;t exist — kiểm tra lại đường link bạn nhận được nhé.</p>
        <RisoButton variant="secondary" size="md" href="/">← Portfolio</RisoButton>
      </div>
    </main>
  );
}
