"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { OrbitControls } from "@react-three/drei";

function ParallaxRig() {
  useFrame(({ pointer, camera }) => {
    const tx = pointer.x * 0.6;
    const ty = pointer.y * 0.4;
    camera.position.x += (tx - camera.position.x) * 0.04;
    camera.position.y += (-ty + 1.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Ribbon() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 200; i++) {
      const t = i / 20;
      pts.push([
        Math.sin(t * 0.8) * 1.6,
        Math.cos(t * 0.7) * 1.1,
        -i * 0.05,
      ]);
    }
    return pts;
  }, []);
  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <icosahedronGeometry args={[0.06 + (i % 10) * 0.002, 0]} />
          <meshStandardMaterial
            color={i % 2 ? "#C88C3A" : "#A5A39B"}
            roughness={0.65}
            metalness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloorGrid() {
  return <gridHelper args={[60, 40, "#3a3a3a", "#242424"]} position={[0, -2.1, 0]} />;
}

export default function ParallaxScene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0.8, 1.6, 6.2], fov: 52 }}>
        <color attach="background" args={["#0C0D10"]} />
        <hemisphereLight intensity={0.7} groundColor={"#0C0D10"} />
        <directionalLight position={[3, 4, 2]} intensity={0.8} />
        <directionalLight position={[-4, 1.5, -2]} intensity={0.35} />
        <FloorGrid />
        <Ribbon />
        <ParallaxRig />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,.15) 0%, rgba(0,0,0,.55) 65%, rgba(0,0,0,.9) 100%)",
        }}
      />
    </div>
  );
}
