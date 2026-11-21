"use client";

/**
 * Reusable low-poly desk props, all procedural (no downloads):
 * mug, pencil, paperclip, polaroid, sticky note, headphones, notebook,
 * pen cup, plant, laptop. Shared by the home desk and the /about desk.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const INK = "#171717";

export function Mug({ color = "#477BFF", steam = true, reduced = false }: { color?: string; steam?: boolean; reduced?: boolean }) {
  const profile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0, 0));
    pts.push(new THREE.Vector2(0.2, 0));
    pts.push(new THREE.Vector2(0.215, 0.02));
    pts.push(new THREE.Vector2(0.225, 0.42));
    pts.push(new THREE.Vector2(0.2, 0.42));
    pts.push(new THREE.Vector2(0.19, 0.04));
    pts.push(new THREE.Vector2(0, 0.04));
    return pts;
  }, []);
  const steamRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    if (reduced) return;
    steamRefs.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.35 + i * 0.33) % 1;
      m.position.y = 0.45 + t * 0.5;
      m.position.x = Math.sin(t * 6 + i) * 0.04;
      (m.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.35;
      m.scale.setScalar(0.6 + t * 0.8);
    });
  });
  return (
    <group>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 36]} />
        <meshStandardMaterial color={color} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.192, 32]} />
        <meshStandardMaterial color="#3b2213" roughness={0.2} />
      </mesh>
      <mesh position={[0.24, 0.22, 0]} castShadow>
        <torusGeometry args={[0.09, 0.025, 12, 24, Math.PI * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.2, 0.223]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.16, 0.12]} />
        <meshStandardMaterial color="#FFD84D" roughness={0.6} />
      </mesh>
      {steam &&
        [0, 1, 2].map((i) => (
          <mesh key={i} ref={(m) => void (steamRefs.current[i] = m)} position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
    </group>
  );
}

export function Pencil({ color = "#FFD84D", length = 1.1 }: { color?: string; length?: number }) {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.035, length, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
      </mesh>
      <mesh position={[0, length / 2 + 0.06, 0]} castShadow>
        <coneGeometry args={[0.035, 0.12, 6]} />
        <meshStandardMaterial color="#e8c9a0" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, length / 2 + 0.105, 0]}>
        <coneGeometry args={[0.011, 0.035, 6]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <mesh position={[0, -length / 2 - 0.03, 0]}>
        <cylinderGeometry args={[0.037, 0.037, 0.06, 12]} />
        <meshStandardMaterial color="#b8b8b8" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -length / 2 - 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.034, 0.034, 0.07, 12]} />
        <meshStandardMaterial color="#FF755E" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function PaperClip3D({ color = "#8f949b" }: { color?: string }) {
  const geo = useMemo(() => {
    const pts = [
      [0.06, -0.18], [0.06, 0.14], [0.0, 0.2], [-0.06, 0.14], [-0.06, -0.22], [0.0, -0.27], [0.1, -0.22], [0.1, 0.18],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0));
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 80, 0.008, 6, false);
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} castShadow>
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.25} />
    </mesh>
  );
}

export function Polaroid3D({ map, size = 0.7 }: { map: THREE.Texture; size?: number }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, 0.004]}>
        <boxGeometry args={[size, size * 1.19, 0.008]} />
        <meshStandardMaterial attach="material-0" color="#f2f2f2" />
        <meshStandardMaterial attach="material-1" color="#f2f2f2" />
        <meshStandardMaterial attach="material-2" color="#f2f2f2" />
        <meshStandardMaterial attach="material-3" color="#f2f2f2" />
        <meshStandardMaterial attach="material-4" map={map} roughness={0.6} />
        <meshStandardMaterial attach="material-5" color="#f2f2f2" />
      </mesh>
    </group>
  );
}

export function StickyNote3D({ map, size = 0.5 }: { map: THREE.Texture; size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  );
}

export function Headphones({ color = "#FF755E" }: { color?: string }) {
  return (
    <group>
      <mesh castShadow rotation={[0, 0, 0]}>
        <torusGeometry args={[0.42, 0.035, 12, 40, Math.PI]} />
        <meshStandardMaterial color={INK} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0.42 * s, -0.05, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 28]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[-0.07 * s, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.04, 28]} />
            <meshStandardMaterial color={INK} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Notebook({ cover, label, color = "#FFD84D" }: { cover?: THREE.Texture; label?: THREE.Texture; color?: string }) {
  const w = 1.0;
  const h = 1.35;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[w, 0.1, h]} />
        <meshStandardMaterial attach="material-0" color="#f4ead6" />
        <meshStandardMaterial attach="material-1" color="#f4ead6" />
        <meshStandardMaterial attach="material-2" color={color} map={cover} />
        <meshStandardMaterial attach="material-3" color={color} />
        <meshStandardMaterial attach="material-4" color="#f4ead6" />
        <meshStandardMaterial attach="material-5" color="#f4ead6" />
      </mesh>
      {label && (
        <mesh position={[0, 0.102, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.15]} />
          <meshStandardMaterial map={label} />
        </mesh>
      )}
      <mesh position={[w * 0.36, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.106, h + 0.004]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      {/* spiral */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-w / 2, 0.05, -h / 2 + 0.12 + i * 0.123]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.06, 0.008, 6, 16]} />
          <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function PenCup() {
  const pens: { c: string; r: [number, number, number]; h: number }[] = [
    { c: "#477BFF", r: [0.12, 0, 0.1], h: 0.95 },
    { c: "#FF755E", r: [-0.1, 0, -0.08], h: 0.9 },
    { c: "#171717", r: [0.05, 0, -0.15], h: 1.0 },
    { c: "#9DDC8B", r: [-0.14, 0, 0.12], h: 0.85 },
  ];
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.18, 0.6, 24, 1, true]} />
        <meshStandardMaterial color="#FFD84D" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 24]} />
        <meshStandardMaterial color="#c9a43b" />
      </mesh>
      {pens.map((p, i) => (
        <group key={i} position={[p.r[0] * 0.5, 0.05, p.r[2] * 0.5]} rotation={[p.r[2], 0, -p.r[0]]}>
          <mesh castShadow position={[0, p.h / 2, 0]}>
            <cylinderGeometry args={[0.025, 0.025, p.h, 8]} />
            <meshStandardMaterial color={p.c} roughness={0.4} />
          </mesh>
          <mesh position={[0, p.h + 0.03, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.07, 8]} />
            <meshStandardMaterial color={INK} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Plant() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.34, 20]} />
        <meshStandardMaterial color="#FF755E" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.335, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.19, 20]} />
        <meshStandardMaterial color="#4b3020" />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 6, 12]} />
        <meshStandardMaterial color="#4e9a5c" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.13, 0.62, 0]} rotation={[0, 0, -0.9]}>
        <capsuleGeometry args={[0.055, 0.16, 6, 10]} />
        <meshStandardMaterial color="#4e9a5c" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.12, 0.72, 0]} rotation={[0, 0, 0.9]}>
        <capsuleGeometry args={[0.05, 0.12, 6, 10]} />
        <meshStandardMaterial color="#4e9a5c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#FFD84D" />
      </mesh>
    </group>
  );
}

