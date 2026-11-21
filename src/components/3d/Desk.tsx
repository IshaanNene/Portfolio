"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { deskDrag } from "@/lib/deskDrag";
import { play } from "@/lib/sound";
import { site } from "@/config/site";
import { Decal, Mug, PaperClip3D, Pencil, Polaroid3D, StickyNote3D, WashiRoll } from "./props";
import { loadFonts, paintBlobShadow, paintCuttingMat, paintDecal, paintDeskPhoto, paintInkNote, paintSticky, paintTornSheet, paintWashi, readFonts } from "./textures";

type DeskTex = {
  mat: THREE.Texture;
  photoA: THREE.Texture;
  photoB: THREE.Texture;
  sticky: THREE.Texture;
  blob: THREE.Texture;
  washi: THREE.Texture[];
  decals: THREE.Texture[];
  sheets: THREE.Texture[];
  photoC: THREE.Texture;
  graph: THREE.Texture;
  notes: THREE.Texture[];
};

/** A sheet of paper that isn't quite flat: one corner lifts and the middle ripples a little. */
function Sheet({ map, w, h, curl = 0.05, seed = 1 }: { map: THREE.Texture; w: number; h: number; curl?: number; seed?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 12, 14);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / w + 0.5;
      const v = pos.getY(i) / h + 0.5;
      const lift = Math.max(0, u + (1 - v) - 1.35);
      pos.setZ(i, curl * lift * lift * 5 + 0.0025 * Math.sin(u * 7 + seed) * Math.sin(v * 5 + seed));
    }
    g.computeVertexNormals();
    return g;
  }, [w, h, curl, seed]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial map={map} transparent alphaTest={0.4} roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/**
 * Something on the desk you can pick up and put down somewhere else.
 * It lifts a little on hover, more while carried, and stays where it's dropped
 * (until the page reloads — desks get tidied).
 */
function Movable({
  position,
  rotation = [0, 0, 0],
  reduced,
  drag = true,
  sound = "pop",
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  reduced: boolean;
  /** false = it only lifts and pops (things tucked under the diary stay put) */
  drag?: boolean;
  sound?: "pop" | "paper" | "tick";
  children: React.ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const off = useRef<THREE.Vector3 | null>(null);
  const down = useRef<{ x: number; y: number } | null>(null);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const lift = useRef(0);
  const turn = useRef(0);
  const pop = useRef(0);
  const [hover, setHover] = useState(false);
  const [held, setHeld] = useState(false);
  useCursor(hover || held, drag ? (held ? "grabbing" : "grab") : "pointer");
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const d = Math.min(dt, 0.05);
    const target = held ? 0.07 : hover ? 0.018 : 0;
    lift.current = reduced ? target : THREE.MathUtils.damp(lift.current, target, 12, d);
    turn.current = reduced ? 0 : THREE.MathUtils.damp(turn.current, hover && !held ? 1 : 0, 8, d);
    pop.current = Math.max(0, pop.current - d * 2.4);
    const p = reduced ? 0 : pop.current;
    g.current.position.y = position[1] + lift.current + Math.sin(p * Math.PI) * 0.05;
    // springy click response + a small turn on hover
    g.current.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.18);
    g.current.rotation.y = rotation[1] + turn.current * 0.08 + Math.sin(clock.elapsedTime * 24) * p * 0.25;
  });
  const local = (e: ThreeEvent<PointerEvent>) => {
    if (!g.current?.parent || !e.ray.intersectPlane(FLOOR, hit)) return null;
    return g.current.parent.worldToLocal(hit.clone());
  };
  const target = (e: ThreeEvent<PointerEvent>) => e.target as unknown as Element;
  return (
    <group
      ref={g}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onPointerDown={(e) => {
        e.stopPropagation();
        down.current = { x: e.clientX, y: e.clientY };
        if (!drag) return;
        const p = local(e);
        if (!p || !g.current) return;
        off.current = new THREE.Vector3(g.current.position.x - p.x, 0, g.current.position.z - p.z);
        deskDrag.active = true;
        target(e).setPointerCapture?.(e.pointerId);
        setHeld(true);
      }}
      onPointerMove={(e) => {
        if (!off.current || !g.current) return;
        e.stopPropagation();
        const p = local(e);
        if (!p) return;
        g.current.position.x = THREE.MathUtils.clamp(p.x + off.current.x, -3.7, 3.7);
        g.current.position.z = THREE.MathUtils.clamp(p.z + off.current.z, -2.4, 2.5);
      }}
      onPointerUp={(e) => {
        const start = down.current;
        down.current = null;
        if (!start) return;
        e.stopPropagation();
        const tap = Math.hypot(e.clientX - start.x, e.clientY - start.y) < 5;
        if (tap) {
          pop.current = 1;
          play(sound);
        } else play("paper");
        if (!off.current) return;
        off.current = null;
        target(e).releasePointerCapture?.(e.pointerId);
        setHeld(false);
        // let the page-level swipe handler see the flag before clearing it
        setTimeout(() => (deskDrag.active = false), 0);
      }}
    >
      {children}
    </group>
  );
}

