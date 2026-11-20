export type PerfTier = "full" | "lite";

export type PerfSignals = {
  cores?: number;
  memoryGb?: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
};

export const LITE_MAX_CORES = 6;
export const LITE_MAX_MEMORY_GB = 4;

export function perfTierFor(s: PerfSignals): PerfTier {
  if (s.reducedMotion) return "lite";
  if (!s.coarsePointer) return "full";
  const lowCores = s.cores !== undefined && s.cores <= LITE_MAX_CORES;
  const lowMemory = s.memoryGb !== undefined && s.memoryGb <= LITE_MAX_MEMORY_GB;
  return lowCores || lowMemory ? "lite" : "full";
}

export const PERF_TIER_SCRIPT = `try{(function(){var m=matchMedia,n=navigator,c=n.hardwareConcurrency,g=n.deviceMemory,r=m('(prefers-reduced-motion: reduce)').matches,p=m('(pointer: coarse)').matches;document.documentElement.dataset.perf=r||(p&&((typeof c==='number'&&c>0&&c<=${LITE_MAX_CORES})||(typeof g==='number'&&g>0&&g<=${LITE_MAX_MEMORY_GB})))?'lite':'full';})()}catch(e){}`;
