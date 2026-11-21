"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { site } from "@/config/site";
import { play } from "@/lib/sound";
import { BrandIcon } from "./Polaroid";
import { ContactForm } from "@/components/contact/ContactForm";
import { PostageStamp, Washi } from "@/components/ui/Scrapbook";

type Stage = "sealed" | "opening" | "open";

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(site.contact.email);
          setCopied(true);
          play("pop");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked — the mailto link still works */
        }
      }}
      className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-ink bg-paper shadow-brutal-sm"
      aria-label={copied ? "Email copied" : "Copy email address"}
    >
      {copied ? <Check className="h-4 w-4 text-[#2f8a3a]" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

/** One panel of the folded letter — unfolds along its top edge. */
function Fold({ children, index, open, reduced }: { children: React.ReactNode; index: number; open: boolean; reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { rotateX: index === 0 ? 0 : -165, opacity: index === 0 ? 1 : 0.6 }}
      animate={open ? { rotateX: 0, opacity: 1 } : undefined}
      transition={{ delay: 0.25 + index * 0.35, duration: 0.6, ease: [0.3, 0.7, 0.3, 1] }}
      style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
      className="relative border-t-2 border-dashed border-ink/20 first:border-t-0"
    >
      {children}
    </motion.div>
  );
}

/**
 * The sealed contact envelope. Break the wax seal → flap opens → the letter
 * slides out and unfolds into three panels (note, links, form).
 */
