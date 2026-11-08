import { GRADUATION_EVENT as E } from "@/lib/graduation/event";
import { SideRail } from "./side-rail";

export function SideRails() {
  return (
    <>
      <SideRail side="left" label="Thời gian · When" value={E.railWhen} sub={E.railWhenEn} progress />
      <SideRail side="right" label="Địa điểm · Where" value={E.venueShort} sub={E.addressShort} />
    </>
  );
}
