"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
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
      <group position={[-0.62, 0.0028, -0.55]} rotation={[0, -0.22, 0]}>
        <Sheet map={tex.graph} w={0.9} h={1.12} curl={0.06} seed={4} />
      </group>
      <group position={[-0.7, 0.0035, 0.45]} rotation={[0, 0.38, 0]}>
        <Sheet map={tex.sheets[1]} w={1.2} h={1.5} curl={0.07} seed={2} />
      </group>
      <group position={[0.7, 0.003, 0.95]} rotation={[0, -0.6, 0]}>
        <Sheet map={tex.sheets[2]} w={0.7} h={0.88} curl={0.04} seed={3} />
      </group>
      <group position={[0.92, 0.002, -0.92]} rotation={[0, -0.45, 0]}>
        <Polaroid3D map={tex.photoC} size={0.62} />
      </group>
      <group position={[-0.95, 0.002, -0.75]} rotation={[0, 0.55, 0]}>
        <Polaroid3D map={tex.photoA} size={0.55} />
      </group>

      {wide && (
        <>
          <group position={[-3.05, 0.04, 0.9]} rotation={[0, 0.5, 0]}>
            <Pencil />
          </group>
          <group position={[2.95, 0.003, -1.25]} rotation={[0, -0.35, 0]}>
            <Polaroid3D map={tex.photoB} />
          </group>
          <group position={[-2.9, 0.003, -1.1]} rotation={[0, 0.2, 0]}>
            <StickyNote3D map={tex.sticky} size={0.75} />
          </group>
          <group position={[2.85, 0.01, 1.2]} rotation={[0, 1.1, 0]}>
            <PaperClip3D />
          </group>
          {/* foreground: handwriting added later, pointing at things */}
          <group position={[-2.55, 0, 1.55]} rotation={[0, 0.08, 0]}>
            <InkNote map={tex.notes[0]} />
          </group>
          <group position={[1.36, 0, 0.5]} rotation={[0, 0.06, 0]}>
            <InkNote map={tex.notes[1]} w={0.62} />
          </group>
          <group position={[-1.5, 0, 1.18]} rotation={[0, 0.05, 0]}>
            <InkNote map={tex.notes[2]} w={0.8} />
          </group>
          <group position={[-3.4, 0, 2.1]} scale={1.4}>
            <Mug reduced={reduced} />
          </group>

          {/* scrapbooking supplies */}
          <group position={[-1.85, 0, 0.5]} rotation={[0, 0.3, 0]}>
            <WashiRoll color="#FF755E" stripMap={tex.washi[0]} strip={0.55} />
          </group>
          <group position={[-2.2, 0, 0.0]} rotation={[0, -0.6, 0]}>
            <WashiRoll color="#477BFF" stripMap={tex.washi[1]} />
          </group>
          <group position={[2.0, 0, 0.7]} rotation={[0, 2.6, 0]}>
            <WashiRoll color="#FFD84D" stripMap={tex.washi[2]} strip={0.4} />
          </group>
          <group position={[-1.75, 0, -0.8]} rotation={[0, 0.4, 0]}>
            <Decal map={tex.decals[0]} size={0.34} />
          </group>
          <group position={[2.15, 0, -0.15]} rotation={[0, -0.3, 0]}>
            <Decal map={tex.decals[1]} size={0.3} />
          </group>
          <group position={[2.4, 0, -0.95]} rotation={[0, 0.2, 0]}>
            <Decal map={tex.decals[2]} size={0.28} />
          </group>
          <group position={[-2.35, 0, -1.25]} rotation={[0, -0.25, 0]}>
            <Decal map={tex.decals[3]} size={0.46} />
          </group>
          <group position={[1.95, 0, 1.6]} rotation={[0, 0.5, 0]}>
            <Decal map={tex.decals[4]} size={0.26} />
          </group>
        </>
      )}
    </group>
  );
}
