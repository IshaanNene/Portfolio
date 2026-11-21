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

function ruled(ctx: CanvasRenderingContext2D, top = 190, gap = 58, margin = 120) {
  ctx.strokeStyle = "rgba(71,123,255,0.28)";
  ctx.lineWidth = 2;
  for (let y = top; y < PAGE_H - 60; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PAGE_W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,117,94,0.6)";
  ctx.lineWidth = 3;
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
function tornPaper(ctx: CanvasRenderingContext2D, r: () => number, x: number, y: number, w: number, h: number, color: string, alpha = 1) {
  const pts: [number, number][] = [];
  const step = 16;
  for (let i = 0; i <= w; i += step) pts.push([x + i, y + jitter(r, 5)]);
  for (let i = 0; i <= h; i += step) pts.push([x + w + jitter(r, 5), y + i]);
  for (let i = w; i >= 0; i -= step) pts.push([x + i, y + h + jitter(r, 5)]);
  for (let i = h; i >= 0; i -= step) pts.push([x + jitter(r, 5), y + i]);
  ctx.save();
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fillStyle = "rgba(60,40,10,0.14)";
  ctx.translate(4, 6);
  ctx.fill();
  ctx.translate(-4, -6);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill();
  // white fibrous rim where the paper tore
  ctx.globalAlpha = 0.5 * alpha;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

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
function paperClip(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = "#8a8f98";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(14, 40);
  ctx.lineTo(14, 120);
  ctx.arc(28, 120, 14, Math.PI, 0, true);
  ctx.lineTo(42, 20);
  ctx.arc(22, 20, 20, 0, Math.PI, true);
  ctx.lineTo(2, 130);
  ctx.arc(28, 130, 26, Math.PI, 0, true);
  ctx.lineTo(54, 50);
  ctx.stroke();
  ctx.restore();
}

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
function chapterScraps(ctx: CanvasRenderingContext2D, f: Fonts, r: () => number, side: "left" | "right", pageNo: number, color: string, title: string) {
  const accent = color === "#FFFFFF" ? "#FFD84D" : color;
  const v = pageNo % 4;
  if (v === 0) {
    ticketStub(ctx, f, 140, 900, -0.08, accent, title, pageNo);
    washi(ctx, 190, 905, 120, 0.5, WASHI[(pageNo + 1) % 4].color, WASHI[(pageNo + 1) % 4].pattern, 44);
  } else if (v === 1) {
    postageStamp(ctx, f, 170, 860, -0.1, accent, String(10 + pageNo * 5) + "¢", title);
  } else if (v === 2) {
    miniPolaroid(ctx, f, r, 160, 840, 0.07, accent, title.toLowerCase() + " ♥");
    washi(ctx, 275, 840, 140, -0.12, WASHI[pageNo % 4].color, WASHI[pageNo % 4].pattern, 44);
  } else {
    tornPaper(ctx, r, 140, 860, 330, 220, accent, 0.95);
    paperClip(ctx, 400, 820, 0.25);
    ctx.fillStyle = accent === "#477BFF" ? "#FFFFFF" : INK;
    ctx.font = `700 44px ${f.hand}`;
    ["note to self:", "keep it weird,", "keep shipping."].forEach((l, i) => ctx.fillText(l, 170, 930 + i * 52));
  }
  cornerWashi(ctx, side, pageNo);
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

export async function paintCover(f: Fonts, scale: number): Promise<Painted> {
  const { c, ctx } = canvas(scale);
  const r = seeded(11);

  // cloth
  ctx.fillStyle = "#FF755E";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  for (let y = 0; y < PAGE_H; y += 3) {
    ctx.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.03})`;
    ctx.fillRect(0, y, PAGE_W, 1);
  }
  for (let x = 0; x < PAGE_W; x += 3) {
    ctx.fillStyle = `rgba(255,255,255,${0.015 + r() * 0.03})`;
    ctx.fillRect(x, 0, 1, PAGE_H);
  }
  grain(ctx, PAGE_W, PAGE_H, 7000, 12, "40,0,0");

  // spine-side band (dark cloth)
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, 70, PAGE_H);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let y = 0; y < PAGE_H; y += 4) ctx.fillRect(0, y, 70, 1);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(84, 20);
  ctx.lineTo(84, PAGE_H - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // top strip
  ctx.fillStyle = INK;
  ctx.font = `500 30px ${f.mono}`;
  ctx.fillText("VOL. 01  ·  DEV DIARY  ·  2026", 130, 92);

  // name label
  ctx.save();
  ctx.translate(130, 150);
  ctx.rotate(-0.025);
  brutalBox(ctx, 0, 0, 740, 300, "#FFD84D", 16, 9);
  ctx.fillStyle = INK;
  ctx.font = `500 26px ${f.mono}`;
  ctx.fillText("PROPERTY OF —", 36, 60);
  ctx.font = `800 118px ${f.display}`;
  const name = site.name.toUpperCase();
  const parts = name.split(" ");
  const fit = (s: string, max: number, size: number) => {
    let sz = size;
    ctx.font = `800 ${sz}px ${f.display}`;
    while (ctx.measureText(s).width > max && sz > 40) {
      sz -= 4;
      ctx.font = `800 ${sz}px ${f.display}`;
    }
    return sz;
  };
  if (parts.length > 1) {
    fit(parts[0], 660, 118);
    ctx.fillText(parts[0], 34, 160);
    fit(parts.slice(1).join(" "), 660, 118);
    ctx.fillText(parts.slice(1).join(" "), 34, 262);
  } else {
    fit(name, 660, 140);
    ctx.fillText(name, 34, 210);
  }
  ctx.restore();

  // role ribbon
  ctx.save();
  ctx.translate(150, 500);
  ctx.rotate(0.02);
  const role = site.role.replace(/\[|\]/g, "");
  ctx.font = `700 30px ${f.mono}`;
  const rw = Math.min(700, ctx.measureText(role).width + 50);
  brutalBox(ctx, 0, -44, rw, 64, INK, 0, 0);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(role.length > 38 ? role.slice(0, 37) + "…" : role, 24, 0);
  ctx.restore();

  // photo polaroid
  const img = await loadImage(site.photo);
  ctx.save();
  ctx.translate(560, 610);
  ctx.rotate(0.06);
  brutalBox(ctx, 0, 0, 350, 420, "#FFFFFF", 14, 7);
  if (img) drawCover(ctx, img, 22, 22, 306, 316);
  else {
    ctx.fillStyle = "#9DDC8B";
    ctx.fillRect(22, 22, 306, 316);
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, 306, 316);
  ctx.fillStyle = INK;
  ctx.font = `700 46px ${f.hand}`;
  ctx.fillText("that's me ↑", 60, 392);
  ctx.restore();
  tape(ctx, 735, 612, 190, -0.12);

  // handwritten note on sticky
  ctx.save();
  ctx.translate(140, 640);
  ctx.rotate(-0.05);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(10, 14, 380, 360);
  ctx.fillStyle = "#FFF4B8";
  ctx.fillRect(0, 0, 380, 360);
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, 380, 40);
  ctx.fillStyle = INK;
  ctx.font = `700 46px ${f.hand}`;
  const note = site.coverNote.replace(/\[PLACEHOLDER\]\s*/g, "");
  wrap(ctx, note, 330)
    .slice(0, 6)
    .forEach((l, i) => ctx.fillText(l, 24, 92 + i * 50));
  ctx.restore();
  tape(ctx, 330, 640, 140, 0.18);

  // doodles
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  star(ctx, 900, 540, 34, "#FFD84D");
  star(ctx, 120, 1110, 26, "#FFFFFF");
  ctx.lineWidth = 5;
  sketchLine(ctx, r, 470, 600, 540, 660, 4);
  sketchLine(ctx, r, 520, 640, 545, 665, 2);
  sketchLine(ctx, r, 548, 662, 520, 668, 2);
  // scrapbook extras: washi tape on the corners
  washi(ctx, 940, 40, 240, 0.7, "#FFD84D", "check");
  washi(ctx, 160, 1350, 220, -0.35, "#9DDC8B", "grid", 50);
  washi(ctx, 520, 1060, 150, 0.25, "#477BFF", "stripe", 44);

  // printed stickers
  ctx.save();
  ctx.translate(250, 1180);
  ctx.rotate(-0.25);
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(0, 0, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#477BFF";
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 58px ${f.mono}`;
  ctx.textAlign = "center";
  ctx.fillText("</>", 0, 20);
  ctx.restore();
  ctx.textAlign = "left";

  ctx.save();
  ctx.translate(430, 1200);
  ctx.rotate(0.08);
  brutalBox(ctx, 0, 0, 230, 78, "#9DDC8B", 8, 5);
  ctx.fillStyle = INK;
  ctx.font = `800 38px ${f.display}`;
  ctx.fillText("SHIP IT", 32, 54);
  ctx.restore();

  // barcode
  const bx = 720;
  const by = 1250;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(bx - 14, by - 14, 230, 112);
  let x = bx;
  for (let i = 0; x < bx + 200; i++) {
    const w = 2 + Math.floor(r() * 7);
    if (i % 2 === 0) {
      ctx.fillStyle = INK;
      ctx.fillRect(x, by, w, 64);
    }
    x += w;
  }
  ctx.fillStyle = INK;
  ctx.font = `500 18px ${f.mono}`;
  ctx.fillText("0 0 1 — 2 0 2 6", bx, by + 88);

  // wear
  vignette(ctx, PAGE_W, PAGE_H, 0.35);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 30; i++) sketchLine(ctx, r, r() * PAGE_W, r() * PAGE_H, r() * PAGE_W, r() * PAGE_H, 30);

  return { texture: toTexture(c), links: [] };
}

/* ───────────── INSIDE PAGES ───────────── */

function pageNumber(ctx: CanvasRenderingContext2D, f: Fonts, n: string, side: "left" | "right") {
  ctx.fillStyle = "rgba(23,23,23,0.6)";
  ctx.font = `500 26px ${f.mono}`;
  ctx.textAlign = side === "left" ? "left" : "right";
  ctx.fillText(`— ${n} —`, side === "left" ? 60 : PAGE_W - 60, PAGE_H - 50);
  ctx.textAlign = "left";
}

function readButton(ctx: CanvasRenderingContext2D, f: Fonts, label: string, x: number, y: number, color: string) {
  ctx.font = `800 40px ${f.display}`;
  const w = ctx.measureText(label).width + 70;
  brutalBox(ctx, x, y, w, 86, color, 10, 6);
  ctx.fillStyle = color === "#477BFF" ? "#FFFFFF" : INK;
  ctx.fillText(label, x + 34, y + 58);
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
  paper(ctx, face.kind === "inside-cover" ? "#E9D6B4" : "#FBF5E8", pageNo + 5);

  if (face.kind === "inside-cover") {
    // marbled-ish endpaper border
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, PAGE_W, 26);
    ctx.fillRect(0, PAGE_H - 26, PAGE_W, 26);
    ctx.fillRect(PAGE_W - 26, 0, 26, PAGE_H);
    ctx.save();
    ctx.translate(120, 210);
    ctx.rotate(-0.03);
    brutalBox(ctx, 0, 0, 740, 520, "#FFFFFF", 14, 7);
    ctx.fillStyle = INK;
    ctx.font = `800 54px ${f.display}`;
    ctx.fillText("THIS DIARY", 40, 90);
    ctx.fillText("BELONGS TO:", 40, 150);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    [270, 380, 470].forEach((y) => sketchLine(ctx, r, 40, y, 700, y, 1));
    ctx.font = `700 72px ${f.hand}`;
    ctx.fillStyle = "#477BFF";
    ctx.fillText(site.name, 50, 255);
    ctx.font = `500 24px ${f.mono}`;
    ctx.fillStyle = INK;
    ctx.fillText("IF FOUND, PLEASE RETURN TO", 40, 320);
    ctx.font = `700 56px ${f.hand}`;
    ctx.fillStyle = "#477BFF";
    ctx.fillText("/contact  (it's an envelope)", 50, 368);
    ctx.font = `500 24px ${f.mono}`;
    ctx.fillStyle = INK;
    ctx.fillText("REWARD:", 40, 440);
    ctx.font = `700 56px ${f.hand}`;
    ctx.fillStyle = "#477BFF";
    ctx.fillText("one very good coffee", 200, 455);
    ctx.restore();
    tape(ctx, 480, 210, 220, 0.04);

    ctx.fillStyle = INK;
    ctx.font = `700 52px ${f.hand}`;
    ["how to read me:", "→ click the right page to turn", "← click the left page to go back", "⌨ arrow keys work too"].forEach((l, i) =>
      ctx.fillText(l, 130, 900 + i * 70),
    );
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    star(ctx, 830, 1220, 40, "#FF755E");
    washi(ctx, 170, 60, 260, -0.5, "#477BFF", "dots");
    washi(ctx, 860, 1340, 260, -0.4, "#FFD84D", "check");
    links.push({ x: 120, y: 520, w: 760, h: 120, href: "/contact" });
    return { texture: toTexture(c), links };
  }

  gutter(ctx, side === "left" ? "right" : "left");

  if (face.kind === "contents") {
    ruled(ctx, 300, 92, 120);
    ctx.fillStyle = INK;
    ctx.font = `800 120px ${f.display}`;
    ctx.fillText("CONTENTS", 150, 200);
    ctx.fillStyle = "#FF755E";
    ctx.fillRect(150, 222, 480, 12);
    const rows = [{ label: "Cover", page: "01", href: "/" }, ...navItems.map((n) => ({ label: n.label, page: n.page, href: n.href }))];
    rows.forEach((row, i) => {
      const y = 380 + i * 92;
      ctx.fillStyle = INK;
      ctx.font = `500 30px ${f.mono}`;
      ctx.fillText(row.page, 150, y - 14);
      ctx.font = `700 64px ${f.hand}`;
      ctx.fillText(row.label, 230, y - 12);
      const lw = ctx.measureText(row.label).width;
      ctx.fillStyle = "rgba(23,23,23,0.5)";
      for (let x = 250 + lw; x < 800; x += 18) ctx.fillRect(x, y - 22, 6, 6);
      ctx.fillStyle = INK;
      ctx.font = `500 30px ${f.mono}`;
      ctx.fillText("p." + row.page, 820, y - 14);
      if (row.href !== "/") links.push({ x: 140, y: y - 80, w: 760, h: 88, href: row.href });
    });
    ctx.fillStyle = "#477BFF";
    ctx.font = `700 50px ${f.hand}`;
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
    ctx.fillText("psst.", 160, 300);
    ctx.font = `700 60px ${f.hand}`;
    ["some pages of this diary", "were never bound in.", "", "the old code still opens them:"].forEach((l, i) => ctx.fillText(l, 160, 430 + i * 72));
    ctx.save();
    ctx.translate(170, 790);
    ctx.rotate(-0.03);
    brutalBox(ctx, 0, 0, 660, 140, "#FFD84D", 12, 7);
    ctx.fillStyle = INK;
    ctx.font = `800 70px ${f.display}`;
    ctx.fillText("↑↑↓↓←→←→ B A", 36, 96);
    ctx.restore();
    ctx.font = `700 50px ${f.hand}`;
    ctx.fillStyle = "#477BFF";
    ctx.fillText("(or ask the terminal in the lab)", 170, 1080);
    ctx.strokeStyle = INK;
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
    ctx.fillStyle = INK;
    ctx.font = `800 110px ${f.display}`;
    ctx.fillText("NOTES", 160, 160);
    ctx.font = `700 58px ${f.hand}`;
    ctx.fillStyle = "#4a4640";
    ["- more pages being written", "- check /now for this week", "- to be continued…"].forEach((l, i) => ctx.fillText(l, 150, 285 + i * 58 * 2));
    ctx.save();
    ctx.translate(520, 1050);
    ctx.rotate(0.06);
    const b = readButton(ctx, f, "SAY HI →", 0, 0, "#9DDC8B");
    ctx.restore();
    links.push({ x: 510, y: 1030, w: b.w + 20, h: b.h + 30, href: "/contact" });
    cornerWashi(ctx, side, 3);
    miniPolaroid(ctx, f, r, 150, 740, -0.08, "#477BFF", "to be continued");
    pageNumber(ctx, f, "xii", side);
    return { texture: toTexture(c), links };
  }

  // chapter
  ruled(ctx, 520, 62, 120);
  {
    const accent = face.color === "#FFFFFF" ? "#FFD84D" : face.color;
    tornPaper(ctx, r, 118, 214, 760, 180, accent, 0.32);
  }
  // colour tab
  ctx.fillStyle = face.color;
  ctx.fillRect(side === "right" ? PAGE_W - 150 : 0, 120, 150, 120);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(side === "right" ? PAGE_W - 150 : -10, 120, 160, 120);
  ctx.fillStyle = face.color === "#477BFF" ? "#fff" : INK;
  ctx.font = `800 54px ${f.display}`;
  ctx.fillText(face.page, side === "right" ? PAGE_W - 120 : 34, 200);

  ctx.fillStyle = INK;
  ctx.font = `500 28px ${f.mono}`;
  ctx.fillText("CHAPTER " + face.page, 150, 170);
  let size = 150;
  ctx.font = `800 ${size}px ${f.display}`;
  while (ctx.measureText(face.title.toUpperCase()).width > 690 && size > 70) {
    size -= 6;
    ctx.font = `800 ${size}px ${f.display}`;
  }
  ctx.fillText(face.title.toUpperCase(), 142, 330);
  ctx.fillStyle = face.color === "#FFFFFF" ? "#FFD84D" : face.color;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(150, 350, Math.min(680, ctx.measureText(face.title.toUpperCase()).width), 22);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#477BFF";
  ctx.font = `700 60px ${f.hand}`;
  ctx.fillText(face.blurb, 150, 452);

  ctx.fillStyle = INK;
  ctx.font = `700 50px ${f.hand}`;
  face.lines.slice(0, 4).forEach((l, i) => {
    const t = l.length > 30 ? l.slice(0, 29) + "…" : l;
    ctx.fillText(t, 150, 568 + i * 62);
  });

  drawDoodle(ctx, f, face.doodle, r, face.color);
  chapterScraps(ctx, f, r, side, pageNo, face.color, face.title);

  ctx.save();
  ctx.translate(150, 1180);
  ctx.rotate(-0.02);
  const b = readButton(ctx, f, "READ CHAPTER →", 0, 0, face.color === "#FFFFFF" ? "#FFD84D" : face.color);
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
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(128, 128, 126, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e23b2e";
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = `800 44px ${f.display}`;
  ctx.fillText("DO NOT", 128, 118);
  ctx.fillText("PRESS", 128, 168);
  return toTexture(c, 4);
}

export function paintCuttingMat(f: Fonts, scale: number) {
  const W = 1800;
  const H = 1200;
  const { c, ctx } = canvas(scale, W, H);
  ctx.fillStyle = "#3f8f5a";
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, 12000, 21, "0,30,10");
  const cell = 50;
  for (let x = 0; x <= W; x += cell) {
    ctx.fillStyle = x % (cell * 5) === 0 ? "rgba(230,255,235,0.42)" : "rgba(230,255,235,0.18)";
    ctx.fillRect(x, 0, x % (cell * 5) === 0 ? 2.5 : 1.2, H);
  }
  for (let y = 0; y <= H; y += cell) {
    ctx.fillStyle = y % (cell * 5) === 0 ? "rgba(230,255,235,0.42)" : "rgba(230,255,235,0.18)";
    ctx.fillRect(0, y, W, y % (cell * 5) === 0 ? 2.5 : 1.2);
  }
  ctx.strokeStyle = "rgba(230,255,235,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(H, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(230,255,235,0.55)";
  ctx.font = `500 18px ${f.mono}`;
  for (let x = cell * 2; x < W; x += cell * 2) ctx.fillText(String(x / cell), x + 4, 22);
  for (let y = cell * 2; y < H; y += cell * 2) ctx.fillText(String(y / cell), 6, y - 4);
  vignette(ctx, W, H, 0.45);
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
