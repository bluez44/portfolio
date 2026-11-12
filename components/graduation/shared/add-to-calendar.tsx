"use client";

import { RisoButton } from "@/components/ui/riso/button";
import { calendarLinks, type CalendarTarget } from "@/lib/graduation/calendar";
import { useCalendarTarget } from "@/lib/hooks/use-calendar-target";
import { useCopy, useGradEvent } from "../i18n/lang-context";

const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Opens the calendar that fits the guest's platform, with a quiet link to the other one. */
export function AddToCalendar() {
  const { ends: t } = useCopy();
  const links = calendarLinks(useGradEvent());
  const primary = useCalendarTarget();
  const other: CalendarTarget = primary === "apple" ? "google" : "apple";
  const linkProps = (target: CalendarTarget) => (target === "google" ? { href: links.google, ...NEW_TAB } : { href: links.apple });

  return (
    <div className="flex flex-col items-start gap-2">
      <RisoButton variant="secondary" size="md" icon={primary === "google" ? "↗" : "↓"} {...linkProps(primary)}>
        {t.addToCalendar}
      </RisoButton>
      <a
        {...linkProps(other)}
        className="riso-focus hit-area relative font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase underline underline-offset-4 hover:text-tomato"
      >
        {t.calendar.orOther(t.calendar[other])}
      </a>
    </div>
  );
}
