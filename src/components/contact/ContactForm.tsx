"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { site } from "@/config/site";
import { play } from "@/lib/sound";
import { Button } from "@/components/ui/Button";
import { RubberStamp } from "@/components/ui/Decor";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

/**
 * Contact form. POSTs JSON to `site.contact.formEndpoint` when configured,
 * otherwise composes an email in the visitor's mail app (no backend needed).
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("company")) return; // honeypot
    const data = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };
    const errs: Record<string, string> = {};
    if (!data.name) errs.name = "who's writing?";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errs.email = "that email looks smudged";
    if (data.message.length < 10) errs.message = "a few more words, please";
    setErrors(errs);
    if (Object.keys(errs).length) {
      play("thunk");
      return;
    }

    if (!site.contact.formEndpoint) {
      const subject = encodeURIComponent(`Hello from your diary — ${data.name}`);
      const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
      window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
      setStatus("mailto");
      play("stamp");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(site.contact.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      play("stamp");
      e.currentTarget?.reset();
    } catch {
      setStatus("error");
    }
  };

  const field = "w-full border-[3px] border-ink bg-paper px-3 py-2 font-mono text-sm outline-none transition-shadow focus:shadow-brutal";

  return (
    <form onSubmit={onSubmit} noValidate className="relative">
      <p className="font-display text-2xl font-extrabold uppercase">Write back</p>
      <p className="font-hand text-xl text-ink-soft">or just say hi — no wrong answers.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Your name</span>
          <input name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined} />
          {errors.name && <span id="err-name" className="font-hand text-lg text-coral">{errors.name}</span>}
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Your email</span>
          <input name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined} />
          {errors.email && <span id="err-email" className="font-hand text-lg text-coral">{errors.email}</span>}
        </label>
        <label className="block sm:col-span-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Message</span>
          <textarea name="message" rows={5} className={`${field} ruled resize-y bg-[#fffdf7] leading-8`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "err-message" : undefined} />
          {errors.message && <span id="err-message" className="font-hand text-lg text-coral">{errors.message}</span>}
        </label>
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="submit" variant="coral" disabled={status === "sending"}>
          {status === "sending" ? "Posting…" : "Send letter"} <Send className="h-4 w-4" />
        </Button>
        <AnimatePresence>
          {(status === "sent" || status === "mailto") && (
            <motion.span initial={{ scale: 2, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: -8 }}>
              <RubberStamp color="#2f8a3a">{status === "sent" ? "Delivered" : "Opened your mail app"}</RubberStamp>
            </motion.span>
          )}
          {status === "error" && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-hand text-xl text-coral" role="alert">
              the post office lost it — try emailing directly?
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
