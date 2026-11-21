"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { site } from "@/config/site";
import { Decal, Mug, PaperClip3D, Pencil, Polaroid3D, StickyNote3D, WashiRoll } from "./props";
import { loadFonts, paintBlobShadow, paintCuttingMat, paintDecal, paintPhoto, paintSticky, paintWashi, readFonts } from "./textures";

type DeskTex = {
  mat: THREE.Texture;
  photoA: THREE.Texture;
  photoB: THREE.Texture;
  sticky: THREE.Texture;
  blob: THREE.Texture;
  washi: THREE.Texture[];
  decals: THREE.Texture[];
};

/** Home-page desk: a green cutting mat with a few things lying around. */
export function Desk({ quality, reduced, wide }: { quality: "low" | "high"; reduced: boolean; wide: boolean }) {
  const [tex, setTex] = useState<DeskTex | null>(null);
  useEffect(() => {
    let alive = true;
    const f = readFonts();
    loadFonts(f).then(() => {
      if (!alive) return;
      setTex({
        mat: paintCuttingMat(f, quality === "high" ? 1 : 0.5),
        photoA: paintPhoto(f, "#477BFF", "hackathon '2X", 3),
        photoB: paintPhoto(f, "#FFD84D", "the desk", 8),
        sticky: paintSticky(f, `hi! I'm ${site.firstName}. open me →`, "#FFD84D"),
        blob: paintBlobShadow(),
        washi: [paintWashi("#FF755E", "stripe"), paintWashi("#477BFF", "dots"), paintWashi("#FFD84D", "check")],
        decals: [
          paintDecal(f, "star", "#FFD84D"),
          paintDecal(f, "heart", "#FF755E"),
          paintDecal(f, "smile", "#477BFF"),
          paintDecal(f, "text", "#9DDC8B", "HELLO!"),
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

      {wide && (
        <>
          <group position={[-3.05, 0.04, 0.9]} rotation={[0, 0.5, 0]}>
            <Pencil />
          </group>
          <group position={[2.9, 0.003, -1.3]} rotation={[0, -0.35, 0]}>
            <Polaroid3D map={tex.photoA} />
          </group>
          <group position={[3.25, 0.012, -0.55]} rotation={[0, 0.25, 0]}>
            <Polaroid3D map={tex.photoB} size={0.6} />
          </group>
          <group position={[-2.9, 0.003, -1.1]} rotation={[0, 0.2, 0]}>
            <StickyNote3D map={tex.sticky} size={0.75} />
          </group>
          <group position={[2.85, 0.01, 1.2]} rotation={[0, 1.1, 0]}>
            <PaperClip3D />
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
