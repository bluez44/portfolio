type Sfx = "crack" | "rustle";

const SHAPES: Record<Sfx, { duration: number; freq: number; q: number; gain: number }> = {
  crack: { duration: 0.12, freq: 1800, q: 0.8, gain: 0.5 },
  rustle: { duration: 0.6, freq: 3200, q: 0.4, gain: 0.18 },
};

let ctx: AudioContext | null = null;

/** A short filtered-noise burst; decoration only, so any audio failure is swallowed. */
export function playSfx(name: Sfx, delaySec = 0) {
  try {
    ctx ??= new AudioContext();
    const { duration, freq, q, gain } = SHAPES[name];
    const length = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.value = gain;
    source.connect(filter).connect(amp).connect(ctx.destination);
    source.start(ctx.currentTime + delaySec);
  } catch {
    return;
  }
}
