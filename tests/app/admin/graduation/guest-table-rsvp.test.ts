import { describe, expect, it } from "vitest";
import type { GuestListItem } from "@/lib/graduation/types";

describe("GuestListItem RSVP fields", () => {
  it("supports rsvpContact and rsvpReason on guest rows", () => {
    const acceptedGuest: GuestListItem = {
      id: "guest-1",
      name: "Nguyễn Văn A",
      slug: "nguyen-van-a",
      note: null,
      customContent: null,
      rsvpStatus: "yes",
      rsvpUpdatedAt: new Date().toISOString(),
      rsvpWish: "Chúc mừng tốt nghiệp!",
      rsvpContact: "0901234567",
      rsvpReason: null,
    };

    const declinedGuest: GuestListItem = {
      id: "guest-2",
      name: "Trần Thị B",
      slug: "tran-thi-b",
      note: null,
      customContent: null,
      rsvpStatus: "no",
      rsvpUpdatedAt: new Date().toISOString(),
      rsvpWish: null,
      rsvpContact: null,
      rsvpReason: "Trùng lịch công tác",
    };

    expect(acceptedGuest.rsvpContact).toBe("0901234567");
    expect(acceptedGuest.rsvpReason).toBeNull();

    expect(declinedGuest.rsvpContact).toBeNull();
    expect(declinedGuest.rsvpReason).toBe("Trùng lịch công tác");
  });
});
