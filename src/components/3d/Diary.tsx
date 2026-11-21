"use client";

import { useFrame } from "@react-three/fiber";
import { Edges, useCursor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { chapterTabs, diaryBlockTop, diaryInsideCover, diaryPages, type ChapterTab } from "@/data/diary";
import { DiaryCover, type CoverLayers } from "./DiaryCover";
import { DiaryPage } from "./DiaryPages";
import {
  loadFonts,
  paintLeather,
  leatherMapUrl,
  LEATHER_TILE,
  paintCover,
  paintCoverNote,
  paintCoverPhoto,
  paintNameplate,
  paintDoNotPress,
  paintFace,
  paintFlag,
  paintNote,
  paintPageEdges,
  paintPhoto,
  paintTicket,
  readFonts,
  type LinkRect,
  type Painted,
  PAGE_H,
  PAGE_W,
} from "./textures";

/* ── physical dimensions (scene units ≈ decimetres) ── */
export const BOOK = {
  W: 1.5, // page width
  H: 2.1, // page height
  T: 0.16, // page block thickness
  coverT: 0.055,
  overhang: 0.05,
  gap: 0.0042,
};
const COVER_W = BOOK.W + BOOK.overhang;
const COVER_H = BOOK.H + BOOK.overhang * 1.6;
const PAGE_X = 0.014;
const PAGE_WIDTH = BOOK.W - 0.02;
const PAGE_HEIGHT = BOOK.H - 0.02;
const N = diaryPages.length;

type Textures = {
  cover: Painted;
  inside: Painted;
  pages: { front: Painted; back: Painted }[];
  blockTop: Painted;
  edgesH: THREE.Texture;
  edgesV: THREE.Texture;
  cloth: THREE.Texture;
  clothDark: THREE.Texture;
  leatherMaps: LeatherMaps;
  sticker: THREE.Texture;
  flags: THREE.Texture[];
  ticket: THREE.Texture;
  photo: THREE.Texture;
  note: THREE.Texture;
  layers: CoverLayers;
};

export type LeatherMaps = { normal: THREE.Texture | null; rough: THREE.Texture | null };

/** Normal + roughness from the leather scan, tiled to line up with the painted colour. */
async function loadLeatherMaps(): Promise<LeatherMaps> {
  const loader = new THREE.TextureLoader();
  const load = (m: "nor_gl" | "rough") =>
    loader.loadAsync(leatherMapUrl(m)).then(
      (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(PAGE_W / LEATHER_TILE, PAGE_H / LEATHER_TILE);
        t.anisotropy = 4;
        return t;
      },
      () => null,
    );
  const [normal, rough] = await Promise.all([load("nor_gl"), load("rough")]);
  return { normal, rough };
}

async function buildTextures(scale: number): Promise<Textures> {
  const f = readFonts();
  await loadFonts(f);
  const cover = await paintCover(f, scale, true);
  const layers: CoverLayers = { nameplate: paintNameplate(f), photo: await paintCoverPhoto(f), note: paintCoverNote(f) };
  const inside = paintFace(diaryInsideCover, f, scale, "left", 0);
  const pages = diaryPages.map((p, i) => ({
    front: paintFace(p.front, f, scale, "right", i * 2 + 1),
    back: paintFace(p.back, f, scale, "left", i * 2 + 2),
  }));
  const blockTop = paintFace(diaryBlockTop, f, scale, "right", 99);
  return {
    cover,
    inside,
    pages,
    blockTop,
    edgesH: paintPageEdges(1, true),
    edgesV: paintPageEdges(1, false),
    cloth: await paintLeather(1),
    clothDark: await paintLeather(1, "#2e1a0e", 17),
    leatherMaps: await loadLeatherMaps(),
    sticker: paintDoNotPress(f),
    flags: chapterTabs.map((t) => paintFlag(f, t.page, t.title, t.color === "#FFFFFF" ? "#F5EBD8" : t.color)),
    ticket: paintTicket(f, "#FFD84D", "Hackathon", 6),
    photo: paintPhoto(f, "#9DDC8B", "summer '2X", 13),
    note: paintNote(f, "don't forget: drink water, push code"),
    layers,
  };
}

function hitLink(links: LinkRect[], uv: THREE.Vector2 | undefined, mirrored: boolean) {
  if (!uv) return null;
  const x = (mirrored ? 1 - uv.x : uv.x) * PAGE_W;
  const y = (1 - uv.y) * PAGE_H;
  return links.find((l) => x >= l.x && x <= l.x + l.w && y >= l.y && y <= l.y + l.h)?.href ?? null;
}

export type DiaryProps = {
  spread: number;
  quality: "low" | "high";
  reduced: boolean;
  onNext: () => void;
  onPrev: () => void;
  onLink: (href: string) => void;
  onSticker: () => void;
  onJump: (spread: number, side: "left" | "right") => void;
  onReady: () => void;
};

/* loose sheets peeking out of the page block (deterministic) */
const LOOSE = [
  { dx: 0.012, dy: -0.006, dw: 0.0, dh: 0.006, rot: 0.006, z: 0.18, color: "#efe4cc" },
  { dx: -0.004, dy: 0.01, dw: 0.016, dh: -0.01, rot: -0.008, z: 0.34, color: "#f6efdf" },
  { dx: 0.016, dy: 0.004, dw: -0.006, dh: 0.0, rot: 0.004, z: 0.5, color: "#e8dcc0" },
  { dx: 0.006, dy: -0.012, dw: 0.01, dh: 0.012, rot: -0.005, z: 0.66, color: "#f2e9d6" },
  { dx: 0.02, dy: 0.008, dw: -0.012, dh: -0.006, rot: 0.009, z: 0.82, color: "#ebe0c6" },
];

/* ── index flags on the fore-edge ── */
const FLAG_L = 0.46;
const FLAG_H = 0.17;
const FLAG_OUT = 0.27;

function IndexFlag({
  tab,
  map,
  y,
  z,
  out,
  tilt,
  active,
  reduced,
  onJump,
}: {
  tab: ChapterTab;
  map: THREE.Texture;
  y: number;
  z: number;
  out: number;
  tilt: number;
  active: boolean;
  reduced: boolean;
  onJump: (spread: number, side: "left" | "right") => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const color = tab.color === "#FFFFFF" ? "#F5EBD8" : tab.color;
  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = reduced ? 1 : 1 - Math.exp(-12 * Math.min(dt, 0.05));
    const target = out + (hover ? 0.06 : 0) + (active ? 0.035 : 0) - FLAG_L / 2;
    ref.current.position.x += (target - ref.current.position.x) * k;
  });
  return (
    <group position={[PAGE_X + PAGE_WIDTH, y, z]} rotation={[0, 0, tilt]}>
      <mesh
        ref={ref}
        position={[out - FLAG_L / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => {
          e.stopPropagation();
          onJump(tab.spread, tab.side);
        }}
      >
        <boxGeometry args={[FLAG_L, FLAG_H, 0.004]} />
        <meshStandardMaterial attach="material-0" color={color} roughness={0.6} />
        <meshStandardMaterial attach="material-1" color={color} roughness={0.6} />
        <meshStandardMaterial attach="material-2" color={color} roughness={0.6} />
        <meshStandardMaterial attach="material-3" color={color} roughness={0.6} />
        <meshStandardMaterial attach="material-4" map={map} roughness={0.55} />
        <meshStandardMaterial attach="material-5" map={map} roughness={0.55} />
      </mesh>
    </group>
  );
}

/* ── satin ribbon bookmarks: slope out of the pages, then lie on the desk ── */
function Ribbon({ x, len, yaw, color, drop }: { x: number; len: number; yaw: number; color: string; drop: number }) {
  const W = 0.065;
  const tail = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-W / 2, 0);
    s.lineTo(W / 2, 0);
    s.lineTo(W / 2, -len);
    s.lineTo(0, -len + 0.045);
    s.lineTo(-W / 2, -len);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, [len]);
  const run = 0.13;
  const slope = Math.hypot(run, drop);
  return (
    <group position={[x, -PAGE_HEIGHT / 2 + 0.02, -0.025]} rotation={[0, 0, yaw]}>
      <mesh position={[0, -run / 2, -drop / 2]} rotation={[Math.atan2(drop, run), 0, 0]}>
        <planeGeometry args={[W, slope]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={tail} position={[0, -run, -drop]}>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * The procedural hardcover diary: back board, page block with visible
 * page edges, cloth spine, hinged front cover, five individually curling
 * pages, an elastic band and a ribbon bookmark.
 */
export function Diary({ spread, quality, reduced, onNext, onPrev, onLink, onSticker, onJump, onReady }: DiaryProps) {
  const [tex, setTex] = useState<Textures | null>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const band = useRef<THREE.Group>(null);
  const shadows = quality === "high";
  const segments = quality === "high" ? 28 : 16;

  useEffect(() => {
    let alive = true;
    buildTextures(quality === "high" ? 1 : 0.62).then((t) => {
      if (!alive) return;
      setTex(t);
      requestAnimationFrame(() => onReady());
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  useEffect(
    () => () => {
      if (!tex) return;
      [tex.cover, tex.inside, tex.blockTop, ...tex.pages.flatMap((p) => [p.front, p.back])].forEach((p) => p.texture.dispose());
      [tex.edgesH, tex.edgesV, tex.cloth, tex.clothDark, tex.leatherMaps.normal, tex.leatherMaps.rough, tex.sticker, tex.ticket, tex.photo, tex.note, ...tex.flags, tex.layers.nameplate, tex.layers.photo, tex.layers.note].forEach((t) => t?.dispose());
    },
    [tex],
  );

  const blockDepth = BOOK.T - N * BOOK.gap - 0.004;
  const blockMaterials = useMemo(() => {
    if (!tex) return null;
    const v = new THREE.MeshStandardMaterial({ map: tex.edgesV, roughness: 1 });
    const h = new THREE.MeshStandardMaterial({ map: tex.edgesH, roughness: 1 });
    return [h, h, v, v, new THREE.MeshStandardMaterial({ map: tex.blockTop.texture, roughness: 0.95 }), h];
  }, [tex]);

  const coverOpen = spread >= 1;
  const hingeZ = BOOK.T / 2 + BOOK.coverT / 2;

  useFrame((_, dt) => {
    if (!band.current) return;
    const closed = !coverOpen;
    const k = reduced ? 1 : 1 - Math.exp(-6 * Math.min(dt, 0.05));
    const g = band.current;
    g.position.x += ((closed ? COVER_W * 0.93 : COVER_W + 0.14) - g.position.x) * k;
    g.scale.z += ((closed ? 1 : 0.04) - g.scale.z) * k;
    g.position.z += ((closed ? 0 : -BOOK.T / 2 - BOOK.coverT) - g.position.z) * k;
  });

  if (!tex || !blockMaterials) return null;

  const bandH = COVER_H + 0.02;
  const bandZ = BOOK.T + BOOK.coverT * 2 + 0.012;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      {/* back board */}
      <mesh position={[COVER_W / 2, 0, -BOOK.T / 2 - BOOK.coverT / 2]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[COVER_W, COVER_H, BOOK.coverT]} />
        <meshStandardMaterial map={tex.cloth} normalMap={tex.leatherMaps.normal} roughnessMap={tex.leatherMaps.rough} roughness={0.9} />
        <Edges color="#1c0f07" threshold={20} />
      </mesh>

      {/* spine */}
      <mesh position={[-BOOK.coverT / 2, 0, 0]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[BOOK.coverT, COVER_H, BOOK.T + BOOK.coverT * 2]} />
        <meshStandardMaterial map={tex.clothDark} normalMap={tex.leatherMaps.normal} roughnessMap={tex.leatherMaps.rough} roughness={0.9} />
      </mesh>

      {/* page block */}
      <mesh
        position={[PAGE_X + PAGE_WIDTH / 2, 0, -BOOK.T / 2 + blockDepth / 2]}
        material={blockMaterials}
        castShadow={shadows}
        receiveShadow={shadows}
        onClick={(e) => {
          e.stopPropagation();
          const href = e.face && e.face.normal.z > 0.5 ? hitLink(tex.blockTop.links, e.uv, false) : null;
          if (href) onLink(href);
        }}
      >
        <boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, blockDepth]} />
      </mesh>

      {/* loose, slightly misaligned sheets so the block's edges look hand-stacked */}
      {LOOSE.map((l, i) => (
        <mesh key={i} position={[PAGE_X + PAGE_WIDTH / 2 + l.dx, l.dy, -BOOK.T / 2 + blockDepth * l.z]} rotation={[0, 0, l.rot]}>
          <boxGeometry args={[PAGE_WIDTH + l.dw, PAGE_HEIGHT + l.dh, 0.0025]} />
          <meshStandardMaterial color={l.color} roughness={1} />
        </mesh>
      ))}

      {/* raised bands across the spine + stitched headbands */}
      {[-0.36, -0.12, 0.12, 0.36].map((f) => (
        <mesh key={f} position={[-BOOK.coverT / 2 - 0.004, f * COVER_H, 0]} castShadow={shadows}>
          <boxGeometry args={[BOOK.coverT + 0.012, 0.028, BOOK.T + BOOK.coverT * 2 + 0.006]} />
          <meshStandardMaterial map={tex.clothDark} color="#8a6a52" roughness={0.65} />
        </mesh>
      ))}
      {[1, -1].map((sgn) => (
        <mesh key={sgn} position={[0.012, sgn * (PAGE_HEIGHT / 2 + 0.004), -BOOK.T / 2 + blockDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, blockDepth, 10]} />
          <meshStandardMaterial color={sgn > 0 ? "#FFD84D" : "#477BFF"} roughness={0.6} />
        </mesh>
      ))}

      {/* individually turning pages */}
      <group position={[PAGE_X, 0, 0]}>
        {tex.pages.map((p, i) => (
          <DiaryPage
            key={i}
            index={i}
            width={PAGE_WIDTH}
            height={PAGE_HEIGHT}
            segments={segments}
            front={p.front.texture}
            back={p.back.texture}
            flipped={spread >= i + 2}
            zRest={BOOK.T / 2 - 0.003 - i * BOOK.gap}
            zLeft={BOOK.T / 2 + BOOK.coverT + 0.004 + i * BOOK.gap}
            shadows={shadows}
            reduced={reduced}
            onFaceClick={(e, side) => {
              e.stopPropagation();
              const flipped = spread >= i + 2;
              const href = side === "front" ? hitLink(p.front.links, e.uv, false) : hitLink(p.back.links, e.uv, true);
              if (href) return onLink(href);
              if (flipped) onPrev();
              else onNext();
            }}
          />
        ))}
      </group>

      {/* front cover */}
      <DiaryCover
        width={COVER_W}
        height={COVER_H}
        thickness={BOOK.coverT}
        hingeZ={hingeZ}
        open={coverOpen}
        cover={tex.cover.texture}
        inside={tex.inside.texture}
        cloth={tex.cloth}
        leatherMaps={tex.leatherMaps}
        sticker={tex.sticker}
        layers={tex.layers}
        shadows={shadows}
        reduced={reduced}
        onStickerPress={onSticker}
        onFaceClick={(e, face) => {
          if (!coverOpen) return onNext();
          if (face === "inside") {
            const href = hitLink(tex.inside.links, e.uv, false);
            if (href) return onLink(href);
          }
          onPrev();
        }}
      />

      {/* leather wrap strap — slides off when the diary opens */}
      <group ref={band} position={[COVER_W * 0.93, 0, 0]}>
        {[1, -1].map((s) => (
          <mesh key={"f" + s} position={[0, 0, s * (bandZ / 2 - 0.003)]}>
            <boxGeometry args={[0.085, bandH, 0.01]} />
            <meshStandardMaterial map={tex.cloth} color="#c58a52" roughness={0.7} />
          </mesh>
        ))}
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, (s * bandH) / 2, 0]}>
            <boxGeometry args={[0.085, 0.012, bandZ]} />
            <meshStandardMaterial map={tex.cloth} color="#c58a52" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* three satin ribbon bookmarks fanning out of the bottom */}
      <Ribbon x={PAGE_X + PAGE_WIDTH * 0.42} len={0.34} yaw={-0.32} color="#477BFF" drop={BOOK.T / 2 + BOOK.coverT - 0.03} />
      <Ribbon x={PAGE_X + PAGE_WIDTH * 0.55} len={0.46} yaw={0.04} color="#FF755E" drop={BOOK.T / 2 + BOOK.coverT - 0.028} />
      <Ribbon x={PAGE_X + PAGE_WIDTH * 0.68} len={0.3} yaw={0.36} color="#FFD84D" drop={BOOK.T / 2 + BOOK.coverT - 0.026} />

      {/* chapter index flags stuck along the fore-edge */}
      {chapterTabs.map((t, i) => {
        const left = spread >= 1 && spread === t.spread;
        return (
          <IndexFlag
            key={t.href}
            tab={t}
            map={tex.flags[i]}
            y={PAGE_HEIGHT / 2 - 0.2 - i * ((PAGE_HEIGHT - 0.36) / Math.max(1, chapterTabs.length - 1))}
            z={-BOOK.T / 2 + blockDepth - 0.008 - i * 0.011}
            out={FLAG_OUT - (i % 2) * 0.03}
            tilt={(i % 3 === 0 ? 1 : -1) * 0.025}
            active={left}
            reduced={reduced}
            onJump={onJump}
          />
        );
      })}

      {/* scrapbook clutter tucked between the pages, poking out of the top edge */}
      <mesh position={[PAGE_X + 0.42, PAGE_HEIGHT / 2 + 0.05, -BOOK.T / 2 + blockDepth - 0.02]} rotation={[0, 0, 0.13]}>
        <planeGeometry args={[0.62, 0.285]} />
        <meshStandardMaterial map={tex.ticket} transparent alphaTest={0.4} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[PAGE_X + 1.08, PAGE_HEIGHT / 2 + 0.02, -BOOK.T / 2 + blockDepth - 0.05]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshStandardMaterial map={tex.photo} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[PAGE_X + 0.82, PAGE_HEIGHT / 2 - 0.02, -BOOK.T / 2 + blockDepth - 0.035]} rotation={[0, 0, 0.32]}>
        <planeGeometry args={[0.34, 0.34]} />
        <meshStandardMaterial map={tex.note} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
