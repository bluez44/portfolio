"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { contactSchema, type ContactFormValues } from "@/lib/schemas/contact";
import { socials } from "@/lib/portfolio-data";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const SOCIAL_ACCENT = ["tomato", "blue", "jade"] as const;

export function Contact() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>(true);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-none border-0 border-b-[1.5px] border-ink/40 bg-transparent px-1 py-3 text-[16px] text-ink transition-[border-color] focus:border-tomato focus:outline-none placeholder:text-ink-3";

  return (
    <section
      id="contact"
      className="relative border-t-[1.5px] border-ink px-6 py-[clamp(80px,10vw,140px)]"
      style={{ background: "var(--paper-2)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* section head */}
        <div ref={headerRef} className="mb-14 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              07 · Contact
            </span>
            <span aria-hidden className="h-px flex-1 max-w-40 bg-ink/20" />
          </div>
          <h2
            className="font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
              fontVariationSettings: '"wdth" 90, "opsz" 96',
            }}
          >
            Send a{" "}
            <span
              className="italic text-tomato"
              style={{ fontVariationSettings: '"wdth" 82' }}
            >
              postcard.
            </span>
          </h2>
        </div>

        <div ref={gridRef} className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          {/* form as paper */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="relative rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper p-8 lg:p-10"
            style={{ boxShadow: "8px 8px 0 var(--ink)" }}
          >
            {/* postmark corner */}
            <span
              aria-hidden
              className="absolute -top-4 -right-4 grid h-20 w-20 place-items-center rounded-full border-[1.5px] border-ink bg-paper"
              style={{
                boxShadow: "3px 3px 0 var(--tomato)",
                transform: "rotate(-8deg)",
              }}
            >
              <span className="text-center font-mono text-[9px] font-bold tracking-[0.14em] text-tomato uppercase leading-tight">
                Air
                <br />
                Mail
                <br />· 2026 ·
              </span>
            </span>

            <div className="mb-6 flex items-baseline justify-between border-b-[1.5px] border-dashed border-ink/40 pb-4">
              <p className="font-mono text-[10px] tracking-[0.22em] text-ink-2 uppercase">
                To: Vinh
              </p>
              <p className="font-mono text-[10px] tracking-[0.22em] text-ink-2 uppercase">
                Form · 07
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-[0.2em] text-ink-2 uppercase">
                  Your name
                </span>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Type here…"
                  className={inputClass}
                />
                {errors.name && (
                  <span className="mt-1 font-mono text-[11px] text-tomato">
                    ✗ {errors.name.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-[0.2em] text-ink-2 uppercase">
                  Return address (email)
                </span>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@somewhere.com"
                  className={inputClass}
                />
                {errors.email && (
                  <span className="mt-1 font-mono text-[11px] text-tomato">
                    ✗ {errors.email.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-[0.2em] text-ink-2 uppercase">
                  Message
                </span>
                <textarea
                  {...register("message")}
                  rows={5}
                  placeholder="Tell me about the project, the timeline, the vibe…"
                  className="w-full resize-y rounded-[var(--r-soft)] border-[1.5px] border-ink/40 bg-transparent px-3 py-3 text-[16px] leading-relaxed text-ink placeholder:text-ink-3 focus:border-tomato focus:outline-none"
                />
                {errors.message && (
                  <span className="mt-1 font-mono text-[11px] text-tomato">
                    ✗ {errors.message.message}
                  </span>
                )}
              </label>

              <div className="mt-2 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="riso-press inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-tomato px-7 py-3.5 text-[15px] font-semibold text-paper disabled:opacity-60"
                  style={{ boxShadow: "5px 5px 0 var(--ink)" }}
                >
                  {status === "submitting" ? "Sending…" : "Stamp & Send"}
                  {status !== "submitting" && <span aria-hidden>✈</span>}
                </button>

                {status === "success" && (
                  <p
                    role="status"
                    className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-jade px-4 py-2 font-mono text-[11px] tracking-[0.14em] text-paper uppercase"
                    style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                  >
                    ✓ Postmarked — reply within a day
                  </p>
                )}
                {status === "error" && (
                  <p
                    role="status"
                    className="inline-flex items-center gap-2 font-mono text-[12px] text-tomato"
                  >
                    ✗ Failed to send. Try email direct.
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* socials as postal cards */}
          <div className="flex flex-col gap-5">
            <p className="text-[15px] leading-[1.6] text-ink-2">
              Or slide into the inbox directly — I usually reply within a day.
            </p>

            {socials.map((social, i) => {
              const accent = SOCIAL_ACCENT[i % SOCIAL_ACCENT.length];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={
                    social.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    social.href.startsWith("http") ? "noreferrer" : undefined
                  }
                  className="group flex items-center justify-between gap-4 rounded-[var(--r-round)] border-[1.5px] border-ink bg-paper p-5 transition-transform hover:-translate-y-1 hover:-translate-x-1"
                  style={{ boxShadow: `4px 4px 0 var(--${accent})` }}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className="grid h-11 w-11 flex-none place-items-center rounded-full border-[1.5px] border-ink text-[16px] font-bold text-paper"
                      style={{ background: `var(--${accent})` }}
                      aria-hidden
                    >
                      {social.label.charAt(0)}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-heading text-[15px] font-semibold text-ink">
                        {social.label}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.06em] text-ink-2">
                        {social.value}
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="text-[18px] text-ink transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  >
                    ↗
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
