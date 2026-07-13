"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { aboutPanels } from "@/lib/portfolio-data";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

export function About() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useMediaQuery({
    query: "(max-width: 1024px)",
  });

  // GSAP only animates panels after the first one (see querySelectorAll
  // below), translating each further down via `y: 50 + index * 30`. Those
  // panels are `lg:absolute`, so they don't contribute to the wrapper's
  // layout height — without this reserved space, the last panel visually
  // renders on top of the section's bottom padding instead of pushing it down.
  const animatedPanelCount = Math.max(aboutPanels.length - 1, 0);
  const panelStackOffset =
    animatedPanelCount > 0 ? 50 + (animatedPanelCount - 1) * 30 : 0;

  useEffect(() => {
    const content = contentRef.current;
    if (!content || isMobile) return;

    gsap.registerPlugin(ScrollTrigger);

    console.log("Setting up about panels scroll animation", isMobile);

    const panels = Array.from(
      content.querySelectorAll<HTMLElement>(
        "[data-about-panel]:not([data-about-panel]:first-child)",
      ),
    );
    if (panels.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    // gsap.set(panels, {});

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: content,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    panels.forEach((panel, index) => {
      gsap.set(panel, {
        zIndex: 30 + index * 10,
        opacity: 0,
        y: 200 + index * 30,
        x: 20 + index * 50,
        scale: 0.96,
        transformOrigin: "top center",
        willChange: "transform, opacity",
      });

      const start = index * 0.85;
      timeline.to(
        panel,
        {
          ease: "none",
          keyframes: [
            { opacity: 0.8, y: 200 + index * 30, scale: 1, duration: 0.45 },
            {
              y: 50 + index * 30,
              x: 20 + index * 50,
              opacity: 1,
              scale: 0.98,
              duration: 0.35,
            },
          ],
        },
        start,
      );
    });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [isMobile]);

  return (
    <section
      ref={contentRef}
      id="about"
      className="px-6 py-[clamp(72px,10vw,120px)]"
    >
      <div className="mx-auto max-w-280">
        <div ref={revealRef} className="mb-10 lg:mb-14">
          <p className="mb-2.5 font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
            01 / About
          </p>
          <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
            A little about me
          </h2>
        </div>

        <div
          className="relative lg:pb-(--panel-stack-offset)"
          style={
            { "--panel-stack-offset": `${panelStackOffset}px` } as CSSProperties
          }
        >
          {aboutPanels.map((panel, index) => (
            <div
              key={panel.kicker}
              data-about-panel
              className={`${index === 0 ? "relative" : "lg:absolute relative"} top-0 left-0 rounded-3xl border border-panel-border bg-panel/80 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm lg:p-8 mt-8`}
            >
              <div className="grid items-start gap-8 lg:grid-cols-[minmax(260px,320px)_1fr]">
                <div className="relative max-w-95">
                  <div
                    role="img"
                    aria-label={panel.image.alt}
                    className="flex aspect-4/5 items-center justify-center overflow-hidden rounded-2xl border border-panel-border bg-bg2"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(-45deg, var(--panel) 0 12px, transparent 12px 24px)",
                    }}
                  >
                    <Image
                      src={panel.image.src}
                      width={panel.image.width}
                      height={panel.image.height}
                      alt={panel.image.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div
                    aria-hidden
                    className="absolute -z-10 rounded-2xl border"
                    style={{
                      inset: "14px -14px -14px 14px",
                      borderColor: "var(--accent-dim)",
                    }}
                  />
                </div>

                <div>
                  <p className="font-mono text-[12px] tracking-[0.18em] text-accent uppercase">
                    {panel.kicker}
                  </p>
                  <h3 className="mt-3 font-heading text-[clamp(1.4rem,2.3vw,2rem)] font-semibold tracking-[-0.01em] text-fg">
                    {panel.title}
                  </h3>

                  {panel.description ? (
                    <p className="mt-4 text-[16.5px] leading-[1.85] text-muted">
                      {panel.description}
                    </p>
                  ) : null}

                  {panel.body ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {panel.body.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-panel-border bg-bg2 p-4 text-[15px] leading-[1.7] text-muted"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {panel.stats ? (
                    <div className="mt-6 grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
                      {panel.stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-xl border border-panel-border bg-bg2 p-[20px_18px]"
                        >
                          <p className="font-heading text-[30px] font-bold text-accent">
                            {stat.value}
                          </p>
                          <p className="mt-1.5 text-[13px] text-muted">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
