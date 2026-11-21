import { afterEach, describe, expect, it, vi } from "vitest";
import { waitForImages } from "@/components/graduation/loading/wait-for-images";

type FakeImage = { loading: string; decode: () => Promise<void>; getClientRects: () => { length: number } };

const fakeImage = (decode: () => Promise<void>, rendered = true): FakeImage => ({
  loading: "lazy",
  decode: vi.fn(decode),
  getClientRects: () => ({ length: rendered ? 1 : 0 }),
});
const asImages = (list: FakeImage[]) => list as unknown as HTMLImageElement[];

afterEach(() => {
  vi.useRealTimers();
});

describe("waitForImages", () => {
  it("switches lazy images to eager and waits for every decode", async () => {
    let finish!: () => void;
    const slow = fakeImage(() => new Promise<void>((r) => (finish = r)));
    const fast = fakeImage(() => Promise.resolve());
    let settled = false;

    const done = waitForImages(asImages([slow, fast]), 30_000).then(() => (settled = true));
    await Promise.resolve();

    expect(slow.loading).toBe("eager");
    expect(fast.loading).toBe("eager");
    expect(settled).toBe(false);
    finish();
    await done;
    expect(settled).toBe(true);
  });

  it("leaves images the layout hides lazy and does not wait for them", async () => {
    const hidden = fakeImage(() => new Promise<void>(() => {}), false);
    const shown = fakeImage(() => Promise.resolve());

    await expect(waitForImages(asImages([hidden, shown]), 30_000)).resolves.toBeUndefined();
    expect(hidden.loading).toBe("lazy");
    expect(hidden.decode).not.toHaveBeenCalled();
    expect(shown.loading).toBe("eager");
  });

  it("treats a failed image as done", async () => {
    const broken = fakeImage(() => Promise.reject(new Error("EncodingError")));
    await expect(waitForImages(asImages([broken]), 30_000)).resolves.toBeUndefined();
  });

  it("gives up after the timeout", async () => {
    vi.useFakeTimers();
    const stuck = fakeImage(() => new Promise<void>(() => {}));
    const done = waitForImages(asImages([stuck]), 30_000);
    vi.advanceTimersByTime(30_000);
    await expect(done).resolves.toBeUndefined();
  });

  it("resolves immediately with no images", async () => {
    await expect(waitForImages([], 30_000)).resolves.toBeUndefined();
  });
});
