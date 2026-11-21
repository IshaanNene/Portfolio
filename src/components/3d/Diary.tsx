"use client";

import { useFrame } from "@react-three/fiber";
import { Edges, useCursor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { diaryBlockTop, diaryInsideCover, diaryPages } from "@/data/diary";
import { DiaryCover } from "./DiaryCover";
import { DiaryPage } from "./DiaryPages";
import {
  loadFonts,
  paintCloth,
  paintCover,
  paintDoNotPress,
  paintFace,
  paintPageEdges,
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
  coverT: 0.045,
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
  sticker: THREE.Texture;
};

async function buildTextures(scale: number): Promise<Textures> {
  const f = readFonts();
  await loadFonts(f);
  const cover = await paintCover(f, scale);
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
    cloth: paintCloth("#FF755E", 1),
    clothDark: paintCloth("#171717", 1),
    sticker: paintDoNotPress(f),
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
  onReady: () => void;
};

/**
 * The procedural hardcover diary: back board, page block with visible
 * page edges, cloth spine, hinged front cover, five individually curling
 * pages, an elastic band and a ribbon bookmark.
 */
export function Diary({ spread, quality, reduced, onNext, onPrev, onLink, onSticker, onReady }: DiaryProps) {
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
      [tex.edgesH, tex.edgesV, tex.cloth, tex.clothDark, tex.sticker].forEach((t) => t.dispose());
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
        <meshStandardMaterial map={tex.cloth} roughness={0.85} />
        <Edges color="#171717" threshold={20} />
      </mesh>

      {/* spine */}
      <mesh position={[-BOOK.coverT / 2, 0, 0]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[BOOK.coverT, COVER_H, BOOK.T + BOOK.coverT * 2]} />
        <meshStandardMaterial map={tex.clothDark} roughness={0.8} />
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
        sticker={tex.sticker}
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

      {/* elastic band — slides off when the diary opens */}
      <group ref={band} position={[COVER_W * 0.93, 0, 0]}>
        {[1, -1].map((s) => (
          <mesh key={"f" + s} position={[0, 0, s * (bandZ / 2 - 0.003)]}>
            <boxGeometry args={[0.07, bandH, 0.006]} />
            <meshStandardMaterial color="#171717" roughness={0.6} />
          </mesh>
        ))}
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, (s * bandH) / 2, 0]}>
            <boxGeometry args={[0.07, 0.008, bandZ]} />
            <meshStandardMaterial color="#171717" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ribbon bookmark peeking out of the bottom */}
      <mesh position={[PAGE_X + PAGE_WIDTH * 0.64, -PAGE_HEIGHT / 2 - 0.16, -0.02]} rotation={[-0.55, 0, 0.08]} castShadow={shadows}>
        <boxGeometry args={[0.07, 0.38, 0.004]} />
        <meshStandardMaterial color="#477BFF" roughness={0.5} />
      </mesh>
    </group>
  );
}