export function Envelope() {
  const [stage, setStage] = useState<Stage>("sealed");
  const reduced = !!useReducedMotion();

  const open = () => {
    if (stage !== "sealed") return;
    play("stamp");
    setStage("opening");
    setTimeout(() => {
      play("paper");
      setStage("open");
    }, reduced ? 0 : 1300);
  };

  return (
    <div className="mx-auto max-w-3xl [perspective:1400px]">
      <AnimatePresence mode="popLayout">
        {stage !== "open" ? (
          <motion.div key="env" exit={{ y: 120, opacity: 0, rotate: 4, transition: { duration: 0.5 } }} className="relative mx-auto aspect-[3/2] w-full max-w-2xl">
            {/* back of envelope */}
            <div className="absolute inset-0 border-[3px] border-ink bg-kraft shadow-brutal-xl" />
            {/* the letter peeking / sliding */}
            <motion.div
              className="absolute inset-x-[7%] top-[8%] h-[80%] border-[3px] border-ink bg-[#fbf5e8] p-5"
              animate={stage === "opening" ? { y: "-55%" } : { y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: [0.3, 0.7, 0.3, 1] }}
            >
              <p className="font-hand text-3xl font-bold">Dear visitor,</p>
              <div className="mt-3 space-y-2" aria-hidden>
                <div className="h-2 w-3/4 bg-ink/15" />
                <div className="h-2 w-2/3 bg-ink/15" />
              </div>
            </motion.div>
            {/* front pocket (two side flaps + bottom) */}
            <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <path d="M0 0 L150 112 L300 0 L300 200 L0 200 Z" fill="#d8b688" stroke="#171717" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
              <path d="M0 200 L130 100 M300 200 L170 100" stroke="#171717" strokeOpacity=".35" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* stamp + address */}
            <div className="pointer-events-none absolute bottom-[10%] left-[8%] font-hand text-xl leading-tight text-ink sm:text-3xl">
              To: whoever reads this
              <br />
              c/o {site.name}&rsquo;s diary
            </div>
            <div className="pointer-events-none absolute bottom-[10%] right-[6%] rotate-6 border-[3px] border-dashed border-ink bg-coral p-1.5 sm:p-2" aria-hidden>
              <div className="grid h-12 w-10 place-items-center border-2 border-ink bg-sun font-display text-lg font-extrabold sm:h-16 sm:w-14">{site.initials}</div>
            </div>
            {/* airmail edging along the bottom */}
            <div
              className="pointer-events-none absolute inset-x-[3px] bottom-[3px] h-2.5"
              style={{ background: "repeating-linear-gradient(-45deg, #D2693A 0 12px, #fbf5e8 12px 20px, #3E5C76 20px 32px, #fbf5e8 32px 40px)" }}
              aria-hidden
            />
            <div className="pointer-events-none absolute bottom-[34%] right-[18%] hidden origin-bottom-right scale-[0.62] sm:block">
              <PostageStamp value="2¢" label="first class" color="bg-electric" rotate={-7} />
            </div>
            <span className="pointer-events-none absolute bottom-[6%] right-[22%] hidden -rotate-6 border-[3px] border-coral px-2 font-display text-sm font-extrabold uppercase tracking-widest text-coral opacity-80 sm:block" aria-hidden>
              par avion
            </span>
            {/* top flap */}
            <motion.svg
              viewBox="0 0 300 120"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-0 h-[60%] w-full"
              style={{ transformOrigin: "50% 0%", zIndex: stage === "opening" ? 0 : 2 }}
              animate={{ rotateX: stage === "opening" ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.5, 0, 0.3, 1] }}
              aria-hidden
            >
              <path d="M0 0 L150 112 L300 0 Z" fill="#c8a374" stroke="#171717" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
            </motion.svg>
            {/* wax seal */}
            <AnimatePresence>
              {stage === "sealed" && (
                <motion.button
                  type="button"
                  onClick={open}
                  exit={{ scale: 1.4, opacity: 0, rotate: 40 }}
                  whileHover={{ scale: 1.08, rotate: -6 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-1/2 top-[56%] z-10 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink bg-[#c0392b] text-cream shadow-brutal sm:h-28 sm:w-28"
                  style={{ borderRadius: "48% 52% 50% 50% / 52% 47% 53% 48%" }}
                  aria-label="Break the wax seal to open the envelope"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-cream/60 font-serif text-3xl font-black italic sm:h-20 sm:w-20">
                    {site.initials}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
            {stage === "sealed" && (
              <p className="absolute -bottom-12 left-0 right-0 text-center font-hand text-2xl font-bold">↑ break the seal</p>
            )}
          </motion.div>
        ) : (
          <motion.article
            key="letter"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="paper-grain relative mx-auto border-[3px] border-ink bg-[#fbf5e8] shadow-brutal-xl"
            aria-label="Letter"
          >
            <Washi pattern="dots" color="#D2693A" className="-top-3 left-10 -rotate-6" />
            <Washi pattern="stripe" color="#8FA05A" className="-top-3 right-10 rotate-[7deg]" />
            <Fold index={0} open reduced={reduced}>
              <div className="p-6 sm:p-10">
                <p className="font-hand text-4xl font-bold">Dear visitor,</p>
                <p className="mt-3 max-w-xl font-hand text-2xl leading-snug">{site.contact.message.replace("[PLACEHOLDER] ", "")}</p>
                <p className="mt-4 text-right font-hand text-3xl font-bold text-electric">— {site.firstName}</p>
              </div>
            </Fold>
            <Fold index={1} open reduced={reduced}>
              <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-10">
                <div className="flex items-center gap-2 sm:col-span-3">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="flex min-w-0 flex-1 items-center gap-3 border-[3px] border-ink bg-sun px-4 py-3 shadow-brutal transition-transform hover:-translate-y-0.5"
                  >
                    <Mail className="h-5 w-5 shrink-0" />
                    <span className="truncate font-display text-lg font-extrabold sm:text-2xl">{site.contact.email}</span>
                  </a>
                  <CopyEmail />
                </div>
                <a
                  href={site.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border-[3px] border-ink bg-paper px-4 py-3 shadow-brutal transition-transform hover:-rotate-1 sm:col-span-1"
                >
                  <BrandIcon path={siGithub.path} className="h-5 w-5" />
                  <span className="font-display font-extrabold uppercase">GitHub</span>
                </a>
                <a
                  href={site.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border-[3px] border-ink bg-electric px-4 py-3 text-paper shadow-brutal transition-transform hover:rotate-1 sm:col-span-1"
                >
                  <span className="grid h-5 w-5 place-items-center bg-paper font-sans text-xs font-black text-electric">in</span>
                  <span className="font-display font-extrabold uppercase">LinkedIn</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setStage("sealed");
                    play("paper");
                  }}
                  className="border-[3px] border-dashed border-ink px-4 py-3 font-mono text-xs uppercase"
                >
                  re-seal envelope
                </button>
              </div>
            </Fold>
            <Fold index={2} open reduced={reduced}>
              <div className="p-6 sm:p-10">
                <ContactForm />
              </div>
            </Fold>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}