export function Laptop({ screen, open = 1.9 }: { screen?: THREE.Texture; open?: number }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <boxGeometry args={[1.6, 0.06, 1.05]} />
        <meshStandardMaterial color="#d7d9dc" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.062, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 0.55]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <group position={[0, 0.06, -0.52]} rotation={[-(open - Math.PI / 2), 0, 0]}>
        <mesh castShadow position={[0, 0.52, 0]}>
          <boxGeometry args={[1.6, 1.04, 0.04]} />
          <meshStandardMaterial color="#d7d9dc" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.52, 0.021]}>
          <planeGeometry args={[1.48, 0.92]} />
          {screen ? <meshBasicMaterial map={screen} toneMapped={false} /> : <meshBasicMaterial color={INK} />}
        </mesh>
      </group>
    </group>
  );
}

/** Roll of washi tape lying flat, with a short strip pulled out across the desk. */
export function WashiRoll({ color, strip = 0, stripMap }: { color: string; strip?: number; stripMap?: THREE.Texture }) {
  const rO = 0.2;
  const rI = 0.135;
  const h = 0.11;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[rO, rO, h, 40, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, h + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rI, rO, 40]} />
        <meshStandardMaterial color={stripMap ? "#ffffff" : color} roughness={0.7} map={stripMap ?? null} />
      </mesh>
      {/* cardboard core */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[rI, rI, h + 0.004, 40, 1, true]} />
        <meshStandardMaterial color="#C8A374" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, h + 0.0025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rI - 0.012, rI, 40]} />
        <meshStandardMaterial color="#a9875d" roughness={0.9} />
      </mesh>
      {strip > 0 && (
        <mesh position={[strip / 2, 0.002, rO - 0.004]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[strip, h * 0.95]} />
          <meshStandardMaterial color={stripMap ? "#ffffff" : color} roughness={0.6} transparent opacity={0.92} map={stripMap ?? null} />
        </mesh>
      )}
    </group>
  );
}

/** Flat vinyl sticker stuck to the desk. */
export function Decal({ map, size = 0.3 }: { map: THREE.Texture; size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={map} transparent alphaTest={0.3} roughness={0.35} />
    </mesh>
  );
}
