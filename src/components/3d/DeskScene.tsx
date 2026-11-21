"use client";

import { useFrame } from "@react-three/fiber";
import { PresentationControls, useCursor } from "@react-three/drei";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { DeskObjectId } from "@/data/desk";
import { Headphones, Laptop, Mug, Notebook, PenCup, Plant, Polaroid3D, StickyNote3D } from "./props";
import { CameraRig, Scene } from "./Scene";
import { loadFonts, paintBlobShadow, paintLabel, paintPhoto, paintSticky, paintWood, readFonts, type Fonts } from "./textures";


function paintScreen(f: Fonts) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#171717";
  ctx.fillRect(0, 0, 512, 320);
  ctx.font = `500 20px ${f.mono}`;
  const lines = [
    ["#9DDC8B", "~/diary $ npm run dev"],
    ["#F5EBD8", "  ▲ ready on :3000"],
    ["#FFD84D", "~/diary $ git commit -m"],
    ["#FFD84D", '  "more tape"'],
    ["#FF755E", "~/diary $ _"],
  ];
  lines.forEach(([col, t], i) => {
    ctx.fillStyle = col;
    ctx.fillText(t, 24, 50 + i * 44);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type Tex = {
  wood: THREE.Texture;
  p1: THREE.Texture;
  p2: THREE.Texture;
  sticky: THREE.Texture;
  label: THREE.Texture;
  screen: THREE.Texture;
  blob: THREE.Texture;
};

function Interactive({
  id,
  selected,
  onSelect,
  children,
  position,
  rotation,
  scale,
  reduced,
}: {
  id: DeskObjectId;
  selected: DeskObjectId | null;
  onSelect: (id: DeskObjectId) => void;
  children: ReactNode;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  reduced: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const active = hover || selected === id;
  useFrame((_, dt) => {
    if (!g.current) return;
    const k = reduced ? 1 : 1 - Math.exp(-10 * Math.min(dt, 0.05));
    g.current.position.y += ((active ? 0.18 : 0) - g.current.position.y) * k;
    const s = active ? 1.05 : 1;
    g.current.scale.x += (s - g.current.scale.x) * k;
    g.current.scale.y = g.current.scale.z = g.current.scale.x;
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group
        ref={g}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        {children}
      </group>
    </group>
  );
}

/** The /about desk: a wooden desk with personal objects you can poke. */
export default function DeskScene({
  quality,
  reduced,
  selected,
  onSelect,
  onReady,
}: {
  quality: "low" | "high";
  reduced: boolean;
  selected: DeskObjectId | null;
  onSelect: (id: DeskObjectId) => void;
  onReady: () => void;
}) {
  return (
    <Scene quality={quality} className="!absolute inset-0" camera={{ position: [0, 6, 5], fov: 30 }}>
      <CameraRig target={[0, 0.2, 0.2]} width={6.6} depth={4.4} direction={[0, 0.78, 0.62]} reduced={reduced} />
      <DeskContents quality={quality} reduced={reduced} selected={selected} onSelect={onSelect} onReady={onReady} />
    </Scene>
  );
}

function DeskContents({
  quality,
  reduced,
  selected,
  onSelect,
  onReady,
}: {
  quality: "low" | "high";
  reduced: boolean;
  selected: DeskObjectId | null;
  onSelect: (id: DeskObjectId) => void;
  onReady: () => void;
}) {
  const [tex, setTex] = useState<Tex | null>(null);
  useEffect(() => {
    let alive = true;
    const f = readFonts();
    loadFonts(f).then(() => {
      if (!alive) return;
      setTex({
        wood: paintWood(quality === "high" ? 1 : 0.5),
        p1: paintPhoto(f, "#FF755E", "somewhere good", 12),
        p2: paintPhoto(f, "#9DDC8B", "build night", 17),
        sticky: paintSticky(f, "click things on my desk :)", "#9DDC8B"),
        label: paintLabel(f, "SCRIBBLES", "#FFFFFF"),
        screen: paintScreen(f),
        blob: paintBlobShadow(),
      });
      requestAnimationFrame(onReady);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  const controls = !reduced;
  if (!tex) return null;
  const sel = { selected, onSelect, reduced };

  const content = (
    <group position={[0, 0, 0]}>
      {/* desk top */}
      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[8.4, 0.16, 5.4]} />
        <meshStandardMaterial attach="material-0" color="#8a5a33" />
        <meshStandardMaterial attach="material-1" color="#8a5a33" />
        <meshStandardMaterial attach="material-2" map={tex.wood} roughness={0.7} />
        <meshStandardMaterial attach="material-3" color="#8a5a33" />
        <meshStandardMaterial attach="material-4" color="#9b6a3f" />
        <meshStandardMaterial attach="material-5" color="#8a5a33" />
      </mesh>
      {quality === "low" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <planeGeometry args={[8, 5]} />
          <meshBasicMaterial map={tex.blob} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      )}

      <Interactive id="laptop" position={[-0.2, 0, -1.2]} {...sel}>
        <Laptop screen={tex.screen} />
      </Interactive>
      <Interactive id="coffee" position={[2.3, 0, 0.6]} scale={1.3} {...sel}>
        <Mug reduced={reduced} />
      </Interactive>
      <Interactive id="headphones" position={[2.6, 0.17, -1.35]} rotation={[-Math.PI / 2 + 0.1, 0, 0.5]} {...sel}>
        <Headphones />
      </Interactive>
      <Interactive id="notebook" position={[-2.4, 0, 0.7]} rotation={[0, 0.3, 0]} {...sel}>
        <Notebook label={tex.label} />
      </Interactive>
      <Interactive id="pens" position={[-2.9, 0, -1.3]} {...sel}>
        <PenCup />
      </Interactive>
      <Interactive id="photo1" position={[0.4, 0.01, 1.3]} rotation={[0, -0.25, 0]} {...sel}>
        <Polaroid3D map={tex.p1} size={0.8} />
      </Interactive>
      <Interactive id="photo2" position={[1.25, 0.02, 1.55]} rotation={[0, 0.2, 0]} {...sel}>
        <Polaroid3D map={tex.p2} size={0.7} />
      </Interactive>
      <Interactive id="plant" position={[3.0, 0, 1.45]} {...sel}>
        <Plant />
      </Interactive>
      <group position={[-1.1, 0.005, 1.6]} rotation={[0, 0.15, 0]}>
        <StickyNote3D map={tex.sticky} size={0.65} />
      </group>
    </group>
  );

  return controls ? (
    <PresentationControls global={false} cursor={false} snap polar={[-0.08, 0.12]} azimuth={[-0.35, 0.35]} speed={1.2}>
      {content}
    </PresentationControls>
  ) : (
    content
  );
}
