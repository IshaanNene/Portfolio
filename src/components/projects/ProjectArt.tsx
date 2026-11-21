import Image from "next/image";
import type { Project } from "@/data/projects";
import { seeded } from "@/lib/utils";

/**
 * Generated neo-brutalist cover art for a project — used until a real
 * thumbnail/screenshot is supplied (project.thumbnail).
 */
export function ProjectArt({ project, className, variant = 0, label }: { project: Project; className?: string; variant?: number; label?: string }) {
  if (project.thumbnail && variant === 0) {
    return (
      <Image
        src={project.thumbnail}
        alt={`${project.name} screenshot`}
        width={800}
        height={600}
        sizes="(max-width: 640px) 90vw, 400px"
        className={className}
      />
    );
  }
  const [a, b] = project.palette;
  const r = seeded(project.slug.length * 97 + variant * 13);
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    x: r() * 300,
    y: r() * 220,
    s: 30 + r() * 90,
    k: i % 3,
    rot: r() * 90,
  }));
  const initials = project.name
    .replace(/\[.*?\]\s*/g, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label={label ?? `${project.name} — generated cover art`}>
      <rect width="320" height="240" fill={a} />
      <pattern id={`dots-${project.slug}-${variant}`} width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1.6" fill="#171717" opacity=".18" />
      </pattern>
      <rect width="320" height="240" fill={`url(#dots-${project.slug}-${variant})`} />
      {shapes.map((s, i) =>
        s.k === 0 ? (
          <circle key={i} cx={s.x} cy={s.y} r={s.s / 2} fill={i % 2 ? b : "#fff"} stroke="#171717" strokeWidth="4" />
        ) : s.k === 1 ? (
          <rect key={i} x={s.x} y={s.y} width={s.s} height={s.s * 0.6} fill={i % 2 ? "#fff" : b} stroke="#171717" strokeWidth="4" transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
        ) : (
          <path key={i} d={`M${s.x} ${s.y} q ${s.s / 2} ${-s.s / 2} ${s.s} 0 t ${s.s} 0`} fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
        ),
      )}
      {variant === 0 ? (
        <g>
          <rect x="100" y="78" width="120" height="84" fill="#171717" />
          <rect x="94" y="72" width="120" height="84" fill="#fff" stroke="#171717" strokeWidth="5" />
          <text x="154" y="130" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="44" fill="#171717">
            {initials || "★"}
          </text>
        </g>
      ) : (
        <g>
          <rect x="30" y="30" width="260" height="180" fill="#fff" stroke="#171717" strokeWidth="5" />
          <rect x="30" y="30" width="260" height="24" fill="#171717" />
          <circle cx="44" cy="42" r="5" fill="#FF755E" />
          <circle cx="60" cy="42" r="5" fill="#FFD84D" />
          <circle cx="76" cy="42" r="5" fill="#9DDC8B" />
          <rect x="48" y="72" width={110 + variant * 20} height="14" fill={b} />
          <rect x="48" y="96" width="200" height="8" fill="#171717" opacity=".25" />
          <rect x="48" y="112" width="170" height="8" fill="#171717" opacity=".25" />
          <rect x="48" y="136" width="90" height="52" fill={a} stroke="#171717" strokeWidth="3" />
          <rect x="150" y="136" width="120" height="52" fill="#F5EBD8" stroke="#171717" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}
