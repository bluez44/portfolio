import { afterEach, describe, expect, it, vi } from "vitest";
import { createGainTrack, type TrackState } from "@/components/graduation/music/audio-track";

function createFakeElement() {
  const attributes = new Map<string, string>();
  const listeners = new Map<string, Set<() => void>>();

  const element = {
    loop: false,
    preload: "",
    src: "",
    setAttribute: vi.fn((name: string, value: string) => {
      attributes.set(name, value);
    }),
    removeAttribute: vi.fn((name: string) => {
      attributes.delete(name);
    }),
    play: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn((type: string, fn: () => void) => {
      let set = listeners.get(type);
      if (!set) {
        set = new Set();
        listeners.set(type, set);
      }
      set.add(fn);
    }),
    removeEventListener: vi.fn((type: string, fn: () => void) => {
      listeners.get(type)?.delete(fn);
    }),
  };

  return {
    element,
    asAudio: () => element as unknown as HTMLAudioElement,
    attributes,
    listeners,
    dispatch(type: string) {
      for (const fn of listeners.get(type) ?? []) fn();
    },
  };
}

function createFakeContext(currentTime = 10) {
  const source = { connect: vi.fn() };
  const gainParam = {
    value: 1,
    cancelScheduledValues: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  };
  const gainNode = {
    gain: gainParam,
    connect: vi.fn(),
  };
  const destination = {};

  const context = {
    currentTime,
    destination,
    createMediaElementSource: vi.fn(() => source),
    createGain: vi.fn(() => gainNode),
    resume: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    close: vi.fn<() => Promise<void>>(() => Promise.resolve()),
  };

  return {
    context,
    asContext: () => context as unknown as AudioContext,
    source,
    gainNode,
    gainParam,
    destination,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("createGainTrack", () => {
  it("configures audio element and creates Web Audio graph lazily on first play", async () => {
    const fakeEl = createFakeElement();
    const fakeCtx = createFakeContext();
    const createContext = vi.fn(() => fakeCtx.asContext());

    const track = createGainTrack("/api/graduation/audio?pathname=audio%2Ftest.mp3", {
      createElement: () => fakeEl.asAudio(),
      createContext,
    });

    expect(fakeEl.element.loop).toBe(true);
    expect(fakeEl.element.preload).toBe("auto");
    expect(fakeEl.attributes.has("playsinline")).toBe(true);
    expect(fakeEl.element.src).toBe("/api/graduation/audio?pathname=audio%2Ftest.mp3");
    expect(createContext).not.toHaveBeenCalled();

    const calls: string[] = [];
    let resolveResume!: () => void;
    fakeCtx.context.resume.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          calls.push("resume");
          resolveResume = resolve;
        }),
    );
    fakeEl.element.play.mockImplementation(() => {
      calls.push("play");
      return Promise.resolve();
    });

    const firstPlay = track.play();
    expect(calls).toEqual(["resume", "play"]);
    resolveResume();
    await firstPlay;

    expect(createContext).toHaveBeenCalledTimes(1);
    expect(fakeCtx.context.createMediaElementSource).toHaveBeenCalledTimes(1);
    expect(fakeCtx.source.connect).toHaveBeenCalledWith(fakeCtx.gainNode);
    expect(fakeCtx.gainNode.connect).toHaveBeenCalledWith(fakeCtx.destination);

    await track.play();
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(fakeCtx.context.createMediaElementSource).toHaveBeenCalledTimes(1);
  });

  it("rejects play() when element.play() rejects", async () => {
    const fakeEl = createFakeElement();
    const fakeCtx = createFakeContext();
    const err = new Error("NotAllowedError");
    fakeEl.element.play.mockRejectedValueOnce(err);

    const track = createGainTrack("/audio.mp3", {
      createElement: () => fakeEl.asAudio(),
      createContext: () => fakeCtx.asContext(),
    });

    await expect(track.play()).rejects.toThrow("NotAllowedError");
  });

  it("maps media events to track states and supports unsubscribe", () => {
    const fakeEl = createFakeElement();
    const fakeCtx = createFakeContext();

    const track = createGainTrack("/audio.mp3", {
      createElement: () => fakeEl.asAudio(),
      createContext: () => fakeCtx.asContext(),
    });

    const states: TrackState[] = [];
    const unsubscribe = track.subscribe((s) => states.push(s));

    expect(track.playing).toBe(false);

    fakeEl.dispatch("canplaythrough");
    fakeEl.dispatch("playing");
    expect(track.playing).toBe(true);

    fakeEl.dispatch("pause");
    expect(track.playing).toBe(false);

    fakeEl.dispatch("error");
    expect(states).toEqual(["ready", "playing", "paused", "error"]);

    unsubscribe();
    fakeEl.dispatch("playing");
    expect(states).toEqual(["ready", "playing", "paused", "error"]);
  });

  it("ramps gain in fadeTo, cancels previous fade onDone, and applies pre-graph level", async () => {
    vi.useFakeTimers();
    const fakeEl = createFakeElement();
    const fakeCtx = createFakeContext(12.5);

    const track = createGainTrack("/audio.mp3", {
      createElement: () => fakeEl.asAudio(),
      createContext: () => fakeCtx.asContext(),
    });

    track.setLevel(0.2);
    await track.play();
    expect(fakeCtx.gainParam.value).toBe(0.2);

    const firstDone = vi.fn();
    const secondDone = vi.fn();
    track.fadeTo(0.35, 600, firstDone);

    expect(fakeCtx.gainParam.cancelScheduledValues).toHaveBeenCalledWith(12.5);
    expect(fakeCtx.gainParam.setValueAtTime).toHaveBeenCalledWith(0.2, 12.5);
    expect(fakeCtx.gainParam.linearRampToValueAtTime).toHaveBeenCalledWith(0.35, 13.1);

    vi.advanceTimersByTime(300);
    track.fadeTo(0.8, 400, secondDone);

    vi.advanceTimersByTime(300);
    expect(firstDone).not.toHaveBeenCalled();
    expect(secondDone).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(secondDone).toHaveBeenCalledTimes(1);

    const thirdDone = vi.fn();
    track.fadeTo(0, 500, thirdDone);
    track.setLevel(0.5);
    expect(fakeCtx.gainParam.value).toBe(0.5);

    vi.advanceTimersByTime(500);
    expect(thirdDone).not.toHaveBeenCalled();
  });

  it("disposes element, listeners, pending timers, and created AudioContext", async () => {
    vi.useFakeTimers();
    const fakeEl = createFakeElement();
    const fakeCtx = createFakeContext();

    const track = createGainTrack("/audio.mp3", {
      createElement: () => fakeEl.asAudio(),
      createContext: () => fakeCtx.asContext(),
    });

    const listener = vi.fn();
    const onDone = vi.fn();
    track.subscribe(listener);

    await track.play();
    track.fadeTo(0, 500, onDone);
    track.dispose();

    expect(fakeEl.element.pause).toHaveBeenCalledTimes(1);
    expect(fakeEl.element.removeAttribute).toHaveBeenCalledWith("src");
    expect(fakeEl.element.load).toHaveBeenCalledTimes(1);
    expect(fakeCtx.context.close).toHaveBeenCalledTimes(1);

    fakeEl.dispatch("error");
    expect(listener).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(onDone).not.toHaveBeenCalled();
  });

  it("does not create or close AudioContext when disposed before first play", () => {
    const fakeEl = createFakeElement();
    const createContext = vi.fn(() => createFakeContext().asContext());

    const track = createGainTrack("/audio.mp3", {
      createElement: () => fakeEl.asAudio(),
      createContext,
    });

    track.dispose();

    expect(fakeEl.element.pause).toHaveBeenCalledTimes(1);
    expect(fakeEl.element.removeAttribute).toHaveBeenCalledWith("src");
    expect(fakeEl.element.load).toHaveBeenCalledTimes(1);
    expect(createContext).not.toHaveBeenCalled();
  });
});
