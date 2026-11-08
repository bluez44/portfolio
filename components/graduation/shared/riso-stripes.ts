// riso-stripes.ts: tomato/blue air-mail border used by the envelope front and pocket band
export const airMailStripes = (band: number) =>
  `repeating-linear-gradient(-45deg, var(--tomato) 0 ${band}px, var(--paper) ${band}px ${band * 2}px, var(--blue) ${band * 2}px ${band * 3}px, var(--paper) ${band * 3}px ${band * 4}px)`;
