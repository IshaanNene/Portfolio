/**
 * Procedural canvas textures for the diary + desk.
 * Everything is painted at runtime — no image downloads except the photo.
 * All painters draw in a logical 1000×1400 page space and are scaled.
 */
import * as THREE from "three";
import { navItems } from "@/config/nav";
import { site } from "@/config/site";
import type { Doodle, PageFace } from "@/data/diary";
import { seeded } from "@/lib/utils";

export const PAGE_W = 1000;
export const PAGE_H = 1400;
const INK = "#171717";

export type Fonts = { display: string; hand: string; mono: string; serif: string };
export type LinkRect = { x: number; y: number; w: number; h: number; href: string };
export type Painted = { texture: THREE.CanvasTexture; links: LinkRect[] };

export function readFonts(): Fonts {
  const cs = getComputedStyle(document.documentElement);
  const get = (v: string, fb: string) => cs.getPropertyValue(v).trim() || fb;
  return {
    display: get("--font-bricolage", "Arial Black, sans-serif"),
    hand: get("--font-caveat", "cursive"),
    mono: get("--font-jetbrains", "monospace"),
    serif: get("--font-playfair", "Georgia, serif"),
  };
}

export async function loadFonts(f: Fonts) {
  try {
    await Promise.all([
      document.fonts.load(`800 60px ${f.display}`),
      document.fonts.load(`700 60px ${f.hand}`),
      document.fonts.load(`500 30px ${f.mono}`),
    ]);
    await document.fonts.ready;
  } catch {
    /* fonts are an enhancement */
  }
}

function canvas(scale: number, w = PAGE_W, h = PAGE_H) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  const ctx = c.getContext("2d")!;
  ctx.scale(scale, scale);
  return { c, ctx };
}

