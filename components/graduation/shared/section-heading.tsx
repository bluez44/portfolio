const SIZE = {
  section: "clamp(2.2rem, 5.5vw, 4.5rem)",
  cover: "clamp(2rem, 4.2vw, 3.4rem)",
} as const;

export function SectionHeading({
  lead,
  accent,
  as: Tag = "h2",
  size = "section",
}: { lead: string; accent: string; as?: "h1" | "h2"; size?: keyof typeof SIZE }) {
  return (
    <Tag
      className="m-0 font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
      style={{ fontSize: SIZE[size], fontVariationSettings: '"wdth" 90, "opsz" 96' }}
    >
      {lead}{" "}
      <span className="italic text-tomato" style={{ fontVariationSettings: '"wdth" 82' }}>
        {accent}
      </span>
    </Tag>
  );
}
