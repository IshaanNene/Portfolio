"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FLIP_EPS } from "./DiaryPages";
import { PaperClip3D } from "./props";

export type CoverLayers = { nameplate: THREE.Texture; photo: THREE.Texture; note: THREE.Texture };

type Props = {
  width: number;
  height: number;
  thickness: number;
  hingeZ: number;
  open: boolean;
  cover: THREE.Texture;
  inside: THREE.Texture;
  cloth: THREE.Texture;
  leatherMaps: { normal: THREE.Texture | null; rough: THREE.Texture | null };
  sticker: THREE.Texture;
  layers: CoverLayers;
  shadows: boolean;
  reduced: boolean;
  onFaceClick: (e: ThreeEvent<MouseEvent>, face: "outside" | "inside") => void;
  onStickerPress: () => void;
};

/**
 * Hard front cover hinged at the spine. Box faces: +z is the printed cover,
 * -z is the endpaper (reads correctly once the cover swings over).
 */
export function DiaryCover({ width, height, thickness, hingeZ, open, cover, inside, cloth, leatherMaps, sticker, layers, shadows, reduced, onFaceClick, onStickerPress }: Props) {
  const pivot = useRef<THREE.Group>(null);
  const stickerRef = useRef<THREE.Group>(null);
  const progress = useRef(open ? 1 : 0);
  const spin = useRef(0);
  const peek = useRef(0);
  const coverHover = useRef(false);
  const [hover, setHover] = useState(false);
  useCursor(hover);

  const materials = useMemo(() => {
    const grain = { normalMap: leatherMaps.normal, roughnessMap: leatherMaps.rough, normalScale: new THREE.Vector2(1.6, 1.6) };
    const side = new THREE.MeshStandardMaterial({ map: cloth, roughness: 0.9, ...grain });
    return [
      side,
      side,
      side,
      side,
      new THREE.MeshStandardMaterial({ map: cover, roughness: 0.95, ...grain }),
      new THREE.MeshStandardMaterial({ map: inside, roughness: 0.95 }),
    ];
  }, [cover, inside, cloth, leatherMaps]);

  useFrame((_, dt) => {
    const target = open ? 1 : 0;
    progress.current = reduced ? target : THREE.MathUtils.damp(progress.current, target, 3.6, Math.min(dt, 0.05));
    if (pivot.current) {
      // ease-in-out bias + tiny overshoot feel
      const p = progress.current;
      // hovering the closed diary lifts the cover a touch, like a thumb under the edge
      peek.current = reduced ? 0 : THREE.MathUtils.damp(peek.current, coverHover.current && !open ? 1 : 0, 7, Math.min(dt, 0.05));
      pivot.current.rotation.y = -p * (Math.PI + FLIP_EPS) - peek.current * 0.09;
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
        onPointerOver={() => (coverHover.current = true)}
        onPointerOut={() => (coverHover.current = false)}
        onClick={(e) => {
          e.stopPropagation();
          // which side was hit? the face normal in local space tells us
          const n = e.face?.normal;
          onFaceClick(e, n && n.z < 0 ? "inside" : "outside");
        }}
      >
        <boxGeometry args={[width, height, thickness]} />
      </mesh>
      {/* objects glued onto the cover — each a separate physical layer */}
      <group position={[0, 0, thickness / 2]}>
        <CoverPiece W={width} H={height} cx={500} cy={300} w={740} h={300} rot={0.025} lift={0.006} map={layers.nameplate} edge="#e8c13a" shadows={shadows} />
        <CoverPiece W={width} H={height} cx={722} cy={830} w={350} h={420} rot={-0.06} lift={0.01} map={layers.photo} edge="#f4f4f4" shadows={shadows} />
        <CoverPiece W={width} H={height} cx={339} cy={810} w={380} h={360} rot={0.05} lift={0.005} map={layers.note} edge="#e9dcc0" shadows={shadows} fold />
        {/* tape holding the photo and the note */}
        <Tape3D W={width} H={height} cx={735} cy={622} w={190} rot={0.12} z={0.017} />
        <Tape3D W={width} H={height} cx={330} cy={650} w={150} rot={-0.18} z={0.012} />
        {/* staples through the nameplate */}
        <Staple3D W={width} H={height} cx={175} cy={180} rot={0.5} z={0.012} />
        <Staple3D W={width} H={height} cx={835} cy={420} rot={-0.4} z={0.012} />
        {/* paperclip gripping the sticky note */}
        <group position={[px(width, 180), py(height, 625), 0.014]} rotation={[Math.PI / 2, 0, 0.12]} scale={0.62}>
          <PaperClip3D />
        </group>
      </group>

      {/* "DO NOT PRESS" sticker — a tiny physical decal on the cover */}
      <group ref={stickerRef} position={[width * 0.84, -height * 0.39, thickness / 2 + 0.005]} rotation={[0, 0, 0.2]}>
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


/* ── cover layer helpers: canvas coords (1000×1400 page space) → cover-local units ── */
const px = (W: number, x: number) => (x / 1000) * W;
const py = (H: number, y: number) => (0.5 - y / 1400) * H;

function CoverPiece({
  W,
  H,
  cx,
  cy,
  w,
  h,
  rot,
  lift,
  map,
  edge,
  shadows,
  fold = false,
}: {
  W: number;
  H: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
  lift: number;
  map: THREE.Texture;
  edge: string;
  shadows: boolean;
  fold?: boolean;
}) {
  const sw = (w / 1000) * W;
  const sh = (h / 1400) * H;
  const t = 0.004;
  const flap = Math.min(sw, sh) * 0.2;
  const g = useRef<THREE.Group>(null);
  const over = useRef(false);
  const k = useRef(0);
  useFrame((_, dt) => {
    if (!g.current) return;
    k.current = THREE.MathUtils.damp(k.current, over.current ? 1 : 0, 9, Math.min(dt, 0.05));
    // lift off the leather and twist slightly toward the reader
    g.current.position.z = k.current * 0.025;
    g.current.rotation.z = rot - k.current * rot * 0.6;
    g.current.rotation.x = k.current * 0.05;
  });
  return (
    <group
      ref={g}
      position={[px(W, cx), py(H, cy), 0]}
      rotation={[0, 0, rot]}
      onPointerOver={() => (over.current = true)}
      onPointerOut={() => (over.current = false)}
    >
      {/* hard neo-brutalist offset shadow on the leather */}
      <mesh position={[0.02, -0.024, 0.0015]}>
        <planeGeometry args={[sw, sh]} />
        <meshBasicMaterial color="#171717" transparent opacity={0.8} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, lift]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[sw, sh, t]} />
        <meshStandardMaterial attach="material-0" color={edge} />
        <meshStandardMaterial attach="material-1" color={edge} />
        <meshStandardMaterial attach="material-2" color={edge} />
        <meshStandardMaterial attach="material-3" color={edge} />
        <meshStandardMaterial attach="material-4" map={map} roughness={0.75} />
        <meshStandardMaterial attach="material-5" color={edge} />
      </mesh>
      {fold && (
        /* bent-up bottom-right corner */
        <group position={[sw / 2 - flap / 2, -sh / 2 + flap / 2, lift + t / 2]} rotation={[0, 0, Math.PI / 4]}>
          <mesh rotation={[-0.75, 0, 0]} position={[0, 0, 0.001]}>
            <shapeGeometry args={[foldShape(flap)]} />
            <meshStandardMaterial color="#e3d6b8" side={THREE.DoubleSide} roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function foldShape(f: number) {
  const d = (f * Math.SQRT2) / 2;
  const s = new THREE.Shape();
  s.moveTo(-d, 0);
  s.lineTo(d, 0);
  s.lineTo(0, -d);
  s.closePath();
  return s;
}

function Tape3D({ W, H, cx, cy, w, rot, z }: { W: number; H: number; cx: number; cy: number; w: number; rot: number; z: number }) {
  return (
    <mesh position={[px(W, cx), py(H, cy), z]} rotation={[0, 0, rot]}>
      <planeGeometry args={[(w / 1000) * W, (46 / 1400) * H]} />
      <meshStandardMaterial color="#fff2b3" transparent opacity={0.75} roughness={0.5} depthWrite={false} />
    </mesh>
  );
}

function Staple3D({ W, H, cx, cy, rot, z }: { W: number; H: number; cx: number; cy: number; rot: number; z: number }) {
  return (
    <mesh position={[px(W, cx), py(H, cy), z]} rotation={[0, 0, rot]}>
      <boxGeometry args={[0.07, 0.009, 0.004]} />
      <meshStandardMaterial color="#b9bec6" metalness={0.85} roughness={0.25} />
    </mesh>
  );
}
