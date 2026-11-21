import Link from "next/link";
import { site } from "@/config/site";

/** Little "currently available / building" badge. */
export function StatusPill() {
  const { available, label, building } = site.status;
  return (
    <Link
      href="/now"
      className="group flex max-w-[17rem] rotate-1 items-start gap-2 border-[3px] border-ink bg-paper px-3 py-2 shadow-brutal transition-transform hover:-rotate-1"
    >
      <span
        className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-ink ${available ? "bg-[#2fa046] animate-pulse-dot" : "bg-coral"}`}
        aria-hidden
      />
      <span className="leading-tight">
        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em]">{label.replace("[PLACEHOLDER] ", "")}</span>
        <span className="block font-hand text-lg font-bold">building: {building.replace("[PLACEHOLDER] ", "")}</span>
      </span>
    </Link>
  );
}
