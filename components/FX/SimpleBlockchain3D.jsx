"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Float, Stars } from "@react-three/drei";

// Simple rotating sphere
function RotatingSphere() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <Sphere ref={meshRef} position={[0, 0, 0]} args={[1, 32, 32]}>
        <meshStandardMaterial 
          color="#00f5ff" 
          emissive="#00f5ff" 
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
}

// Simple floating blocks
function FloatingBlocks() {
  const positions = [
    [2, 1, -1],
    [-2, -1, 1],
    [3, -1, -2],
    [-3, 1, 2]
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={1 + i * 0.5} rotationIntensity={0.5} floatIntensity={0.3}>
          <Box position={pos} args={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial 
              color="#ff0080" 
              emissive="#ff0080" 
              emissiveIntensity={0.2}
            />
          </Box>
        </Float>
      ))}
    </>
  );
}

// Simple 3D Scene
export default function SimpleBlockchain3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 -z-10 bg-black" />;
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <color attach="background" args={["#000000"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0080" />
        
        {/* Background stars */}
        <Stars 
          radius={100} 
          depth={50} 
          count={500} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        
        {/* Main elements */}
        <RotatingSphere />
        <FloatingBlocks />
        
        {/* Camera controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
    </div>
  );
}
