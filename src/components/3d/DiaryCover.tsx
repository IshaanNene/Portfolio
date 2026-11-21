"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FLIP_EPS } from "./DiaryPages";

type Props = {
  width: number;
  height: number;
  thickness: number;
  hingeZ: number;
  open: boolean;
  cover: THREE.Texture;
  inside: THREE.Texture;
  cloth: THREE.Texture;
  sticker: THREE.Texture;
  shadows: boolean;
  reduced: boolean;
  onFaceClick: (e: ThreeEvent<MouseEvent>, face: "outside" | "inside") => void;
  onStickerPress: () => void;
};

/**
 * Hard front cover hinged at the spine. Box faces: +z is the printed cover,
 * -z is the endpaper (reads correctly once the cover swings over).
 */
export function DiaryCover({ width, height, thickness, hingeZ, open, cover, inside, cloth, sticker, shadows, reduced, onFaceClick, onStickerPress }: Props) {
  const pivot = useRef<THREE.Group>(null);
  const stickerRef = useRef<THREE.Group>(null);
  const progress = useRef(open ? 1 : 0);
  const spin = useRef(0);
  const [hover, setHover] = useState(false);
  useCursor(hover);

  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ map: cloth, roughness: 0.85 });
    return [
      side,
      side,
      side,
      side,
      new THREE.MeshStandardMaterial({ map: cover, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: inside, roughness: 0.95 }),
    ];
  }, [cover, inside, cloth]);

  useFrame((_, dt) => {
    const target = open ? 1 : 0;
    progress.current = reduced ? target : THREE.MathUtils.damp(progress.current, target, 3.6, Math.min(dt, 0.05));
    if (pivot.current) {
      // ease-in-out bias + tiny overshoot feel
      const p = progress.current;
      pivot.current.rotation.y = -p * (Math.PI + FLIP_EPS);
      // lift slightly while swinging so it never clips the pages
      pivot.current.position.z = hingeZ + Math.sin(p * Math.PI) * 0.03;
    }
    if (stickerRef.current && spin.current > 0) {
      spin.current = Math.max(0, spin.current - dt * 2.2);
      stickerRef.current.rotation.z = Math.sin(spin.current * 18) * spin.current * 0.6;
      stickerRef.current.scale.setScalar(1 + spin.current * 0.25);
    }
  });

  return (
    <group ref={pivot} position={[0, 0, hingeZ]}>
      <mesh
        position={[width / 2, 0, 0]}
        material={materials}
        castShadow={shadows}
        receiveShadow={shadows}
        onClick={(e) => {
          e.stopPropagation();
          // which side was hit? the face normal in local space tells us
          const n = e.face?.normal;
          onFaceClick(e, n && n.z < 0 ? "inside" : "outside");
        }}
      >
        <boxGeometry args={[width, height, thickness]} />
      </mesh>
      {/* "DO NOT PRESS" sticker — a tiny physical decal on the cover */}
      <group ref={stickerRef} position={[width * 0.8, -height * 0.3, thickness / 2 + 0.005]} rotation={[0, 0, 0.2]}>
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
          }}
          onPointerOut={() => setHover(false)}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            spin.current = 1;
            onStickerPress();
          }}
        >
          <cylinderGeometry args={[0.13, 0.13, 0.008, 40]} />
          <meshStandardMaterial attach="material-0" color="#ffffff" />
          <meshStandardMaterial attach="material-1" map={sticker} roughness={0.4} />
          <meshStandardMaterial attach="material-2" map={sticker} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
