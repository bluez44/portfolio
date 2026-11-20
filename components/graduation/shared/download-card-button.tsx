import { RisoButton } from "@/components/ui/riso/button";
import { cardFileName } from "@/lib/graduation/card-file-name";

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export function DownloadCardButton({ guestId, guestName, label }: { guestId: string; guestName: string; label: string }) {
  return (
    <RisoButton
      variant="secondary"
      size="md"
      href={`/graduation/${guestId}/card`}
      download={cardFileName(guestName)}
      target="_blank"
      rel="noopener noreferrer"
      icon={<DownloadIcon />}
    >
      {label}
    </RisoButton>
  );
}
