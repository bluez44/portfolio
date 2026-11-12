type Sfx = "buzz" | "rustle";

const BUZZ = { duration: 2.6, freq: 190, rise: 1.12, flutter: 28, cutoff: 1200, gain: 0.22 };
const RUSTLE = { duration: 0.6, freq: 3200, q: 0.4, gain: 0.18 };
const BUZZ_ATTACK = 0.15;

let ctx: AudioContext | null = null;

/** Buzz loudness 0..1: a quick swell, then a long fade as the bee flies off. */
function buzzGain(t: number, duration: number) {
  if (t <= 0 || t >= duration) return 0;
  if (t < BUZZ_ATTACK) return t / BUZZ_ATTACK;
  return ((duration - t) / (duration - BUZZ_ATTACK)) ** 1.5;
}

function buzz(ac: AudioContext, at: number) {
  const tone = ac.createOscillator();
  tone.type = "sawtooth";
  tone.frequency.setValueAtTime(BUZZ.freq, at);
  tone.frequency.linearRampToValueAtTime(BUZZ.freq * BUZZ.rise, at + 0.6);
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = BUZZ.cutoff;
  const wingbeat = ac.createGain();
  wingbeat.gain.value = 0.6;
  const lfo = ac.createOscillator();
  lfo.frequency.value = BUZZ.flutter;
  const depth = ac.createGain();
  depth.gain.value = 0.4;
  lfo.connect(depth).connect(wingbeat.gain);
  const amp = ac.createGain();
  const curve = Float32Array.from({ length: 64 }, (_, i) => buzzGain((i / 63) * BUZZ.duration, BUZZ.duration) * BUZZ.gain);
  amp.gain.setValueCurveAtTime(curve, at, BUZZ.duration);
  tone.connect(filter).connect(wingbeat).connect(amp).connect(ac.destination);
  tone.start(at);
  lfo.start(at);
  tone.stop(at + BUZZ.duration);
  lfo.stop(at + BUZZ.duration);
}

function rustle(ac: AudioContext, at: number) {
  const length = Math.ceil(ac.sampleRate * RUSTLE.duration);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
  const source = ac.createBufferSource();
  source.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = RUSTLE.freq;
  filter.Q.value = RUSTLE.q;
  const amp = ac.createGain();
  amp.gain.value = RUSTLE.gain;
  source.connect(filter).connect(amp).connect(ac.destination);
  source.start(at);
}

/** Call inside the user gesture: effects played later from timers are otherwise left suspended on WebKit. */
export function unlockSfx() {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    return;
  }
}

/** Synthesized effect; decoration only, so any audio failure is swallowed. */
export function playSfx(name: Sfx, delaySec = 0) {
  try {
    ctx ??= new AudioContext();
    (name === "buzz" ? buzz : rustle)(ctx, ctx.currentTime + delaySec);
  } catch {
    return;
  }
}
