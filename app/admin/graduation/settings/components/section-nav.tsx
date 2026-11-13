"use client";

import { SETTINGS_TABS, type SettingsTab } from "../sections";

type SectionNavProps = { active: SettingsTab; onSelect: (tab: SettingsTab) => void };

export function SectionNav({ active, onSelect }: SectionNavProps) {
  return (
    <nav aria-label="Nhóm nội dung" className="flex gap-1 overflow-x-auto pb-1 min-[760px]:flex-col min-[760px]:overflow-visible">
      {SETTINGS_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          aria-current={tab.key === active ? "page" : undefined}
          onClick={() => onSelect(tab.key)}
          className={`rounded-md px-3 py-2 text-left text-xs font-medium whitespace-nowrap transition-colors ${
            tab.key === active ? "bg-sky-500/15 text-sky-300" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