/**
 * Something on the desk with more to say: hover (or tap) and a taped slip
 * appears with the context behind it.
 */
function Reveal({ position, rotation = [0, 0, 0], note, children }: { position: [number, number, number]; rotation?: [number, number, number]; note: string; children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  useCursor(on, "help");
  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setOn(true);
      }}
      onPointerOut={() => setOn(false)}
      onClick={(e) => {
        e.stopPropagation();
        setOn((v) => !v);
        play("paper");
      }}
    >
      {children}
      {on && (
        <Html position={[0, 0.08, -0.25]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="relative w-56 -rotate-2 border-2 border-ink bg-paper px-3 pb-2 pt-3 shadow-brutal">
            <span className="absolute -top-2.5 left-1/2 h-4 w-14 -translate-x-1/2 rotate-3 bg-sun/80" />
            <p className="font-hand text-lg font-bold leading-tight text-ink">{note}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/** Handwriting straight on the mat (or on paper). */
function InkNote({ map, w = 1.1 }: { map: THREE.Texture; w?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
      <planeGeometry args={[w, (w * 240) / 560]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} opacity={0.88} toneMapped={false} />
    </mesh>
  );
}

/** Home-page desk: a green cutting mat with a few things lying around. */
export function Desk({ quality, reduced, wide }: { quality: "low" | "high"; reduced: boolean; wide: boolean }) {
  const [tex, setTex] = useState<DeskTex | null>(null);
  useEffect(() => {
    let alive = true;
    const f = readFonts();
    loadFonts(f).then(async () => {
      const [pa, pb, pc] = await Promise.all([
        paintDeskPhoto(f, site.deskPhotos[0], "#477BFF", 3),
        paintDeskPhoto(f, site.deskPhotos[1], "#FF755E", 21),
        paintDeskPhoto(f, site.deskPhotos[2], "#FFD84D", 8),
      ]);
      if (!alive) return;
      setTex({
        mat: paintCuttingMat(f, quality === "high" ? 1 : 0.5),
        photoA: pa,
        photoB: pc,
        photoC: pb,
        sticky: paintSticky(f, `hi! I'm ${site.firstName}. open me →`, "#FFD84D"),
        blob: paintBlobShadow(),
        sheets: [paintTornSheet("#d9c19a", 3), paintTornSheet("#FBF5E8", 7, true), paintTornSheet("#B5835A", 11)],
        graph: paintTornSheet("#f4f7ef", 19, false, true),
        notes: [
          paintInkNote(f, "works on my machine", "left", "#f5f0e0", 2),
          paintInkNote(f, "one more experiment...", "left", "#f5f0e0", 5),
          paintInkNote(f, "don't forget to ship this", "up", "#f5f0e0", 9),
        ],
        washi: [paintWashi("#FF755E", "stripe"), paintWashi("#477BFF", "dots"), paintWashi("#FFD84D", "check")],
        decals: [
          paintDecal(f, "star", "#FFD84D"),
          paintDecal(f, "bolt", "#FF755E"),
          paintDecal(f, "text", "#477BFF", "</>"),
          paintDecal(f, "text", "#9DDC8B", "SHIP IT"),
          paintDecal(f, "bolt", "#FFD84D"),
        ],
      });
    });
    return () => {
      alive = false;
    };
  }, [quality]);

  if (!tex) return null;
  const shadows = quality === "high";

  return (
    <group>
      {/* tabletop under the mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} receiveShadow={shadows}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e9dcc3" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.03]} position={[0, 0, 0.1]} receiveShadow={shadows}>
        <planeGeometry args={[7.6, 5.07]} />
        <meshStandardMaterial map={tex.mat} roughness={0.95} />
      </mesh>

      {!shadows && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.05]}>
          <planeGeometry args={[4.6, 3.6]} />
          <meshBasicMaterial map={tex.blob} transparent opacity={0.7} depthWrite={false} />
        </mesh>
      )}

      {/* background layer: big sheets under the diary, slightly lifted at the corners */}
      <group position={[0.12, 0.0015, -0.08]} rotation={[0, 0.1, 0]}>
        <Sheet map={tex.sheets[0]} w={2.15} h={2.69} curl={0.03} seed={1} />
      </group>
      <Reveal position={[-0.62, 0.0028, -0.55]} rotation={[0, -0.22, 0]} note="napkin sketch of Meridian: API → Kafka → Rust workers → Postgres. the arrows took three tries.">
        <Sheet map={tex.graph} w={0.9} h={1.12} curl={0.06} seed={4} />
      </Reveal>
      <group position={[-0.7, 0.0035, 0.45]} rotation={[0, 0.38, 0]}>
        <Sheet map={tex.sheets[1]} w={1.2} h={1.5} curl={0.07} seed={2} />
      </group>
      <group position={[0.7, 0.003, 0.95]} rotation={[0, -0.6, 0]}>
        <Sheet map={tex.sheets[2]} w={0.7} h={0.88} curl={0.04} seed={3} />
      </group>
      <Movable reduced={reduced} drag={false} sound="paper" position={[0.92, 0.002, -0.92]} rotation={[0, -0.45, 0]}>
        <Polaroid3D map={tex.photoC} size={0.62} />
      </Movable>
      <Movable reduced={reduced} drag={false} sound="paper" position={[-0.95, 0.002, -0.75]} rotation={[0, 0.55, 0]}>
        <Polaroid3D map={tex.photoA} size={0.55} />
      </Movable>

      {wide && (
        <>
          <Movable reduced={reduced} position={[-3.05, 0.04, 0.9]} rotation={[0, 0.5, 0]}>
            <Pencil />
          </Movable>
          <Movable reduced={reduced} position={[2.95, 0.003, -1.25]} rotation={[0, -0.35, 0]}>
            <Polaroid3D map={tex.photoB} />
          </Movable>
          <Movable reduced={reduced} position={[-2.9, 0.003, -1.1]} rotation={[0, 0.2, 0]}>
            <StickyNote3D map={tex.sticky} size={0.75} />
          </Movable>
          <group position={[2.85, 0.01, 1.2]} rotation={[0, 1.1, 0]}>
            <PaperClip3D />
          </group>
          {/* foreground: handwriting added later, pointing at things */}
          <Reveal position={[-2.55, 0, 1.55]} rotation={[0, 0.08, 0]} note="…famous last words. every project since has shipped with a Dockerfile.">
            <InkNote map={tex.notes[0]} />
          </Reveal>
          <Reveal position={[1.36, 0, 0.5]} rotation={[0, 0.06, 0]} note="it is never just one. the Lab page is where they end up.">
            <InkNote map={tex.notes[1]} w={0.62} />
          </Reveal>
          <Reveal position={[-1.5, 0, 1.18]} rotation={[0, 0.05, 0]} note="shipped so far: Meridian, DebugAssist, a chess engine and three more. see Projects.">
            <InkNote map={tex.notes[2]} w={0.8} />
          </Reveal>
          <Reveal position={[-3.4, 0, 2.1]} note="coffee #4. it is 1:47am. the bug was a missing semicolon.">
            <group scale={1.4}>
              <Mug reduced={reduced} />
            </group>
          </Reveal>

          {/* scrapbooking supplies */}
          <Movable reduced={reduced} position={[-1.85, 0, 0.5]} rotation={[0, 0.3, 0]}>
            <WashiRoll color="#FF755E" stripMap={tex.washi[0]} strip={0.55} />
          </Movable>
          <Movable reduced={reduced} position={[-2.2, 0, 0.0]} rotation={[0, -0.6, 0]}>
            <WashiRoll color="#477BFF" stripMap={tex.washi[1]} />
          </Movable>
          <Movable reduced={reduced} position={[2.0, 0, 0.7]} rotation={[0, 2.6, 0]}>
            <WashiRoll color="#FFD84D" stripMap={tex.washi[2]} strip={0.4} />
          </Movable>
          <Movable reduced={reduced} position={[-1.75, 0, -0.8]} rotation={[0, 0.4, 0]}>
            <Decal map={tex.decals[0]} size={0.34} />
          </Movable>
          <Movable reduced={reduced} position={[2.15, 0, -0.15]} rotation={[0, -0.3, 0]}>
            <Decal map={tex.decals[1]} size={0.3} />
          </Movable>
          <Movable reduced={reduced} position={[2.4, 0, -0.95]} rotation={[0, 0.2, 0]}>
            <Decal map={tex.decals[2]} size={0.28} />
          </Movable>
          <Movable reduced={reduced} position={[-2.35, 0, -1.25]} rotation={[0, -0.25, 0]}>
            <Decal map={tex.decals[3]} size={0.46} />
          </Movable>
          <Movable reduced={reduced} position={[1.95, 0, 1.6]} rotation={[0, 0.5, 0]}>
            <Decal map={tex.decals[4]} size={0.26} />
          </Movable>
        </>
      )}
    </group>
  );
}
