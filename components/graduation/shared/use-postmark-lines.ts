import { useCopy, useGradEvent } from "../i18n/lang-context";

export function usePostmarkLines(): [string, string, string] {
  const { marks } = useCopy();
  const { year } = useGradEvent();
  return [marks.school, `· ${year} ·`, marks.city];
}