function toTexture(c: HTMLCanvasElement, maxAniso = 8) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/* ───────────── drawing helpers ───────────── */

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed = 1, dark = "0,0,0") {
  const r = seeded(seed);
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle = `rgba(${dark},${0.02 + r() * 0.05})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2.2, 1 + r() * 2.2);
  }
  // fibres
  ctx.lineWidth = 1;
  for (let i = 0; i < amount / 40; i++) {
    ctx.strokeStyle = `rgba(${dark},${0.03 + r() * 0.04})`;
    const x = r() * w;
    const y = r() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + r() * 20 - 10, y + r() * 20 - 10, x + r() * 40 - 20, y + r() * 40 - 20);
    ctx.stroke();
  }
}

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength = 0.18) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(60,40,10,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function paper(ctx: CanvasRenderingContext2D, base = "#FBF5E8", seed = 3, w = PAGE_W, h = PAGE_H) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 9000, seed, "90,60,20");
  vignette(ctx, w, h, 0.16);
}

/** spine-side shading so the page looks like it dips into the gutter */
function gutter(ctx: CanvasRenderingContext2D, side: "left" | "right") {
  const g = side === "left" ? ctx.createLinearGradient(0, 0, 120, 0) : ctx.createLinearGradient(PAGE_W, 0, PAGE_W - 120, 0);
  g.addColorStop(0, "rgba(70,45,15,0.28)");
  g.addColorStop(1, "rgba(70,45,15,0)");
  ctx.fillStyle = g;
  ctx.fillRect(side === "left" ? 0 : PAGE_W - 120, 0, 120, PAGE_H);
}

/** Sepia body ink and blue-black fountain-pen ink for the inside pages. */
const SEPIA = "#2a1d14";
const PEN = "#1e2f4a";

/** Old journal paper: yellowed, foxed, darker toward the edges. */
function agedPaper(ctx: CanvasRenderingContext2D, seed: number, base = "#ece0c6") {
  const r = seeded(seed * 13 + 1);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  // uneven toning
  for (let i = 0; i < 14; i++) {
    const x = r() * PAGE_W;
    const y = r() * PAGE_H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 150 + r() * 350);
    g.addColorStop(0, r() > 0.5 ? "rgba(160,120,60,0.07)" : "rgba(255,250,235,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  }
  grain(ctx, PAGE_W, PAGE_H, 9000, seed, "90,60,20");
  // foxing: small rust-brown spots in loose clusters
  for (let c = 0; c < 5; c++) {
    const cx = r() * PAGE_W;
    const cy = r() * PAGE_H;
    for (let i = 0; i < 14; i++) {
      const rad = 1 + r() * 5;
      ctx.fillStyle = `rgba(140,90,40,${0.08 + r() * 0.18})`;
      ctx.beginPath();
      ctx.arc(cx + (r() - 0.5) * 140, cy + (r() - 0.5) * 140, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // the odd faint water mark
  if (seed % 3 === 0) {
    ctx.strokeStyle = "rgba(130,90,40,0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(r() * PAGE_W, r() * PAGE_H, 120 + r() * 80, 90 + r() * 60, r() * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  // edges yellow and darken with handling
  const g = ctx.createRadialGradient(PAGE_W / 2, PAGE_H / 2, PAGE_W * 0.4, PAGE_W / 2, PAGE_H / 2, PAGE_H * 0.78);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(110,70,20,0.2)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
}

/** Thin double-ruled frame — bookplates, boxes, buttons. */
function plate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill?: string) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 9, y + 9, w - 18, h - 18);
}

function ruled(ctx: CanvasRenderingContext2D, top = 190, gap = 58, margin = 120) {
  ctx.strokeStyle = "rgba(40,60,90,0.16)";
  ctx.lineWidth = 1.5;
  for (let y = top; y < PAGE_H - 60; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PAGE_W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(120,30,20,0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, 0);
  ctx.lineTo(margin, PAGE_H);
  ctx.stroke();
}

function jitter(r: () => number, n: number) {
  return (r() * 2 - 1) * n;
}

function sketchLine(ctx: CanvasRenderingContext2D, r: () => number, x1: number, y1: number, x2: number, y2: number, wob = 3) {
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    ctx.moveTo(x1 + jitter(r, wob), y1 + jitter(r, wob));
    ctx.quadraticCurveTo((x1 + x2) / 2 + jitter(r, wob * 2), (y1 + y2) / 2 + jitter(r, wob * 2), x2 + jitter(r, wob), y2 + jitter(r, wob));
    ctx.stroke();
  }
}

function sketchRect(ctx: CanvasRenderingContext2D, r: () => number, x: number, y: number, w: number, h: number, wob = 3) {
  sketchLine(ctx, r, x, y, x + w, y, wob);
  sketchLine(ctx, r, x + w, y, x + w, y + h, wob);
  sketchLine(ctx, r, x + w, y + h, x, y + h, wob);
  sketchLine(ctx, r, x, y + h, x, y, wob);
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill?: string) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.stroke();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function brutalBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, shadow = 12, lw = 8) {
  ctx.fillStyle = INK;
  ctx.fillRect(x + shadow, y + shadow, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = lw;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x, y, w, h);
}

function tape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, rot: number, color = "rgba(255,240,180,0.78)") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  const h = 46;
  ctx.moveTo(-w / 2, -h / 2);
  for (let i = 0; i <= 6; i++) ctx.lineTo(-w / 2 + (i % 2 ? 6 : 0), -h / 2 + (i * h) / 6);
  ctx.lineTo(w / 2, h / 2);
  for (let i = 6; i >= 0; i--) ctx.lineTo(w / 2 - (i % 2 ? 6 : 0), -h / 2 + (i * h) / 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ───────────── scrapbook bits ───────────── */

type Pattern = "stripe" | "dots" | "grid" | "check";

/** Patterned washi tape with zig-zag torn ends. (x, y) is the strip's centre. */
function washi(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, rot: number, color: string, pattern: Pattern, h = 58) {
  ctx.save();
  ctx.translate(x - 0, y);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  const steps = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  for (let k = 0; k <= steps; k++) ctx.lineTo(w - (k % 2 ? 7 : 0), (k * h) / steps);
  ctx.lineTo(0, h);
  for (let k = steps; k >= 0; k--) ctx.lineTo(k % 2 ? 7 : 0, (k * h) / steps);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.save();
  ctx.translate(3, 4);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.clip();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#FFFFFF";
  if (pattern === "stripe") {
    for (let i = -h; i < w + h; i += 26) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 11, 0);
      ctx.lineTo(i + 11 + h, h);
      ctx.lineTo(i + h, h);
      ctx.fill();
    }
  } else if (pattern === "dots") {
    for (let yy = 10; yy < h; yy += 20)
      for (let xx = (yy / 20) % 2 ? 10 : 20; xx < w; xx += 22) {
        ctx.beginPath();
        ctx.arc(xx, yy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
  } else if (pattern === "grid") {
    ctx.lineWidth = 2;
    for (let i = 8; i < w; i += 16) ctx.fillRect(i, 0, 2, h);
    for (let i = 8; i < h; i += 16) ctx.fillRect(0, i, w, 2);
  } else {
    for (let yy = 0; yy < h; yy += 14) for (let xx = (yy / 14) % 2 ? 0 : 14; xx < w; xx += 28) ctx.fillRect(xx, yy, 14, 14);
  }
  ctx.restore();
}

/** A scrap of coloured paper with ragged, hand-torn edges. */

/** Postage stamp with perforated edge and an optional ink postmark. */
function postageStamp(
  ctx: CanvasRenderingContext2D,
  f: Fonts,
  x: number,
  y: number,
  rot: number,
  color: string,
  value: string,
  label: string,
  bg = "#FBF5E8",
  postmark = true,
) {
  const w = 150;
  const h = 180;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(5, 7, w, h);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = bg;
  for (let i = 0; i <= w; i += 15) {
    ctx.beginPath();
    ctx.arc(i, 0, 5, 0, Math.PI * 2);
    ctx.arc(i, h, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i <= h; i += 15) {
    ctx.beginPath();
    ctx.arc(0, i, 5, 0, Math.PI * 2);
    ctx.arc(w, i, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.fillRect(14, 14, w - 28, h - 28);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  // tiny sun-over-hills illustration
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(w * 0.62, 70, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(23,23,23,0.8)";
  ctx.beginPath();
  ctx.moveTo(14, 130);
  ctx.quadraticCurveTo(50, 92, 80, 118);
  ctx.quadraticCurveTo(110, 96, w - 14, 112);
  ctx.lineTo(w - 14, 140);
  ctx.lineTo(14, 140);
  ctx.fill();
  ctx.fillStyle = color === "#477BFF" ? "#FFFFFF" : INK;
  ctx.font = `800 34px ${f.display}`;
  ctx.fillText(value, 22, 50);
  ctx.font = `500 13px ${f.mono}`;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(label.toUpperCase().slice(0, 14), 22, h - 22);
  ctx.restore();
  if (!postmark) return;
  // postmark (drawn un-rotated so it overlaps the stamp edge)
  ctx.save();
  ctx.translate(x + w * 0.95, y + h * 0.3);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#2a3d8f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#2a3d8f";
  ctx.font = `700 15px ${f.mono}`;
  ctx.textAlign = "center";
  ctx.fillText("DEV DIARY", 0, -12);
  ctx.fillText("★ 2026 ★", 0, 10);
  ctx.textAlign = "left";
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) ctx.lineTo(66 + i * 8, -24 + k * 16 + Math.sin(i * 1.1) * 5);
    ctx.stroke();
  }
  ctx.restore();
}

/** Ticket stub with notched perforation. */
function ticketStub(ctx: CanvasRenderingContext2D, f: Fonts, x: number, y: number, rot: number, color: string, title: string, no: number, bg = "#FBF5E8") {
  const w = 340;
  const h = 150;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(5, 7, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(250, 0, 14, 0, Math.PI * 2);
  ctx.arc(250, h, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(250, 18);
  ctx.lineTo(250, h - 18);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeRect(10, 10, 226, h - 20);
  const ink = color === "#477BFF" ? "#FFFFFF" : INK;
  ctx.fillStyle = ink;
  ctx.font = `500 15px ${f.mono}`;
  ctx.fillText("ADMIT ONE · VISITOR", 24, 38);
  const t = title.toUpperCase();
  let fs = 40;
  ctx.font = `800 ${fs}px ${f.display}`;
  while (ctx.measureText(t).width > 205 && fs > 20) {
    fs -= 2;
    ctx.font = `800 ${fs}px ${f.display}`;
  }
  ctx.fillText(t, 24, 88);
  ctx.font = `500 15px ${f.mono}`;
  ctx.fillText("ROW P · SEAT " + (no + 1), 24, 120);
  ctx.save();
  ctx.translate(296, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.font = `700 18px ${f.mono}`;
  ctx.fillText("No. 00" + (no + 1), 0, 6);
  ctx.restore();
  ctx.restore();
}

/** Small polaroid with a coloured "photo" and handwritten caption. */
function miniPolaroid(ctx: CanvasRenderingContext2D, f: Fonts, r: () => number, x: number, y: number, rot: number, color: string, caption: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(6, 8, 230, 270);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 230, 270);
  ctx.fillStyle = color;
  ctx.fillRect(16, 16, 198, 186);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(60 + r() * 100, 70, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(23,23,23,0.75)";
  ctx.beginPath();
  ctx.moveTo(16, 202);
  ctx.lineTo(90, 120 + r() * 30);
  ctx.lineTo(140, 170);
  ctx.lineTo(180, 140);
  ctx.lineTo(214, 190);
  ctx.lineTo(214, 202);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, 198, 186);
  ctx.fillStyle = INK;
  ctx.font = `700 36px ${f.hand}`;
  ctx.fillText(caption, 22, 250);
  ctx.restore();
}

function coffeeRing(ctx: CanvasRenderingContext2D, r: () => number, x: number, y: number, rad: number) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(120,70,25,${0.1 + r() * 0.08})`;
    ctx.lineWidth = 4 + r() * 8;
    ctx.beginPath();
    ctx.arc(x + jitter(r, 3), y + jitter(r, 3), rad - i * 5, r() * 0.6, Math.PI * 2 - r() * 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

function starSticker(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number, color: string) {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 14;
  star(ctx, x, y, rad);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  star(ctx, x, y, rad, color);
  ctx.restore();
}

/** Paper clip drawn as a rounded wire loop. */

const WASHI: { color: string; pattern: Pattern }[] = [
  { color: "#FF755E", pattern: "stripe" },
  { color: "#477BFF", pattern: "dots" },
  { color: "#9DDC8B", pattern: "grid" },
  { color: "#FFD84D", pattern: "check" },
];

/** Tape the outer top corner of a page with washi. */
function cornerWashi(ctx: CanvasRenderingContext2D, side: "left" | "right", n: number, y = 52) {
  const t = WASHI[n % WASHI.length];
  const outerX = side === "right" ? PAGE_W - 90 : 90;
  washi(ctx, outerX, y, 230, side === "right" ? 0.62 : -0.62, t.color, t.pattern);
}

/** The scrapbook extras on a chapter page, placed in the free lower-left area. */
/** A torn scrap with a few lines of syntax-coloured code. */
function codeScrap(ctx: CanvasRenderingContext2D, f: Fonts, r: () => number, x: number, y: number, rot: number, title: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(10, 12, 370, 210);
  ctx.fillStyle = "#171717";
  ctx.fillRect(0, 0, 370, 210);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(0, 0, 370, 34);
  ["#FF755E", "#FFD84D", "#9DDC8B"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(22 + i * 22, 17, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  const slug = title.toLowerCase().replace(/[^a-z]/g, "");
  const lines: [string, string][][] = [
    [["fn ", "#FF755E"], [`${slug}()`, "#FFD84D"], [" {", "#F5EBD8"]],
    [["  let ", "#FF755E"], ["ideas", "#F5EBD8"], [" = ", "#F5EBD8"], ["read()", "#9DDC8B"], [";", "#F5EBD8"]],
    [["  ship", "#477BFF"], ["(ideas)", "#F5EBD8"], ["?", "#FF755E"], [";", "#F5EBD8"]],
    [["}", "#F5EBD8"], [" // TODO: tests", "rgba(245,235,216,0.45)"]],
  ];
  ctx.font = `500 22px ${f.mono}`;
  lines.forEach((parts, i) => {
    let cx = 20;
    parts.forEach(([t, c]) => {
      ctx.fillStyle = c;
      ctx.fillText(t, cx, 76 + i * 34);
      cx += ctx.measureText(t).width;
    });
  });
  ctx.restore();
  tape(ctx, x + 150, y - 6, 140, rot + 0.1);
  void r;
}

/** Pencil architecture sketch: three boxes and arrows, labelled by hand. */
function archSketch(ctx: CanvasRenderingContext2D, f: Fonts, r: () => number, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(42,29,20,0.8)";
  ctx.lineWidth = 2.5;
  const boxes: [number, number, string][] = [
    [0, 0, "client"],
    [180, 0, "api"],
    [180, 130, "queue"],
  ];
  boxes.forEach(([bx, by]) => sketchRect(ctx, r, bx, by, 130, 70, 2));
  sketchLine(ctx, r, 130, 35, 178, 35, 1);
  sketchLine(ctx, r, 168, 28, 178, 35, 1);
  sketchLine(ctx, r, 168, 42, 178, 35, 1);
  sketchLine(ctx, r, 245, 72, 245, 128, 1);
  sketchLine(ctx, r, 238, 118, 245, 128, 1);
  sketchLine(ctx, r, 252, 118, 245, 128, 1);
  ctx.fillStyle = SEPIA;
  ctx.font = `700 34px ${f.hand}`;
  boxes.forEach(([bx, by, label]) => ctx.fillText(label, bx + 18, by + 46));
  ctx.fillStyle = "#FF755E";
  ctx.font = `700 30px ${f.hand}`;
  ctx.fillText("← retry w/ backoff", 320, 176);
  // highlighter swipe under the title
  ctx.fillStyle = "rgba(255,216,77,0.55)";
  ctx.fillRect(-6, -54, 200, 24);
  ctx.fillStyle = SEPIA;
  ctx.font = `500 22px ${f.mono}`;
  ctx.fillText("FIG. 1 — data flow", 0, -36);
  ctx.restore();
}

/** Rubber date stamp. */
function dateStamp(ctx: CanvasRenderingContext2D, f: Fonts, x: number, y: number, rot: number, text: string, color = "#FF755E") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.font = `700 26px ${f.mono}`;
  const w = ctx.measureText(text).width + 36;
  ctx.strokeRect(0, 0, w, 50);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(5, 5, w - 10, 40);
  ctx.fillStyle = color;
  ctx.fillText(text, 18, 34);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function chapterScraps(ctx: CanvasRenderingContext2D, f: Fonts, r: () => number, side: "left" | "right", pageNo: number, color: string, title: string) {
  const accent = color === "#FFFFFF" ? "#FFD84D" : color;
  const v = pageNo % 4;
  if (v === 0) {
    ticketStub(ctx, f, 140, 900, -0.08, accent, title, pageNo);
  } else if (v === 1) {
    codeScrap(ctx, f, r, 140, 880, -0.05, title);
  } else if (v === 2) {
    miniPolaroid(ctx, f, r, 160, 840, 0.07, accent, title.toLowerCase());
  } else {
    archSketch(ctx, f, r, 150, 920);
  }
  cornerWashi(ctx, side, pageNo);
  dateStamp(ctx, f, side === "right" ? 640 : 680, 130, 0.06, ["03 JAN 26", "17 MAR 26", "02 JUN 26", "21 NOV 26"][pageNo % 4]);
  starSticker(ctx, side === "right" ? 860 : 880, 610, 30, WASHI[(pageNo + 2) % 4].color);
  if (pageNo % 3 === 1) coffeeRing(ctx, r, side === "right" ? 780 : 820, 1320, 90);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

/** Film grain, a warm light leak and an orange date stamp over a photo area. */
function filmLook(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number, date?: string) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const leak = ctx.createRadialGradient(x + w, y, 0, x + w, y, w * 0.8);
  leak.addColorStop(0, "rgba(255,170,90,0.28)");
  leak.addColorStop(1, "rgba(255,170,90,0)");
  ctx.fillStyle = leak;
  ctx.fillRect(x, y, w, h);
  const r = seeded(seed);
  for (let i = 0; i < (w * h) / 90; i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${r() * 0.08})` : `rgba(0,0,0,${r() * 0.1})`;
    ctx.fillRect(x + r() * w, y + r() * h, 1.4, 1.4);
  }
  const v = ctx.createRadialGradient(x + w / 2, y + h / 2, w * 0.3, x + w / 2, y + h / 2, w * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(30,15,0,0.25)");
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);
  if (date) {
    ctx.fillStyle = "rgba(255,140,40,0.9)";
    ctx.font = "700 18px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.fillText(date, x + w - 10, y + h - 10);
  }
  ctx.restore();
}

/** Desk Polaroid: loads `src` if it exists, otherwise paints a placeholder scene. */
export async function paintDeskPhoto(f: Fonts, p: { src?: string; caption: string; date?: string }, bg: string, seed: number) {
  const { c, ctx } = canvas(1.2, 320, 380);
  ctx.fillStyle = "#fbfbf7";
  ctx.fillRect(0, 0, 320, 380);
  grain(ctx, 320, 380, 900, seed, "60,50,30");
  const img = p.src ? await loadImage(p.src) : null;
  if (img) drawCover(ctx, img, 18, 18, 284, 270);
  else {
    const r = seeded(seed);
    ctx.fillStyle = bg;
    ctx.fillRect(18, 18, 284, 270);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(80 + r() * 160, 90 + r() * 40, 30 + r() * 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(23,23,23,0.75)";
    ctx.beginPath();
    ctx.moveTo(18, 288);
    ctx.lineTo(120 + r() * 40, 160 + r() * 40);
    ctx.lineTo(200, 230);
    ctx.lineTo(250, 190);
    ctx.lineTo(302, 260);
    ctx.lineTo(302, 288);
    ctx.closePath();
    ctx.fill();
  }
  filmLook(ctx, 18, 18, 284, 270, seed + 3, p.date ? p.date.replace(/^\[|\]$/g, "") : undefined);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, 284, 270);
  ctx.fillStyle = INK;
  ctx.font = `700 34px ${f.hand}`;
  ctx.fillText(p.caption, 26, 340);
  return toTexture(c, 4);
}

/** Handwritten note straight on the desk, with an optional arrow toward something. */
export function paintInkNote(f: Fonts, text: string, arrow: "left" | "right" | "up" | "down" | null, color = "#f5f0e0", seed = 1) {
  const W = 560;
  const H = 240;
  const { c, ctx } = canvas(1, W, H);
  const r = seeded(seed);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.font = `700 54px ${f.hand}`;
  ctx.fillText(text, 30, 90);
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  const tw = Math.min(ctx.measureText(text).width, W - 60);
  sketchLine(ctx, r, 34, 108, 30 + tw * 0.7, 106, 2);
  if (arrow) {
    const [sx, sy, ex, ey] =
      arrow === "left" ? [140, 150, 30, 215] : arrow === "right" ? [380, 150, 520, 215] : arrow === "down" ? [260, 130, 230, 230] : [Math.min(tw + 50, 470), 78, 548, 14];
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) / 2 + 40, (sy + ey) / 2 - 30, ex, ey);
    ctx.stroke();
    const a = Math.atan2(ey - sy, ex - sx);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - Math.cos(a - 0.5) * 26, ey - Math.sin(a - 0.5) * 26);
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - Math.cos(a + 0.5) * 26, ey - Math.sin(a + 0.5) * 26);
    ctx.stroke();
  }
  return toTexture(c, 4);
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height;
  const r = w / h;
  let sw = img.width;
  let sh = img.height;
  if (ir > r) sw = img.height * r;
  else sh = img.width / r;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

/* ───────────── COVER ───────────── */

/* ───────────── LEATHER ───────────── */

const LEATHER = "#573420";
const STITCH = "rgba(214,178,128,0.75)";

/** Worn, scuffed brown leather: mottling, creases, scratches, pores and burnished edges. */
/** Poly Haven "Brown Leather" scan by Rob Tuytel (CC0) — see public/textures/leather/LICENSE.txt. */
export const leatherMapUrl = (map: "albedo" | "nor_gl" | "rough") =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/textures/leather/brown_leather_${map}_1k.jpg`;
/** One scan tile covers this many canvas units; the normal/roughness maps repeat to match. */
export const LEATHER_TILE = 480;

function leather(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, base = LEATHER, detail = 1, scan: HTMLImageElement | null = null) {
  const r = seeded(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  if (scan) {
    // real photographed leather as the base, darkened and warmed to match
    const pat = ctx.createPattern(scan, "repeat");
    if (pat) {
      pat.setTransform(new DOMMatrix().scale(LEATHER_TILE / scan.width));
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = base === LEATHER ? "#e6b48a" : "#7a5a44";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      detail *= 0.45; // the scan already carries most of the grain
    }
  }
  // broad tonal variation — rubbed lighter patches and darker oily ones
  const blobs = Math.round(60 * detail);
  for (let i = 0; i < blobs; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = (0.08 + r() * 0.3) * Math.max(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const light = r() > 0.38;
    g.addColorStop(0, light ? `rgba(168,108,58,${0.1 + r() * 0.16})` : `rgba(22,11,4,${0.1 + r() * 0.16})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  // pores / pebble grain
  for (let i = 0; i < 26000 * detail * (w * h) / (PAGE_W * PAGE_H); i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(0,0,0,${0.06 + r() * 0.1})` : `rgba(190,130,70,${0.03 + r() * 0.06})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  // creases: a dark fold with a lighter ridge beside it
  const creases = Math.round(34 * detail);
  for (let i = 0; i < creases; i++) {
    let x = r() * w;
    let y = r() * h;
    const len = 40 + r() * 260;
    let a = r() * Math.PI * 2;
    const pts: [number, number][] = [[x, y]];
    for (let d = 0; d < len; d += 14) {
      a += (r() - 0.5) * 0.7;
      x += Math.cos(a) * 14;
      y += Math.sin(a) * 14;
      pts.push([x, y]);
    }
    const lw = 1 + r() * 2.5;
    for (const [off, col] of [[0, `rgba(12,6,2,${0.25 + r() * 0.25})`], [lw + 0.8, `rgba(196,140,82,${0.1 + r() * 0.12})`]] as const) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.beginPath();
      pts.forEach(([px, py], j) => (j ? ctx.lineTo(px + off, py + off) : ctx.moveTo(px + off, py + off)));
      ctx.stroke();
    }
  }
  // scratches and scuffs — short pale strokes where the top grain is worn through
  const scratches = Math.round(420 * detail);
  for (let i = 0; i < scratches; i++) {
    const x = r() * w;
    const y = r() * h;
    const a = r() * Math.PI * 2;
    const l = 6 + r() * 60;
    ctx.strokeStyle = `rgba(${200 + r() * 30},${140 + r() * 30},${80 + r() * 30},${0.12 + r() * 0.3})`;
    ctx.lineWidth = 0.6 + r() * 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 10, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 10, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  // a few bigger rubbed scuffs
  for (let i = 0; i < 10 * detail; i++) {
    ctx.save();
    ctx.translate(r() * w, r() * h);
    ctx.rotate(r() * Math.PI);
    ctx.scale(1, 0.25 + r() * 0.3);
    const rad = 20 + r() * 60;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    g.addColorStop(0, `rgba(176,116,62,${0.18 + r() * 0.2})`);
    g.addColorStop(1, "rgba(176,116,62,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // darker, handled edges
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(10,4,0,0.38)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function stitches(ctx: CanvasRenderingContext2D, pts: [number, number][], len = 14, gap = 9) {
  ctx.save();
  ctx.setLineDash([len, gap]);
  ctx.lineCap = "round";
  // stitch holes / shadow first, thread on top
  for (const [off, col, lw] of [[1.5, "rgba(10,4,0,0.55)", 4.5], [0, STITCH, 3]] as const) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + off, y + off) : ctx.moveTo(x + off, y + off)));
    ctx.stroke();
  }
  ctx.restore();
}

/** Text pressed into the leather: dark recess with a light lower lip. */
function deboss(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, foil?: string) {
  ctx.fillStyle = "rgba(205,150,92,0.28)";
  ctx.fillText(text, x + 1.5, y + 2);
  ctx.fillStyle = "rgba(8,3,0,0.7)";
  ctx.fillText(text, x - 1, y - 1.5);
  ctx.fillStyle = foil ?? "rgba(30,15,6,0.85)";
  ctx.fillText(text, x, y);
}

function rivet(ctx: CanvasRenderingContext2D, x: number, y: number, rad = 13) {
  const g = ctx.createRadialGradient(x - rad * 0.35, y - rad * 0.35, 1, x, y, rad);
  g.addColorStop(0, "#f6e3a8");
  g.addColorStop(0.45, "#c9a14f");
  g.addColorStop(1, "#5e4317");
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.arc(x + 2, y + 3, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
}

/** Small tileable leather swatch for the back board, spine and board edges. */
export async function paintLeather(scale: number, base = LEATHER, seed = 9) {
  const { c, ctx } = canvas(scale, LEATHER_TILE * 2, LEATHER_TILE * 2);
  leather(ctx, LEATHER_TILE * 2, LEATHER_TILE * 2, seed, base, 0.6, await loadImage(leatherMapUrl("albedo")));
  return toTexture(c, 4);
}

/* ───────────── COVER ───────────── */

export async function paintCover(f: Fonts, scale: number, layered = false): Promise<Painted> {
  const { c, ctx } = canvas(scale);
  const r = seeded(11);
  leather(ctx, PAGE_W, PAGE_H, 23, LEATHER, 1, await loadImage(leatherMapUrl("albedo")));

  // hinge groove next to the spine
  const hg = ctx.createLinearGradient(0, 0, 110, 0);
  hg.addColorStop(0, "rgba(8,3,0,0.55)");
  hg.addColorStop(0.55, "rgba(8,3,0,0.1)");
  hg.addColorStop(0.62, "rgba(200,140,80,0.12)");
  hg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, 110, PAGE_H);

  // saddle stitching around the border
  stitches(ctx, [[96, 34], [PAGE_W - 34, 34], [PAGE_W - 34, PAGE_H - 34], [96, PAGE_H - 34], [96, 34]]);

  // the wrap-around flap on the fore-edge, riveted, with its own stitched edge
  ctx.save();
  const flap = new Path2D();
  flap.moveTo(PAGE_W, 470);
  flap.bezierCurveTo(930, 500, 860, 560, 875, 700);
  flap.bezierCurveTo(888, 820, 940, 880, PAGE_W, 900);
  flap.closePath();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = -6;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#3d2313";
  ctx.fill(flap);
  ctx.restore();
  ctx.save();
  ctx.clip(flap);
  const fl = ctx.createLinearGradient(870, 0, PAGE_W, 0);
  fl.addColorStop(0, "rgba(170,110,60,0.35)");
  fl.addColorStop(1, "rgba(0,0,0,0.2)");
  ctx.fillStyle = fl;
  ctx.fillRect(860, 460, 140, 450);
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(210,150,90,${0.1 + r() * 0.25})`;
    ctx.lineWidth = 1;
    const x = 880 + r() * 120;
    const y = 480 + r() * 400;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 20);
    ctx.stroke();
  }
  ctx.restore();
  stitches(ctx, [[PAGE_W, 498], [942, 524], [902, 590], [903, 700], [912, 805], [950, 860], [PAGE_W, 872]], 10, 8);
  rivet(ctx, 930, 640);
  rivet(ctx, 930, 760);

  // debossed header line
  ctx.font = `500 26px ${f.mono}`;
  deboss(ctx, "VOL. 01   ·   DEV DIARY   ·   2026", 140, 98);
  ctx.strokeStyle = "rgba(8,3,0,0.5)";
  ctx.lineWidth = 2;
  sketchLine(ctx, r, 140, 116, 860, 116, 1);

  if (!layered) {
    ctx.font = `800 110px ${f.display}`;
    deboss(ctx, site.name.toUpperCase(), 140, 300);
  }

  // role on a black label-maker strip
  const role = site.role.replace(/\[|\]/g, "").toUpperCase();
  ctx.save();
  ctx.translate(150, 476);
  ctx.rotate(0.02);
  ctx.font = `700 28px ${f.mono}`;
  const rw = Math.min(640, ctx.measureText(role).width + 48);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(6, 8, rw, 56);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, rw, 56);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(role.length > 38 ? role.slice(0, 37) + "…" : role, 24, 38);
  ctx.restore();

  // white paint-pen marks on the leather: technical doodles + notes
  ctx.save();
  ctx.strokeStyle = "rgba(245,235,216,0.75)";
  ctx.fillStyle = "rgba(245,235,216,0.85)";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  // gear
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const rad = i % 4 < 2 ? 46 : 36;
    const x = 800 + Math.cos(a) * rad;
    const y = 1075 + Math.sin(a) * rad;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(800, 1075, 14, 0, Math.PI * 2);
  ctx.stroke();
  // tiny circuit trace
  sketchLine(ctx, r, 150, 1100, 260, 1100, 2);
  sketchLine(ctx, r, 260, 1100, 300, 1060, 2);
  sketchLine(ctx, r, 300, 1060, 380, 1060, 2);
  [150, 380].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, x === 150 ? 1100 : 1060, 8, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.font = `700 36px ${f.hand}`;
  ctx.save();
  ctx.translate(540, 572);
  ctx.rotate(-0.06);
  ctx.fillText("v1.0 — still debugging", 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(470, 1104);
  ctx.rotate(0.04);
  ctx.fillText("est. 2026 ↘", 0, 0);
  ctx.restore();
  ctx.restore();

  // engineering stickers: bold shapes, black borders
  ctx.save();
  ctx.translate(250, 1210);
  ctx.rotate(-0.25);
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(0, 0, 84, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#477BFF";
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 56px ${f.mono}`;
  ctx.textAlign = "center";
  ctx.fillText("</>", 0, 20);
  ctx.restore();
  ctx.textAlign = "left";

  ctx.save();
  ctx.translate(410, 1170);
  ctx.rotate(0.06);
  brutalBox(ctx, 0, 0, 240, 80, "#9DDC8B", 9, 6);
  ctx.fillStyle = INK;
  ctx.font = `800 40px ${f.display}`;
  ctx.fillText("SHIP IT", 36, 55);
  ctx.restore();

  ctx.save();
  ctx.translate(380, 1290);
  ctx.rotate(-0.03);
  brutalBox(ctx, 0, 0, 330, 58, "#FFD84D", 7, 5);
  ctx.fillStyle = INK;
  ctx.font = `700 22px ${f.mono}`;
  ctx.fillText("WORKS ON MY MACHINE", 22, 37);
  ctx.restore();

  // barcode label
  {
    const bx = 120;
    const by = 1320;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(bx - 10, by - 10, 200, 64);
    let x = bx;
    for (let i = 0; x < bx + 180; i++) {
      const w = 2 + Math.floor(r() * 6);
      if (i % 2 === 0) {
        ctx.fillStyle = INK;
        ctx.fillRect(x, by, w, 34);
      }
      x += w;
    }
    ctx.fillStyle = INK;
    ctx.font = `500 14px ${f.mono}`;
    ctx.fillText("0 0 1 — 2 0 2 6", bx, by + 50);
  }

  // washi across two corners
  washi(ctx, 960, 52, 240, 0.72, "#FF755E", "stripe");
  washi(ctx, 900, 1360, 220, -0.5, "#477BFF", "dots", 50);

  // corner scuffs where the cover gets handled most
  for (const [x, y] of [[PAGE_W, 0], [PAGE_W, PAGE_H], [0, PAGE_H]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 150);
    g.addColorStop(0, "rgba(150,96,50,0.45)");
    g.addColorStop(1, "rgba(150,96,50,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  }
  return { texture: toTexture(c), links: [] };
}

/* ───────────── INSIDE PAGES ───────────── */

function pageNumber(ctx: CanvasRenderingContext2D, f: Fonts, n: string, side: "left" | "right") {
  ctx.fillStyle = "rgba(42,29,20,0.7)";
  ctx.font = `italic 500 30px ${f.serif}`;
  ctx.textAlign = side === "left" ? "left" : "right";
  ctx.fillText(`— ${n} —`, side === "left" ? 60 : PAGE_W - 60, PAGE_H - 50);
  ctx.textAlign = "left";
}

function readButton(ctx: CanvasRenderingContext2D, f: Fonts, label: string, x: number, y: number, color: string) {
  ctx.font = `800 38px ${f.display}`;
  const w = ctx.measureText(label).width + 70;
  brutalBox(ctx, x, y, w, 84, color, 10, 6);
  ctx.fillStyle = color === "#477BFF" ? "#FFFFFF" : INK;
  ctx.fillText(label.toUpperCase(), x + 34, y + 56);
  return { x, y, w: w + 10, h: 96 };
}

function drawDoodle(ctx: CanvasRenderingContext2D, f: Fonts, d: Doodle, r: () => number, color: string) {
  ctx.save();
  ctx.translate(560, 760);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (d) {
    case "sticky": {
      const cols = ["#FFD84D", "#9DDC8B", "#FF755E"];
      cols.forEach((c, i) => {
        ctx.save();
        ctx.translate(i * 90 - 40, i * 70);
        ctx.rotate((i - 1) * 0.16);
        ctx.fillStyle = c;
        ctx.fillRect(0, 0, 200, 190);
        sketchRect(ctx, r, 0, 0, 200, 190, 2);
        ctx.fillStyle = INK;
        ctx.font = `700 34px ${f.hand}`;
        ctx.fillText(["todo!", "learn", "ship"][i], 30, 70);
        ctx.restore();
      });
      break;
    }
    case "polaroid": {
      [0, 1].forEach((i) => {
        ctx.save();
        ctx.translate(i * 150 - 30, i * 40);
        ctx.rotate(i ? 0.14 : -0.1);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 220, 260);
        sketchRect(ctx, r, 0, 0, 220, 260, 2);
        ctx.fillStyle = i ? "#477BFF" : "#FFD84D";
        ctx.fillRect(16, 16, 188, 180);
        ctx.restore();
      });
      break;
    }
    case "receipt": {
      ctx.fillStyle = "#fff";
      ctx.fillRect(40, -20, 260, 420);
      sketchRect(ctx, r, 40, -20, 260, 420, 2);
      ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) sketchLine(ctx, r, 70, 30 + i * 38, 70 + 80 + r() * 120, 30 + i * 38, 1);
      ctx.fillStyle = color;
      ctx.font = `800 44px ${f.display}`;
      ctx.save();
      ctx.rotate(-0.3);
      ctx.fillText("PAID", 30, 360);
      ctx.restore();
      break;
    }
    case "desk": {
      // mug
      ctx.fillStyle = "#477BFF";
      ctx.fillRect(40, 60, 150, 170);
      sketchRect(ctx, r, 40, 60, 150, 170, 2);
      ctx.beginPath();
      ctx.arc(200, 140, 40, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(80 + i * 35, 40);
        ctx.bezierCurveTo(60 + i * 35, 0, 100 + i * 35, -20, 80 + i * 35, -60);
        ctx.stroke();
      }
      // headphones
      ctx.beginPath();
      ctx.arc(330, 200, 90, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = "#FF755E";
      ctx.fillRect(225, 180, 40, 80);
      ctx.fillRect(395, 180, 40, 80);
      break;
    }
    case "terminal": {
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, 380, 260);
      ctx.fillStyle = "#9DDC8B";
      ctx.font = `500 30px ${f.mono}`;
      ctx.fillText("$ help", 26, 70);
      ctx.fillText("> projects", 26, 120);
      ctx.fillText("> secret ?", 26, 170);
      ctx.fillRect(26, 196, 18, 30);
      break;
    }
    case "cabinet": {
      ctx.fillStyle = "#c9ccd1";
      ctx.fillRect(40, -30, 280, 430);
      sketchRect(ctx, r, 40, -30, 280, 430, 2);
      for (let i = 0; i < 4; i++) {
        sketchRect(ctx, r, 62, -10 + i * 102, 236, 86, 2);
        ctx.fillStyle = "#fff";
        ctx.fillRect(140, 10 + i * 102, 80, 26);
        ctx.fillStyle = INK;
        ctx.fillRect(160, 50 + i * 102, 40, 8);
      }
      break;
    }
    case "checklist": {
      for (let i = 0; i < 4; i++) {
        sketchRect(ctx, r, 40, i * 80, 46, 46, 2);
        if (i < 2) {
          ctx.strokeStyle = "#2f8a3a";
          ctx.lineWidth = 7;
          sketchLine(ctx, r, 46, i * 80 + 20, 62, i * 80 + 42, 1);
          sketchLine(ctx, r, 62, i * 80 + 42, 96, i * 80 - 8, 1);
          ctx.strokeStyle = INK;
          ctx.lineWidth = 5;
        }
        sketchLine(ctx, r, 120, i * 80 + 26, 300 + r() * 60, i * 80 + 26, 2);
      }
      break;
    }
    case "record": {
      // a record sliding out of its sleeve
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(290, 150, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 2;
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.arc(290, 150, 60 + k * 11, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(290, 150, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#B5835A";
      ctx.fillRect(20, 20, 260, 260);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      sketchRect(ctx, r, 20, 20, 260, 260, 2);
      sketchLine(ctx, r, 60, 230, 200, 230, 1);
      break;
    }
    case "envelope": {
      ctx.fillStyle = "#C8A374";
      ctx.fillRect(0, 40, 380, 240);
      sketchRect(ctx, r, 0, 40, 380, 240, 2);
      sketchLine(ctx, r, 0, 40, 190, 180, 2);
      sketchLine(ctx, r, 380, 40, 190, 180, 2);
      ctx.fillStyle = "#c0392b";
      ctx.beginPath();
      ctx.arc(190, 180, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function paintFace(face: PageFace, f: Fonts, scale: number, side: "left" | "right", pageNo: number): Painted {
  const { c, ctx } = canvas(scale);
  const r = seeded(pageNo * 31 + (side === "left" ? 7 : 3));
  const links: LinkRect[] = [];
  agedPaper(ctx, pageNo + 5, face.kind === "inside-cover" ? "#e6d3ae" : "#f4ecda");

  if (face.kind === "inside-cover") {
    // endpaper: a fine repeating print, then a bookplate pasted on
    ctx.strokeStyle = "rgba(90,55,25,0.13)";
    ctx.lineWidth = 1.5;
    for (let y = 40; y < PAGE_H; y += 40)
      for (let x = (y / 40) % 2 ? 20 : 40; x < PAGE_W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x + 6, y);
        ctx.lineTo(x, y + 6);
        ctx.lineTo(x - 6, y);
        ctx.closePath();
        ctx.stroke();
      }
    ctx.save();
    ctx.translate(140, 190);
    ctx.rotate(-0.012);
    ctx.fillStyle = "rgba(40,20,5,0.18)";
    ctx.fillRect(6, 8, 720, 560);
    plate(ctx, 0, 0, 720, 560, "#efe5cf");
    ctx.textAlign = "center";
    ctx.fillStyle = SEPIA;
    ctx.font = `500 22px ${f.mono}`;
    ctx.fillText("— EX LIBRIS —", 360, 74);
    ctx.font = `italic 600 62px ${f.serif}`;
    ctx.fillText("This journal belongs to", 360, 150);
    ctx.font = `700 78px ${f.hand}`;
    ctx.fillStyle = PEN;
    ctx.fillText(site.name, 360, 262);
    ctx.strokeStyle = "rgba(42,29,20,0.5)";
    ctx.lineWidth = 1.5;
    [282, 402].forEach((y) => sketchLine(ctx, r, 90, y, 630, y, 1));
    ctx.fillStyle = SEPIA;
    ctx.font = `500 20px ${f.mono}`;
    ctx.fillText("IF FOUND, PLEASE RETURN VIA", 360, 330);
    ctx.font = `700 54px ${f.hand}`;
    ctx.fillStyle = PEN;
    ctx.fillText("/contact", 360, 390);
    ctx.fillStyle = SEPIA;
    ctx.font = `500 20px ${f.mono}`;
    ctx.fillText("REWARD", 360, 450);
    ctx.font = `700 50px ${f.hand}`;
    ctx.fillStyle = PEN;
    ctx.fillText("one very good coffee", 360, 506);
    ctx.textAlign = "left";
    ctx.restore();

    ctx.fillStyle = SEPIA;
    ctx.font = `italic 600 44px ${f.serif}`;
    ctx.fillText("How to read this journal", 150, 900);
    ctx.fillStyle = PEN;
    ctx.font = `700 48px ${f.hand}`;
    ["→ the right-hand page turns forward", "← the left-hand page turns back", "arrow keys work too"].forEach((l, i) => ctx.fillText(l, 150, 980 + i * 66));
    washi(ctx, 200, 175, 240, -0.18, "#477BFF", "dots");
    washi(ctx, 800, 760, 200, 0.5, "#FFD84D", "check");
    starSticker(ctx, 830, 1220, 40, "#FF755E");
    links.push({ x: 120, y: 520, w: 760, h: 120, href: "/contact" });
    return { texture: toTexture(c), links };
  }

  gutter(ctx, side === "left" ? "right" : "left");

  if (face.kind === "contents") {
    ruled(ctx, 300, 92, 120);
    ctx.fillStyle = "#FF755E";
    ctx.fillRect(140, 150, 520, 56);
    ctx.fillStyle = INK;
    ctx.font = `800 116px ${f.display}`;
    ctx.fillText("CONTENTS", 150, 200);
    ctx.fillRect(150, 226, 700, 6);
    ctx.font = `italic 500 34px ${f.serif}`;
    ctx.fillText("an engineer's field journal", 150, 282);
    const rows = [{ label: "Cover", page: "01", href: "/" }, ...navItems.map((n) => ({ label: n.label, page: n.page, href: n.href }))];
    rows.forEach((row, i) => {
      const y = 380 + i * 92;
      ctx.fillStyle = "rgba(42,29,20,0.65)";
      ctx.font = `500 28px ${f.mono}`;
      ctx.fillText(row.page, 150, y - 14);
      ctx.fillStyle = SEPIA;
      ctx.font = `500 54px ${f.serif}`;
      ctx.fillText(row.label, 230, y - 12);
      const lw = ctx.measureText(row.label).width;
      ctx.fillStyle = "rgba(42,29,20,0.4)";
      for (let x = 250 + lw; x < 800; x += 16) ctx.fillRect(x, y - 20, 3, 3);
      ctx.fillStyle = SEPIA;
      ctx.font = `italic 500 30px ${f.serif}`;
      ctx.fillText("p." + row.page, 820, y - 14);
      if (row.href !== "/") links.push({ x: 140, y: y - 80, w: 760, h: 88, href: row.href });
    });
    ctx.fillStyle = PEN;
    ctx.font = `700 46px ${f.hand}`;
    ctx.save();
    ctx.translate(560, 1260);
    ctx.rotate(-0.04);
    ctx.fillText("↖ tap a line to jump there", 0, 0);
    ctx.restore();
    cornerWashi(ctx, side, 1);
    starSticker(ctx, 880, 1170, 34, "#FF755E");
    starSticker(ctx, 930, 1090, 20, "#9DDC8B");
    pageNumber(ctx, f, "i", side);
    return { texture: toTexture(c), links };
  }

  if (face.kind === "hint") {
    ruled(ctx);
    ctx.fillStyle = INK;
    ctx.font = `800 110px ${f.display}`;
    ctx.fillText("PSST.", 160, 300);
    ctx.fillStyle = PEN;
    ctx.font = `700 56px ${f.hand}`;
    ["some pages of this diary", "were never bound in.", "", "the old code still opens them:"].forEach((l, i) => ctx.fillText(l, 160, 430 + i * 72));
    ctx.save();
    ctx.translate(170, 790);
    ctx.rotate(-0.03);
    brutalBox(ctx, 0, 0, 660, 140, "#FFD84D", 12, 7);
    ctx.fillStyle = INK;
    ctx.font = `800 66px ${f.display}`;
    ctx.fillText("↑↑↓↓←→←→ B A", 36, 96);
    ctx.restore();
    ctx.font = `700 50px ${f.hand}`;
    ctx.fillStyle = PEN;
    ctx.fillText("(or ask the terminal in the lab)", 170, 1080);
    ctx.strokeStyle = SEPIA;
    ctx.lineWidth = 5;
    // key doodle
    ctx.beginPath();
    ctx.arc(300, 1220, 40, 0, Math.PI * 2);
    ctx.stroke();
    sketchLine(ctx, r, 340, 1220, 560, 1220, 2);
    sketchLine(ctx, r, 520, 1220, 520, 1260, 2);
    sketchLine(ctx, r, 480, 1220, 480, 1250, 2);
    cornerWashi(ctx, side, 2);
    postageStamp(ctx, f, 760, 1140, 0.12, "#FF755E", "?¢", "secret post");
    pageNumber(ctx, f, "xi", side);
    return { texture: toTexture(c), links };
  }

  if (face.kind === "notes") {
    ruled(ctx);
    ctx.fillStyle = "#9DDC8B";
    ctx.fillRect(150, 112, 330, 52);
    ctx.fillStyle = INK;
    ctx.font = `800 110px ${f.display}`;
    ctx.fillText("NOTES", 160, 160);
    ctx.font = `700 54px ${f.hand}`;
    ctx.fillStyle = PEN;
    ["- more pages being written", "- check /now for this week", "- to be continued…"].forEach((l, i) => ctx.fillText(l, 150, 285 + i * 58 * 2));
    // handwritten correction: "written" → "built"
    ctx.font = `700 54px ${f.hand}`;
    const pre = ctx.measureText("- more pages being ").width;
    const ww = ctx.measureText("written").width;
    ctx.strokeStyle = "#FF755E";
    ctx.lineWidth = 4;
    sketchLine(ctx, r, 150 + pre, 268, 150 + pre + ww, 262, 1);
    ctx.fillStyle = "#FF755E";
    ctx.font = `700 42px ${f.hand}`;
    ctx.fillText("built", 150 + pre + 20, 222);
    ctx.save();
    ctx.translate(520, 1050);
    ctx.rotate(0.06);
    const b = readButton(ctx, f, "Write to me →", 0, 0, "#9DDC8B");
    ctx.restore();
    links.push({ x: 510, y: 1030, w: b.w + 20, h: b.h + 30, href: "/contact" });
    cornerWashi(ctx, side, 3);
    miniPolaroid(ctx, f, r, 150, 740, -0.08, "#477BFF", "to be continued");
    pageNumber(ctx, f, "xii", side);
    return { texture: toTexture(c), links };
  }

  // chapter
  ruled(ctx, 520, 62, 120);
  const accent = face.color === "#FFFFFF" ? "#FFD84D" : face.color;
  // thumb-index tab: a block of colour at the fore-edge with a black border
  ctx.fillStyle = accent;
  ctx.fillRect(side === "right" ? PAGE_W - 60 : 0, 120, 60, 170);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(side === "right" ? PAGE_W - 60 : -10, 120, 70, 170);
  ctx.save();
  ctx.translate(side === "right" ? PAGE_W - 22 : 38, 205);
  ctx.rotate(side === "right" ? Math.PI / 2 : -Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = face.color === "#477BFF" ? "#FFFFFF" : INK;
  ctx.font = `800 30px ${f.display}`;
  ctx.fillText(face.page, 0, 0);
  ctx.restore();

  ctx.fillStyle = "rgba(42,29,20,0.7)";
  ctx.font = `500 24px ${f.mono}`;
  ctx.fillText("CHAPTER " + face.page, 150, 170);
  let size = 140;
  const T = face.title.toUpperCase();
  ctx.font = `800 ${size}px ${f.display}`;
  while (ctx.measureText(T).width > 680 && size > 70) {
    size -= 6;
    ctx.font = `800 ${size}px ${f.display}`;
  }
  const tw = Math.min(700, ctx.measureText(T).width);
  // highlighter block behind the lower half of the title
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(138, 320 - size * 0.38, tw + 24, size * 0.46);
  ctx.globalAlpha = 1;
  ctx.fillStyle = INK;
  ctx.fillText(T, 142, 320);
  ctx.fillRect(142, 344, tw, 6);

  ctx.fillStyle = PEN;
  ctx.font = `700 56px ${f.hand}`;
  ctx.fillText(face.blurb, 150, 452);

  ctx.fillStyle = PEN;
  ctx.font = `700 48px ${f.hand}`;
  face.lines.slice(0, 4).forEach((l, i) => {
    const t = l.length > 30 ? l.slice(0, 29) + "…" : l;
    ctx.fillText(t, 150, 568 + i * 62);
  });

  drawDoodle(ctx, f, face.doodle, r, face.color);
  chapterScraps(ctx, f, r, side, pageNo, face.color, face.title);

  ctx.save();
  ctx.translate(150, 1180);
  ctx.rotate(-0.02);
  const b = readButton(ctx, f, "Read the chapter →", 0, 0, face.color === "#FFFFFF" ? "#FFD84D" : face.color);
  ctx.restore();
  links.push({ x: 140, y: 1160, w: b.w + 20, h: b.h + 30, href: face.href });

  pageNumber(ctx, f, face.page, side);
  return { texture: toTexture(c), links };
}

/* ───────────── small textures ───────────── */

export function paintPageEdges(scale: number, horizontal: boolean) {
  const { c, ctx } = canvas(scale, 256, 64);
  ctx.fillStyle = "#F4EAD6";
  ctx.fillRect(0, 0, 256, 64);
  const r = seeded(5);
  for (let i = 0; i < 64; i += 2) {
    ctx.fillStyle = `rgba(120,90,50,${0.08 + r() * 0.16})`;
    if (horizontal) ctx.fillRect(0, i, 256, 1);
    else ctx.fillRect(i * 4, 0, 1, 64);
  }
  return toTexture(c, 4);
}

export function paintCloth(color: string, scale: number) {
  const { c, ctx } = canvas(scale, 256, 256);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  const r = seeded(9);
  for (let y = 0; y < 256; y += 3) {
    ctx.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.04})`;
    ctx.fillRect(0, y, 256, 1);
  }
  return toTexture(c, 4);
}

export function paintDoNotPress(f: Fonts) {
  const { c, ctx } = canvas(1, 256, 256);
  const r = seeded(77);
  // irregular wax blob
  ctx.beginPath();
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const rad = 118 + (r() - 0.5) * 14;
    const x = 128 + Math.cos(a) * rad;
    const y = 128 + Math.sin(a) * rad;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  const g = ctx.createRadialGradient(100, 96, 10, 128, 128, 130);
  g.addColorStop(0, "#b3362a");
  g.addColorStop(0.7, "#7d1d16");
  g.addColorStop(1, "#4d0f0b");
  ctx.fillStyle = g;
  ctx.fill();
  // pressed inner ring
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(40,5,3,0.6)";
  ctx.beginPath();
  ctx.arc(129, 130, 86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(230,120,100,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(127, 127, 86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = `800 34px ${f.display}`;
  for (const [dx, col] of [[2, "rgba(40,5,3,0.7)"], [0, "rgba(255,190,170,0.75)"]] as const) {
    ctx.fillStyle = col;
    ctx.fillText("DO NOT", 128 + dx, 122 + dx);
    ctx.fillText("PRESS", 128 + dx, 160 + dx);
  }
  return toTexture(c, 4);
}

export function paintCuttingMat(f: Fonts, scale: number) {
  const W = 1800;
  const H = 1200;
  const { c, ctx } = canvas(scale, W, H);
  const r = seeded(77);
  ctx.fillStyle = "#357553";
  ctx.fillRect(0, 0, W, H);
  // uneven dye + soft window light from the top-left
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const y = r() * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 120 + r() * 260);
    g.addColorStop(0, r() > 0.5 ? "rgba(20,60,35,0.10)" : "rgba(120,190,140,0.07)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  const light = ctx.createLinearGradient(0, 0, W, H);
  light.addColorStop(0, "rgba(255,248,225,0.16)");
  light.addColorStop(0.55, "rgba(255,248,225,0)");
  light.addColorStop(1, "rgba(0,20,10,0.14)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, 16000, 21, "0,30,10");
  // grid — present, but quiet
  const cell = 50;
  for (let x = 0; x <= W; x += cell) {
    const major = x % (cell * 5) === 0;
    ctx.fillStyle = major ? "rgba(230,255,235,0.22)" : "rgba(230,255,235,0.08)";
    ctx.fillRect(x, 0, major ? 2 : 1, H);
  }
  for (let y = 0; y <= H; y += cell) {
    const major = y % (cell * 5) === 0;
    ctx.fillStyle = major ? "rgba(230,255,235,0.22)" : "rgba(230,255,235,0.08)";
    ctx.fillRect(0, y, W, major ? 2 : 1);
  }
  ctx.strokeStyle = "rgba(230,255,235,0.14)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(H, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(230,255,235,0.32)";
  ctx.font = `500 16px ${f.mono}`;
  for (let x = cell * 2; x < W; x += cell * 2) ctx.fillText(String(x / cell), x + 4, 22);
  for (let y = cell * 2; y < H; y += cell * 2) ctx.fillText(String(y / cell), 6, y - 4);
  // knife cuts: straight, pale, mostly along the grid
  for (let i = 0; i < 38; i++) {
    const horiz = r() > 0.45;
    const x = r() * W;
    const y = r() * H;
    const len = 60 + r() * 380;
    ctx.strokeStyle = `rgba(210,240,215,${0.12 + r() * 0.2})`;
    ctx.lineWidth = 0.8 + r() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(horiz ? x + len : x + jitter(r, 6), horiz ? y + jitter(r, 6) : y + len);
    ctx.stroke();
  }
  // fine scuffs
  for (let i = 0; i < 260; i++) {
    const x = r() * W;
    const y = r() * H;
    const a = r() * Math.PI;
    const l = 6 + r() * 26;
    ctx.strokeStyle = `rgba(220,250,225,${0.04 + r() * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  // worn, slightly shiny patch where the diary usually sits
  const worn = ctx.createRadialGradient(W * 0.5, H * 0.5, 40, W * 0.5, H * 0.5, 520);
  worn.addColorStop(0, "rgba(150,210,165,0.10)");
  worn.addColorStop(1, "rgba(150,210,165,0)");
  ctx.fillStyle = worn;
  ctx.fillRect(0, 0, W, H);
  // an old ink spot
  ctx.fillStyle = "rgba(15,25,60,0.25)";
  ctx.beginPath();
  ctx.ellipse(W * 0.83, H * 0.78, 14, 10, 0.4, 0, Math.PI * 2);
  ctx.fill();
  vignette(ctx, W, H, 0.5);
  return toTexture(c);
}

export function paintWood(scale: number) {
  const W = 1024;
  const H = 1024;
  const { c, ctx } = canvas(scale, W, H);
  ctx.fillStyle = "#b9814f";
  ctx.fillRect(0, 0, W, H);
  const r = seeded(4);
  for (let y = 0; y < H; y += 2) {
    const v = Math.sin(y * 0.045 + Math.sin(y * 0.01) * 4) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(90,50,20,${0.05 + v * 0.12})`;
    ctx.fillRect(0, y, W, 2);
  }
  for (let i = 0; i < 160; i++) {
    ctx.strokeStyle = `rgba(70,35,10,${0.05 + r() * 0.12})`;
    ctx.lineWidth = 1 + r() * 2;
    const y = r() * H;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 6);
    ctx.stroke();
  }
  grain(ctx, W, H, 8000, 6, "50,25,5");
  return toTexture(c);
}

export function paintPhoto(f: Fonts, bg: string, label: string, seed: number) {
  const { c, ctx } = canvas(1, 320, 380);
  const r = seeded(seed);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 320, 380);
  ctx.fillStyle = bg;
  ctx.fillRect(18, 18, 284, 270);
  // abstract scene
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(80 + r() * 160, 90 + r() * 40, 30 + r() * 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(23,23,23,0.75)";
  ctx.beginPath();
  ctx.moveTo(18, 288);
  ctx.lineTo(120 + r() * 40, 160 + r() * 40);
  ctx.lineTo(200, 230);
  ctx.lineTo(250, 190);
  ctx.lineTo(302, 260);
  ctx.lineTo(302, 288);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 284, 270);
  ctx.fillStyle = INK;
  ctx.font = `700 34px ${f.hand}`;
  ctx.fillText(label, 26, 340);
  return toTexture(c, 4);
}

export function paintSticky(f: Fonts, text: string, color = "#FFD84D") {
  const { c, ctx } = canvas(1, 256, 256);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, 0, 256, 34);
  ctx.fillStyle = INK;
  ctx.font = `700 40px ${f.hand}`;
  wrap(ctx, text, 220).forEach((l, i) => ctx.fillText(l, 18, 90 + i * 44));
  return toTexture(c, 4);
}

export function paintLabel(f: Fonts, text: string, bg = "#FFFFFF", w = 512, h = 128) {
  const { c, ctx } = canvas(1, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 8;
  ctx.strokeStyle = INK;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.fillStyle = INK;
  ctx.font = `800 ${Math.round(h * 0.42)}px ${f.display}`;
  ctx.textAlign = "center";
  ctx.fillText(text, w / 2, h * 0.64);
  return toTexture(c, 4);
}

/** Soft blob shadow for low-end devices (no shadow maps). */
export function paintBlobShadow() {
  const { c, ctx } = canvas(1, 256, 256);
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  return t;
}

/* ───────────── scrapbook 3D bits ───────────── */

/** Index flag that sticks out of the diary's fore-edge. Left half hides between pages. */
export function paintFlag(f: Fonts, page: string, title: string, color: string) {
  const W = 512;
  const H = 200;
  const { c, ctx } = canvas(1, W, H);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(0, 0, W / 2, H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.strokeRect(W / 2 - 6, 5, W / 2, H - 10);
  const ink = color === "#477BFF" ? "#FFFFFF" : INK;
  ctx.fillStyle = ink;
  ctx.font = `800 72px ${f.display}`;
  ctx.fillText(page, W / 2 + 22, 86);
  let size = 46;
  const label = title.toUpperCase();
  ctx.font = `700 ${size}px ${f.mono}`;
  while (ctx.measureText(label).width > W / 2 - 44 && size > 20) {
    size -= 2;
    ctx.font = `700 ${size}px ${f.mono}`;
  }
  ctx.fillText(label, W / 2 + 22, 160);
  return toTexture(c, 8);
}

/** A ticket stub texture (transparent around the notches). */
export function paintTicket(f: Fonts, color: string, title: string, no: number) {
  const { c, ctx } = canvas(1, 350, 160);
  ticketStub(ctx, f, 0, 0, 0, color, title, no, "rgba(0,0,0,0)");
  // punch the notches out properly
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(250, 0, 14, 0, Math.PI * 2);
  ctx.arc(250, 150, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.clearRect(340, 0, 10, 160);
  ctx.clearRect(0, 150, 350, 10);
  return toTexture(c, 4);
}

/** Vinyl sticker decal (transparent background). */
export function paintDecal(f: Fonts, kind: "star" | "heart" | "smile" | "bolt" | "text", color: string, text = "") {
  const { c, ctx } = canvas(1, 256, 256);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const outline = (draw: () => void) => {
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 26;
    draw();
    ctx.stroke();
    ctx.fillStyle = color;
    draw();
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.stroke();
  };
  if (kind === "star") {
    outline(() => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const rr = i % 2 ? 44 : 100;
        ctx.lineTo(128 + Math.cos(a) * rr, 134 + Math.sin(a) * rr);
      }
      ctx.closePath();
    });
  } else if (kind === "heart") {
    outline(() => {
      ctx.beginPath();
      ctx.moveTo(128, 216);
      ctx.bezierCurveTo(20, 140, 30, 50, 90, 50);
      ctx.bezierCurveTo(115, 50, 128, 70, 128, 86);
      ctx.bezierCurveTo(128, 70, 141, 50, 166, 50);
      ctx.bezierCurveTo(226, 50, 236, 140, 128, 216);
      ctx.closePath();
    });
  } else if (kind === "bolt") {
    outline(() => {
      ctx.beginPath();
      [[150, 20], [60, 140], [120, 140], [96, 236], [196, 104], [134, 104], [170, 20]].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
    });
  } else if (kind === "smile") {
    outline(() => {
      ctx.beginPath();
      ctx.arc(128, 128, 100, 0, Math.PI * 2);
    });
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(95, 105, 13, 0, Math.PI * 2);
    ctx.arc(161, 105, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(128, 130, 55, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    outline(() => {
      ctx.beginPath();
      ctx.roundRect(14, 78, 228, 100, 50);
    });
    ctx.fillStyle = color === "#477BFF" ? "#FFFFFF" : INK;
    ctx.font = `800 44px ${f.display}`;
    ctx.textAlign = "center";
    ctx.fillText(text, 128, 144);
  }
  return toTexture(c, 4);
}

/** Folded note poking out of the pages. */
export function paintNote(f: Fonts, text: string) {
  const { c, ctx } = canvas(1, 300, 300);
  paper(ctx, "#FFFFFF", 17, 300, 300);
  ctx.strokeStyle = "rgba(71,123,255,0.35)";
  ctx.lineWidth = 2;
  for (let y = 60; y < 300; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(300, y);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(148, 0, 3, 300);
  ctx.fillStyle = INK;
  ctx.font = `700 40px ${f.hand}`;
  wrap(ctx, text, 260).slice(0, 4).forEach((l, i) => ctx.fillText(l, 20, 52 + i * 34 * 1.0 + i * 8));
  return toTexture(c, 4);
}

/** Repeating washi-tape pattern (colour baked in). */
export function paintWashi(color: string, pattern: Pattern) {
  const { c, ctx } = canvas(1, 256, 128);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 128);
  washi(ctx, 128, 64, 300, 0, color, pattern, 128);
  return toTexture(c, 4);
}


/* ───────── layered cover objects (separate 3D pieces) ───────── */

export function paintNameplate(f: Fonts) {
  const W = 740;
  const H = 300;
  const { c, ctx } = canvas(1, W, H);
  ctx.fillStyle = "#FFD84D";
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, 3500, 31, "90,60,0");
  vignette(ctx, W, H, 0.18);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, W - 14, H - 14);
  ctx.fillStyle = INK;
  ctx.font = `500 26px ${f.mono}`;
  ctx.fillText("PROPERTY OF —", 36, 60);
  const fit = (s: string, max: number, size: number) => {
    let sz = size;
    ctx.font = `800 ${sz}px ${f.display}`;
    while (ctx.measureText(s).width > max && sz > 40) {
      sz -= 4;
      ctx.font = `800 ${sz}px ${f.display}`;
    }
  };
  const parts = site.name.toUpperCase().split(" ");
  if (parts.length > 1) {
    fit(parts[0], 660, 118);
    ctx.fillText(parts[0], 34, 160);
    fit(parts.slice(1).join(" "), 660, 118);
    ctx.fillText(parts.slice(1).join(" "), 34, 262);
  } else {
    fit(parts[0], 660, 140);
    ctx.fillText(parts[0], 34, 210);
  }
  // stamped number in the corner
  ctx.save();
  ctx.translate(W - 100, 54);
  ctx.rotate(-0.08);
  ctx.fillStyle = INK;
  ctx.fillRect(-62, -24, 124, 42);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 22px ${f.mono}`;
  ctx.textAlign = "center";
  ctx.fillText("NO. 001", 0, 6);
  ctx.restore();
  return toTexture(c, 8);
}

export async function paintCoverPhoto(f: Fonts) {
  const W = 350;
  const H = 420;
  const { c, ctx } = canvas(1.4, W, H);
  ctx.fillStyle = "#FBF8F0";
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, 1800, 41, "60,50,30");
  const img = await loadImage(site.photo);
  if (img) drawCover(ctx, img, 22, 22, 306, 316);
  else {
    ctx.fillStyle = "#9DDC8B";
    ctx.fillRect(22, 22, 306, 316);
  }
  filmLook(ctx, 22, 22, 306, 316, 5);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, 306, 316);
  ctx.fillStyle = INK;
  ctx.font = `700 44px ${f.hand}`;
  ctx.fillText("that's me ↑", 40, 392);
  ctx.fillStyle = "rgba(71,123,255,0.9)";
  ctx.font = `600 26px ${f.hand}`;
  ctx.fillText(site.photoDate, 236, 396);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, W, H);
  return toTexture(c, 8);
}

export function paintCoverNote(f: Fonts) {
  const W = 380;
  const H = 360;
  const { c, ctx } = canvas(1.2, W, H);
  ctx.fillStyle = "#F5EBD8";
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, 2500, 51, "110,70,20");
  ctx.fillStyle = "rgba(71,123,255,0.16)";
  for (let x = 0; x < W; x += 25) ctx.fillRect(x, 0, 1, H);
  for (let y = 0; y < H; y += 25) ctx.fillRect(0, y, W, 1);
  ctx.fillStyle = "#FF755E";
  ctx.fillRect(0, 50, W, 4);
  vignette(ctx, W, H, 0.15);
  ctx.fillStyle = INK;
  ctx.font = `700 46px ${f.hand}`;
  const note = site.coverNote.replace(/\[PLACEHOLDER\]\s*/g, "");
  wrap(ctx, note, 330)
    .slice(0, 6)
    .forEach((l, i) => ctx.fillText(l, 24, 92 + i * 50));
  // folded-corner shading (the 3D flap sits on top of this)
  ctx.fillStyle = "rgba(90,60,20,0.2)";
  ctx.beginPath();
  ctx.moveTo(W, H - 70);
  ctx.lineTo(W, H);
  ctx.lineTo(W - 70, H);
  ctx.fill();
  return toTexture(c, 8);
}

/** Loose sheet with torn edges and transparent surroundings. */
export function paintTornSheet(color: string, seed: number, lines = false, graph = false) {
  const W = 512;
  const H = 640;
  const { c, ctx } = canvas(1, W, H);
  const r = seeded(seed);
  const pts: [number, number][] = [];
  const m = 14;
  for (let x = m; x <= W - m; x += 12) pts.push([x, m + jitter(r, 7)]);
  for (let y = m; y <= H - m; y += 12) pts.push([W - m + jitter(r, 7), y]);
  for (let x = W - m; x >= m; x -= 12) pts.push([x, H - m + jitter(r, 7)]);
  for (let y = H - m; y >= m; y -= 12) pts.push([m + jitter(r, 7), y]);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.save();
  ctx.clip();
  grain(ctx, W, H, 4000, seed, "80,55,20");
  if (graph) {
    ctx.strokeStyle = "rgba(60,140,120,0.28)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }
  if (lines) {
    ctx.strokeStyle = "rgba(71,123,255,0.3)";
    ctx.lineWidth = 2;
    for (let y = 70; y < H; y += 34) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 3;
  ctx.stroke();
  return toTexture(c, 4);
}
