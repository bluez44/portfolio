import type { SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment, MomentText } from "@/lib/graduation/i18n";

export const addMoment = (list: readonly SettingsMoment[]): SettingsMoment[] => [...list, { year: "", image: "" }];

export const removeMoment = (list: readonly SettingsMoment[], index: number): SettingsMoment[] => list.filter((_, i) => i !== index);

export function moveMoment(list: readonly SettingsMoment[], index: number, offset: -1 | 1): SettingsMoment[] {
  const target = index + offset;
  if (target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const updateMoment = (list: readonly SettingsMoment[], index: number, patch: Partial<SettingsMoment>): SettingsMoment[] =>
  list.map((moment, i) => (i === index ? { ...moment, ...patch } : moment));

export function setMomentText(moment: SettingsMoment, lang: Lang, part: keyof MomentText, value: string): SettingsMoment {
  const text = { ...moment[lang] };
  if (value === "") delete text[part];
  else text[part] = value;
  return { ...moment, [lang]: text };
}

export const momentsFromResolved = (fallback: Record<Lang, readonly Moment[]>): SettingsMoment[] =>
  fallback.vi.map((moment, i) => ({
    year: moment.year,
    image: moment.image,
    color: moment.color,
    vi: { title: moment.title, body: moment.body },
    en: { title: fallback.en[i]?.title ?? "", body: fallback.en[i]?.body ?? "" },
  }));
