import type { ReactNode } from "react";

export type StickerKind = "hello" | "star" | "code" | "smile" | "bolt" | "ship" | "heart" | "bug";

export const stickerKinds: StickerKind[] = ["star", "code", "bolt", "ship", "bug"];

const label: Record<StickerKind, string> = {
  hello: "Hello sticker",
  star: "Star sticker",
  code: "Code sticker",
  smile: "Smiley sticker",
  bolt: "Lightning sticker",
  ship: "Ship it sticker",
  heart: "Heart sticker",
  bug: "Bug sticker",
};

export function stickerLabel(k: StickerKind) {
  return label[k];
}

/** Visual for each sticker — white die-cut border + hard shadow. */
export function StickerArt({ kind, size = 64 }: { kind: StickerKind; size?: number }): ReactNode {
  const s = size;
  const common = { width: s, height: s, filter: "drop-shadow(3px 3px 0 #171717)" } as const;
  switch (kind) {
    case "hello":
      return (
        <svg viewBox="0 0 100 70" style={{ ...common, height: s * 0.7 }} aria-hidden>
          <rect x="3" y="3" width="94" height="64" rx="10" fill="#D2693A" stroke="#fff" strokeWidth="5" />
          <rect x="3" y="3" width="94" height="64" rx="10" fill="none" stroke="#171717" strokeWidth="2" />
          <text x="50" y="25" textAnchor="middle" fontFamily="Arial Black" fontSize="14" fill="#fff">HELLO</text>
          <rect x="12" y="32" width="76" height="26" fill="#fff" />
          <text x="50" y="51" textAnchor="middle" fontFamily="cursive" fontSize="17" fill="#171717">i code</text>
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 100 100" style={common} aria-hidden>
          <path d="M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z" fill="#D9A441" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
          <path d="M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z" fill="none" stroke="#171717" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 100 100" style={common} aria-hidden>
          <circle cx="50" cy="50" r="45" fill="#3E5C76" stroke="#fff" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#171717" strokeWidth="2.5" />
          <text x="50" y="62" textAnchor="middle" fontFamily="monospace" fontWeight="bold" fontSize="32" fill="#fff">&lt;/&gt;</text>
        </svg>
      );
    case "smile":
      return (
        <svg viewBox="0 0 100 100" style={common} aria-hidden>
          <circle cx="50" cy="50" r="45" fill="#D9A441" stroke="#fff" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#171717" strokeWidth="2.5" />
          <circle cx="36" cy="40" r="5" fill="#171717" />
          <circle cx="64" cy="40" r="5" fill="#171717" />
          <path d="M30 58 Q50 80 70 58" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 100 100" style={common} aria-hidden>
          <path d="M58 4 L18 58 H46 L38 96 L82 38 H54 Z" fill="#8FA05A" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
          <path d="M58 4 L18 58 H46 L38 96 L82 38 H54 Z" fill="none" stroke="#171717" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case "ship":
      return (
        <svg viewBox="0 0 110 50" style={{ ...common, width: s * 1.1, height: s * 0.5 }} aria-hidden>
          <rect x="3" y="3" width="104" height="44" fill="#171717" stroke="#fff" strokeWidth="5" />
          <text x="55" y="33" textAnchor="middle" fontFamily="Arial Black" fontSize="19" fill="#D9A441">SHIP IT!</text>
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 100 100" style={common} aria-hidden>
          <path d="M50 88 C 10 60, 4 36, 18 20 C 30 8, 46 14, 50 28 C 54 14, 70 8, 82 20 C 96 36, 90 60, 50 88 Z" fill="#D2693A" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
          <path d="M50 88 C 10 60, 4 36, 18 20 C 30 8, 46 14, 50 28 C 54 14, 70 8, 82 20 C 96 36, 90 60, 50 88 Z" fill="none" stroke="#171717" strokeWidth="2.5" />
        </svg>
      );
    case "bug":
      return (
        <svg viewBox="0 0 100 100" style={common} aria-hidden>
          <ellipse cx="50" cy="56" rx="28" ry="34" fill="#fff" stroke="#fff" strokeWidth="8" />
          <ellipse cx="50" cy="56" rx="28" ry="34" fill="#D2693A" stroke="#171717" strokeWidth="2.5" />
          <line x1="50" y1="24" x2="50" y2="90" stroke="#171717" strokeWidth="3" />
          <circle cx="50" cy="22" r="11" fill="#171717" />
          <circle cx="38" cy="50" r="5" fill="#171717" />
          <circle cx="62" cy="64" r="5" fill="#171717" />
          <path d="M22 44 L8 36 M22 62 L6 64 M24 78 L10 88 M78 44 L92 36 M78 62 L94 64 M76 78 L90 88" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
}
