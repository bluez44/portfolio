import { useCopy } from "../i18n/lang-context";

export function OwnerPhoneNote({ phone }: { phone: string }) {
  const { rsvp: t } = useCopy();
  return (
    <p className="m-0 text-[15px] text-ink-2">
      {t.ownerPhone}:{" "}
      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="riso-focus font-semibold text-ink underline underline-offset-4 hover:text-tomato">
        {phone}
      </a>
    </p>
  );
}
