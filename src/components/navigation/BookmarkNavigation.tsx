"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookHeart, Menu, X } from "lucide-react";
import { colorClass, navItems } from "@/config/nav";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { play } from "@/lib/sound";
import { UtilityButtons } from "./UtilityButtons";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

/**
 * Physical bookmark ribbons sticking out of the right edge of the "diary"
 * (desktop), and a bottom tab-strip + sheet for one-handed use (mobile).
 * Plain <Link>s — works without JS-heavy 3D being loaded.
 */
export function BookmarkNavigation() {
  const pathname = usePathname();
  const [sheet, setSheet] = useState(false);

  // close the mobile sheet when the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSheet(false);
  }

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-3 top-3 z-[100] -translate-y-24 border-[3px] border-ink bg-sun px-3 py-2 font-display font-bold shadow-brutal focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* ── Home / diary button (always visible) ── */}
      <div className="fixed left-3 top-3 z-50 flex items-center gap-2 sm:left-5 sm:top-5">
        <Link
          href="/"
          aria-label="Back to the diary cover"
          aria-current={pathname === "/" ? "page" : undefined}
          onMouseEnter={() => play("tick")}
          className="group flex items-center gap-2 border-[3px] border-ink bg-coral px-2.5 py-1.5 shadow-brutal transition-transform hover:-rotate-3 hover:scale-105"
        >
          <BookHeart className="h-5 w-5 transition-transform group-hover:-rotate-12" strokeWidth={2.5} />
          <span className="hidden font-display text-sm font-extrabold uppercase tracking-tight sm:inline">{site.firstName}&rsquo;s diary</span>
        </Link>
        <UtilityButtons />
      </div>

      {/* ── Desktop bookmark ribbons: every label stays fully inside the viewport ── */}
      <nav aria-label="Diary chapters" className="pointer-events-none fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <ul className="no-scrollbar flex max-h-[94vh] flex-col items-end gap-1 overflow-y-auto overflow-x-hidden py-2 pl-3">
          {navItems.map((item, i) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="relative" style={{ transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)` }}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => play("tick")}
                  className={cn(
                    "group pointer-events-auto relative flex h-10 items-center gap-2 border-[3px] border-r-0 border-ink pl-5 pr-2 font-display text-[13px] font-extrabold uppercase tracking-tight transition-[width,box-shadow] duration-300 ease-[var(--ease-paper)] [@media(max-height:640px)]:h-8",
                    colorClass[item.color],
                    active ? "w-44 shadow-[-5px_5px_0_#171717]" : "w-36 shadow-[-2px_3px_0_#171717] hover:w-40 focus-visible:w-40",
                  )}
                  style={{ clipPath: "polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%)" }}
                >
                  <span className="font-mono text-[10px] opacity-70">{item.page}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {active && (
                    <span className="ml-auto grid h-5 w-5 place-items-center rounded-full border-2 border-ink bg-paper" aria-hidden>
                      <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Mobile bottom tabs ── */}
      <nav
        aria-label="Diary chapters"
        className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] md:hidden"
      >
        <ul className="flex items-end justify-between gap-1">
          {[{ href: "/", label: "Cover", color: "coral" as const }, ...navItems.filter((n) => ["/now", "/projects", "/contact"].includes(n.href))].map(
            (item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center justify-center border-[3px] border-b-0 border-ink font-display text-xs font-extrabold uppercase transition-transform",
                      colorClass[item.color],
                      active ? "-translate-y-1.5 shadow-brutal" : "translate-y-1",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            },
          )}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setSheet(true)}
              aria-expanded={sheet}
              aria-controls="tab-sheet"
              className="flex h-12 w-full translate-y-1 items-center justify-center gap-1 border-[3px] border-b-0 border-ink bg-ink font-display text-xs font-extrabold uppercase text-paper"
            >
              <Menu className="h-4 w-4" /> Tabs
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-[60] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="Close tabs" className="absolute inset-0 bg-ink/40" onClick={() => setSheet(false)} />
            <motion.div
              id="tab-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="All diary chapters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t-[3px] border-ink bg-cream paper-grain px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-hand text-3xl font-bold">flip to…</span>
                <button onClick={() => setSheet(false)} className="brutal-sm bg-paper p-2" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-3">
                {[{ href: "/", label: "Cover", page: "01", color: "coral" as const, blurb: "the diary itself" }, ...navItems].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className={cn(
                        "brutal flex min-h-20 flex-col justify-between p-3",
                        colorClass[item.color],
                        isActive(pathname, item.href) && "outline-[3px] outline-offset-2 outline-ink",
                      )}
                    >
                      <span className="font-mono text-[10px] opacity-70">p.{item.page}</span>
                      <span className="font-display text-lg font-extrabold uppercase leading-none">{item.label}</span>
                      <span className="font-hand text-base leading-none opacity-80">{item.blurb}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
