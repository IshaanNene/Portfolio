"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";

/**
 * Shared Canvas wrapper: sensible DPR caps, shadows on capable devices,
 * soft studio lighting with a warm key light (no HDR downloads).
 */
export function Scene({
  children,
  quality,
  camera = { position: [0, 4.2, 3.2], fov: 32 },
  className,
  onCreated,
}: {
  children: ReactNode;
  quality: "low" | "high";
  camera?: { position: [number, number, number]; fov: number };
  className?: string;
  onCreated?: () => void;
}) {
  const high = quality === "high";
  return (
    <Canvas
      className={className}
      shadows={high ? { type: THREE.PCFSoftShadowMap } : false}
      dpr={high ? [1, 1.8] : [1, 1.4]}
      gl={{ antialias: true, powerPreference: high ? "high-performance" : "low-power", alpha: true }}
      camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        onCreated?.();
      }}
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff6e5", "#c7a77a", 0.75]} />
      <directionalLight
        position={[-3.5, 6.5, 3]}
        intensity={2.1}
        color="#fff1dc"
        castShadow={high}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[4, 3, -2]} intensity={0.45} color="#c9d8ff" />
      {children}
    </Canvas>
  );
}

/**
 * Keeps a target rectangle (in world units) framed whatever the aspect
 * ratio, easing the camera toward it.
 */
export function CameraRig({
  target,
  width,
  depth,
  direction = [0, 0.82, 0.57],
  reduced,
  parallax = true,
}: {
  target: [number, number, number];
  width: number;
  depth: number;
  direction?: [number, number, number];
  reduced: boolean;
  parallax?: boolean;
}) {
  const { camera, size, pointer } = useThree();
  const look = useRef(new THREE.Vector3(...target));
  const dir = useRef(new THREE.Vector3(...direction).normalize());
  const tmp = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    const distW = width / 2 / (Math.tan(vfov / 2) * aspect);
    const distH = depth / 2 / Math.tan(vfov / 2);
    const dist = Math.max(distW, distH) * 1.08;
    const px = parallax && !reduced ? pointer.x * 0.25 : 0;
    const py = parallax && !reduced ? pointer.y * 0.15 : 0;
    tmp.current.set(target[0], target[1], target[2]);
    const k = reduced ? 1 : 1 - Math.exp(-3.2 * Math.min(dt, 0.05));
    look.current.lerp(tmp.current, k);
    const desired = tmp.current.copy(dir.current).multiplyScalar(dist).add(look.current);
    desired.x += px;
    desired.y += py;
    cam.position.lerp(desired, k);
    cam.lookAt(look.current);
  });
  return null;
}
