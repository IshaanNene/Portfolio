"use client";
/* eslint-disable react-hooks/immutability -- three.js geometry is mutated imperatively each frame by design */

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export const FLIP_EPS = 0.09; // flipped pages rest slightly sloped toward the desk

/**
 * Computes a curled-page polyline in the book's local x/z plane.
 * p = 0 lies flat on the right, p = 1 lies flat on the left.
 * While turning, the free edge lags behind the hinge which gives the
 * characteristic paper curl.
 */
export function curl(p: number, width: number, segments: number, out: Float32Array, stiffness = 0.75) {
  const theta = p * (Math.PI + FLIP_EPS);
  const bend = Math.sin(p * Math.PI) * stiffness;
  const dx = width / segments;
  let x = 0;
  let z = 0;
  out[0] = 0;
  out[1] = 0;
  for (let i = 0; i < segments; i++) {
    const t = (i + 0.5) / segments;
    const a = theta - bend * t * t * 1.6 + bend * 0.25 * t;
    x += Math.cos(a) * dx;
    z += Math.sin(a) * dx;
    out[(i + 1) * 2] = x;
    out[(i + 1) * 2 + 1] = z;
  }
}

type PageProps = {
  index: number;
  width: number;
  height: number;
  segments: number;
  front: THREE.Texture;
  back: THREE.Texture;
  flipped: boolean;
  zRest: number;
  zLeft: number;
  shadows: boolean;
  reduced: boolean;
  onFaceClick: (e: ThreeEvent<MouseEvent>, side: "front" | "back") => void;
};

/** One physical page: two-sided paper with CPU-driven curl during the turn. */
export function DiaryPage({ index, width, height, segments, front, back, flipped, zRest, zLeft, shadows, reduced, onFaceClick }: PageProps) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, segments, 1);
    g.translate(width / 2, 0, 0);
    return g;
  }, [width, height, segments]);
  const pts = useMemo(() => new Float32Array((segments + 1) * 2), [segments]);
  const progress = useRef(flipped ? 1 : 0);
  const settled = useRef(-1);

  const backTex = useMemo(() => {
    const t = back.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.x = -1;
    t.offset.x = 1;
    t.needsUpdate = true;
    return t;
  }, [back]);

  const apply = (p: number) => {
    curl(p, width, segments, pts);
    const z0 = THREE.MathUtils.lerp(zRest, zLeft, p);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    // PlaneGeometry: rows (y) × columns (x), row-major
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col <= segments; col++) {
        const i = row * (segments + 1) + col;
        pos.setX(i, pts[col * 2]);
        pos.setZ(i, pts[col * 2 + 1] + z0);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
  };

  useLayoutEffect(() => {
    apply(progress.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  useFrame((_, dt) => {
    const target = flipped ? 1 : 0;
    if (reduced) progress.current = target;
    else progress.current = THREE.MathUtils.damp(progress.current, target, 4.2 - index * 0.25, Math.min(dt, 0.05));
    if (Math.abs(progress.current - target) < 0.0008) progress.current = target;
    if (settled.current === progress.current) return;
    settled.current = progress.current;
    apply(progress.current);
  });

  return (
    <group>
      <mesh geometry={geo} castShadow={shadows} receiveShadow={shadows} onClick={(e) => onFaceClick(e, "front")}>
        <meshStandardMaterial map={front} roughness={0.92} side={THREE.FrontSide} />
      </mesh>
      <mesh geometry={geo} castShadow={shadows} receiveShadow={shadows} onClick={(e) => onFaceClick(e, "back")}>
        <meshStandardMaterial map={backTex} roughness={0.92} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
