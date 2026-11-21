import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "sun" | "ink" | "paper" | "coral" | "electric" | "grass";

const variants: Record<Variant, string> = {
  sun: "bg-sun text-ink",
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink",
  coral: "bg-coral text-ink",
  electric: "bg-electric text-paper",
  grass: "bg-grass text-ink",
};

const base =
  "inline-flex items-center justify-center gap-2 border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase tracking-wide shadow-brutal transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50 select-none";

type Common = { variant?: Variant; className?: string; children: ReactNode };

export function Button({ variant = "sun", className, children, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "sun",
  className,
  children,
  href,
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "href">) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, variants[variant], className)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
