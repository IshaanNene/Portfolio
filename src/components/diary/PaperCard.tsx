import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tape } from "@/components/ui/Decor";

/** Generic torn paper card with optional tape. */
export function PaperCard({
  children,
  className,
  rotate = 0,
  tape = true,
  torn = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  tape?: boolean;
  torn?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("paper-grain relative bg-[#fbf5e8] p-5 shadow-[6px_8px_0_rgba(0,0,0,.18)]", torn && "torn-bottom", className)}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      {tape && <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-[-3deg]" />}
      {children}
    </div>
  );
}
