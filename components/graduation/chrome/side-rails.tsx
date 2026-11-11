import { SideRail } from "./side-rail";
import { useCopy, useGradEvent } from "../i18n/lang-context";

export function SideRails() {
  const { rails } = useCopy();
  const event = useGradEvent();
  return (
    <>
      <SideRail side="left" label={rails.when} value={rails.whenValue} sub={event.timeRange} progress />
      <SideRail side="right" label={rails.where} value={rails.whereValue} sub={rails.whereSub} />
    </>
  );
}
