import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Content column that leaves room for the bookmark ribbons and top buttons. */
export function PageShell({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div className={cn("mx-auto w-full px-4 pt-16 sm:px-8 md:pr-40 md:pt-20", wide ? "max-w-[90rem]" : "max-w-7xl", className)}>
      {children}
    </div>
  );
}
