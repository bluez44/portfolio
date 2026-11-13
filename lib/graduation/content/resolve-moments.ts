import { MOMENT_STYLE } from "../i18n/moments";
import type { Lang, Moment, MomentText } from "../i18n/types";
import type { SettingsMoment } from "./settings-types";

type MomentsInput = {
  lang: Lang;
  defaults: readonly Moment[];
  settings?: readonly SettingsMoment[];
  guest?: readonly SettingsMoment[];
};

const nonEmpty = (list?: readonly SettingsMoment[]) => (list && list.length > 0 ? list : undefined);

export function resolveMoments({ lang, defaults, settings, guest }: MomentsInput): Moment[] {
  const own = nonEmpty(guest) ?? nonEmpty(settings);
  if (!own) return [...defaults];
  const shared = own === guest ? nonEmpty(settings) : undefined;

  return own.map((moment, i) => {
    const base = defaults[i];
    const style = MOMENT_STYLE[i % MOMENT_STYLE.length];
    const text = (part: keyof MomentText) => moment[lang]?.[part] || shared?.[i]?.[lang]?.[part] || base?.[part] || "";
    return {
      n: String(i + 1).padStart(2, "0"),
      year: moment.year || base?.year || "",
      title: text("title"),
      body: text("body"),
      image: moment.image || base?.image || "",
      color: moment.color ?? style.color,
      rot: style.rot,
    };
  });
}
