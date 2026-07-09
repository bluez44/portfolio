"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { stats } from "@/lib/portfolio-data";
import Image from "next/image";

export function About() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useScrollReveal<HTMLDivElement>(true);

  return (
    <section id="about" className="px-6 py-[clamp(72px,10vw,120px)]">
      <div ref={revealRef} className="mx-auto max-w-280">
        <p className="mb-2.5 font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          01 / About
        </p>
        <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          A little about me
        </h2>
        <div className="grid items-start gap-11 grid-cols-[repeat(auto-fit,minmax(290px,1fr))]">
          <div className="relative max-w-95">
            <div
              role="img"
              aria-label="Portrait placeholder — replace with your photo"
              className="flex aspect-4/5 items-center justify-center rounded-2xl border border-panel-border bg-bg2 overflow-hidden"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--panel) 0 12px, transparent 12px 24px)",
              }}
            >
              <span className="font-mono text-xs tracking-[0.08em] text-muted">
                <Image
                  src="/portrait.jpg"
                  width={400}
                  height={400}
                  alt="Picture of the author"
                />
              </span>
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
            <p className="text-[16.5px] leading-[1.85] text-muted">
              Hi, I&apos;m Vo Le Quang Vinh (Tom), an HCMUT (Bach Khoa) alumnus and a
              software engineer specializing in the JS/TS ecosystem (React,
              Vue.js, NestJS, React Native). I love bridging the gap between
              robust system architecture and seamless, modern UI/UX design. I am
              passionate about engineering high-performance applications that
              don&apos;t compromise on technical depth or visual appeal, strictly
              adhering to SOLID principles. My experience spans challenging
              domains, most notably developing TrackNest—a real-time location
              tracking and SOS emergency platform utilizing background tasks and
              gRPC—as well as building AI-driven Intelligent Tutoring Systems. I
              am currently looking for my next challenge in a frontend-focused
              role within a dynamic team. I want to leverage my full-stack
              knowledge to craft impactful, user-centric web and mobile
              experiences, driving product innovation from the API layer all the
              way to the interactive front-end.
            </p>
            {/* <p className="mt-4.5 text-[16.5px] leading-[1.85] text-muted">
              [Optional second paragraph — interests outside of code,
              open-source work, writing, or community involvement.]
            </p> */}
            <div
              ref={statsRef}
              className="mt-9.5 grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(130px,1fr))]"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-panel-border bg-panel p-[20px_18px] backdrop-blur-sm"
                >
                  <p className="font-heading text-[30px] font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[13px] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
