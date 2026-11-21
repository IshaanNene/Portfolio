import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Hand } from "./Typography";

export function SectionHeading({
  children,
  note,
  className,
  id,
  as: Tag = "h2",
}: {
  children: ReactNode;
  note?: string;
  className?: string;
  id?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end gap-x-4 gap-y-1", className)}>
      <Tag id={id} className="text-3xl font-extrabold uppercase sm:text-4xl">
        <span className="scribble-underline">{children}</span>
      </Tag>
      {note && <Hand className="text-xl text-ink-soft">{note}</Hand>}
    </div>
  );
}
