"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { BOOK, Diary, type DiaryProps } from "./Diary";
import { Desk } from "./Desk";
import { CameraRig, Scene } from "./Scene";

const COVER_W = BOOK.W + BOOK.overhang;
const COVER_H = BOOK.H + BOOK.overhang * 1.6;

export type Focus = "spread" | "left" | "right";

function BookRig({ spread, focus, reduced, children }: { spread: number; focus: Focus; reduced: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const targetX = spread === 0 ? -COVER_W / 2 : focus === "left" ? COVER_W / 2 : focus === "right" ? -COVER_W / 2 - 0.12 : 0;
  useFrame(({ pointer }, dt) => {
    if (!g.current || !tilt.current) return;
    const k = reduced ? 1 : 1 - Math.exp(-3.4 * Math.min(dt, 0.05));
    g.current.position.x += (targetX - g.current.position.x) * k;
    if (!reduced) {
      tilt.current.rotation.x += (-pointer.y * 0.05 - tilt.current.rotation.x) * k;
      tilt.current.rotation.z += (-pointer.x * 0.04 - tilt.current.rotation.z) * k;
      tilt.current.rotation.y += ((spread === 0 ? 0.06 : 0) - tilt.current.rotation.y) * k;
    }
  });
  return (
    <group ref={tilt}>
      <group ref={g} position={[targetX, BOOK.T / 2 + BOOK.coverT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

/** Room kept for the bookmark tabs: full labels from 1440px, compact tabs from 768px, none on phones. */
const tabSpace = (w: number) => (w >= 1440 ? 200 : w >= 768 ? 96 : 0);

export default function HomeScene(
  props: Omit<DiaryProps, "quality"> & { quality: "low" | "high"; focus: Focus; wide: boolean },
) {
  const { spread, focus, quality, reduced, wide } = props;
  const frameW = spread === 0 ? COVER_W * 1.35 : focus === "spread" ? COVER_W * 2.36 : focus === "right" ? COVER_W * 1.3 : COVER_W * 1.14;
  return (
    <Scene quality={quality} className="!absolute inset-0 touch-pan-y">
      <CameraRig target={[0, 0.05, 0.08]} width={frameW} depth={COVER_H * 1.12} reduced={reduced} reserveRight={tabSpace} />
      <Desk quality={quality} reduced={reduced} wide={wide} />
      <BookRig spread={spread} focus={focus} reduced={reduced}>
        <Diary {...props} />
      </BookRig>
    </Scene>
  );
}
