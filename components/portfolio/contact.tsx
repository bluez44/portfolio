"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { contactSchema, type ContactFormValues } from "@/lib/schemas/contact";
import { socials } from "@/lib/portfolio-data";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const socialsRef = useScrollReveal<HTMLDivElement>(true);
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

  return (
    <section
      id="contact"
      className="border-t border-line px-6 py-[clamp(72px,10vw,120px)]"
      style={{ background: "var(--bg2)" }}
    >
      <div ref={revealRef} className="mx-auto max-w-280">
        <p className="mb-2.5 font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          06 / Contact
        </p>
        <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          Let&apos;s build something
        </h2>
        <div className="grid items-start gap-11 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.75 text-[13px] font-semibold text-muted">
              Name
              <input
                {...register("name")}
                type="text"
                placeholder="Sender name"
                className="rounded-[10px] border border-panel-border bg-panel px-3.75 py-3.25 text-[14.5px] text-fg"
              />
              {errors.name && (
                <span className="text-xs font-normal text-red-400">
                  {errors.name.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1.75 text-[13px] font-semibold text-muted">
              Email
              <input
                {...register("email")}
                type="email"
                placeholder="youremail@example.com"
                className="rounded-[10px] border border-panel-border bg-panel px-3.75 py-3.25 text-[14.5px] text-fg"
              />
              {errors.email && (
                <span className="text-xs font-normal text-red-400">
                  {errors.email.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1.75 text-[13px] font-semibold text-muted">
              Message
              <textarea
                {...register("message")}
                rows={5}
                placeholder="Tell me about your project…"
                className="resize-y rounded-[10px] border border-panel-border bg-panel px-3.75 py-3.25 text-[14.5px] text-fg"
              />
              {errors.message && (
                <span className="text-xs font-normal text-red-400">
                  {errors.message.message}
                </span>
              )}
            </label>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1.5 rounded-[10px] bg-accent p-3.5 text-[15px] font-semibold text-white shadow-[0_0_20px_var(--glow)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send Message"}
            </button>
            {status === "success" && (
              <p role="status" className="text-[13.5px] text-accent">
                Message sent — thanks for reaching out, I&apos;ll reply within a day.
              </p>
            )}
            {status === "error" && (
              <p role="status" className="text-[13.5px] text-red-400">
                Something went wrong sending your message. Please try again or
                email me directly.
              </p>
            )}
          </form>
          <div ref={socialsRef} className="flex flex-col gap-3.5">
            <p className="mb-1.5 text-[15px] leading-[1.7] text-muted">
              Prefer email or socials? I usually reply within a day.
            </p>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-panel-border bg-panel p-[17px_20px] backdrop-blur-sm transition hover:translate-x-1 hover:border-accent"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-[14.5px] font-semibold">{social.label}</span>
                  <span className="text-[12.5px] text-muted">{social.value}</span>
                </span>
                <span aria-hidden className="text-accent">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
