/** Attribution for embedded third-party content, linking to its owner. */
export function SourceCredit({ label, owner, href }: { label: string; owner: string; href: string }) {
  return (
    <p className="m-0 text-[13px] text-ink-3">
      {label}:{" "}
      <a href={href} target="_blank" rel="noopener noreferrer" className="riso-focus text-ink-2 underline underline-offset-4 hover:text-tomato">
        {owner}
      </a>
    </p>
  );
}
