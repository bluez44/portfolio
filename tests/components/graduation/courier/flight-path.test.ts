import { describe, expect, it } from "vitest";
import { cubicBezier, quadraticBezier, type Point } from "@/components/graduation/courier/flight-path";

describe("flight-path", () => {
  const p0: Point = { x: 0, y: 0 };
  const p1: Point = { x: 10, y: 20 };
  const p2: Point = { x: 30, y: 40 };
  const p3: Point = { x: 100, y: 100 };

  describe("cubicBezier", () => {
    it("returns p0 at t = 0", () => {
      expect(cubicBezier(0, p0, p1, p2, p3)).toEqual(p0);
    });

    it("returns p3 at t = 1", () => {
      expect(cubicBezier(1, p0, p1, p2, p3)).toEqual(p3);
    });

    it("interpolates intermediate point correctly at t = 0.5", () => {
      const mid = cubicBezier(0.5, p0, p1, p2, p3);
      // Expected formula for t=0.5: 0.125*p0 + 0.375*p1 + 0.375*p2 + 0.125*p3
      // x: 0.125*0 + 0.375*10 + 0.375*30 + 0.125*100 = 0 + 3.75 + 11.25 + 12.5 = 27.5
      // y: 0.125*0 + 0.375*20 + 0.375*40 + 0.125*100 = 0 + 7.5 + 15 + 12.5 = 35
      expect(mid.x).toBeCloseTo(27.5);
      expect(mid.y).toBeCloseTo(35);
    });
  });

  describe("quadraticBezier", () => {
    it("returns p0 at t = 0", () => {
      expect(quadraticBezier(0, p0, p1, p3)).toEqual(p0);
    });

    it("returns p3 at t = 1", () => {
      expect(quadraticBezier(1, p0, p1, p3)).toEqual(p3);
    });

    it("interpolates intermediate point correctly at t = 0.5", () => {
      const mid = quadraticBezier(0.5, p0, p1, p3);
      // Expected formula for t=0.5: 0.25*p0 + 0.5*p1 + 0.25*p3
      // x: 0 + 5 + 25 = 30
      // y: 0 + 10 + 25 = 35
      expect(mid.x).toBeCloseTo(30);
      expect(mid.y).toBeCloseTo(35);
    });
  });
});
