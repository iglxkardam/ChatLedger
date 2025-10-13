"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Torus, Float, Stars, Line, Text3D, Center } from "@react-three/drei";
import { useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

// Extended geometry for blockchain blocks
extend({ BoxGeometry: THREE.BoxGeometry });

// Blockchain Block Component
function BlockchainBlock({ position, rotation, delay = 0 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = rotation[0] + state.clock.elapsedTime * 0.1 + delay;
      meshRef.current.rotation.y = rotation[1] + state.clock.elapsedTime * 0.05 + delay;
      meshRef.current.rotation.z = rotation[2] + state.clock.elapsedTime * 0.02 + delay;
    }
  });

  return (
    <Float speed={1 + delay} rotationIntensity={0.5} floatIntensity={0.3}>
      <Box ref={meshRef} position={position} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial 
          color="#00f5ff" 
          emissive="#00f5ff" 
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
    </Float>
  );
}

// Connection Lines between blocks
function ConnectionLine({ start, end, delay = 0 }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
    }
  });

  return (
    <Line
      ref={ref}
      points={points}
      color="#ffffff"
      lineWidth={2}
      transparent
      opacity={0.3}
    />
  );
}

// Floating Crypto Particles
function CryptoParticles({ count = 50 }) {
  const mesh = useRef();
  const particles = useMemo(() => {
    const temp = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshBasicMaterial({ 
        color: '#A855F7',
        transparent: true,
        opacity: 0.6
      }),
      count
    );
    
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    temp.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return temp;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
      mesh.current.rotation.x += 0.0005;
    }
  });

  return <primitive ref={mesh} object={particles} />;
}

// DApp Icon in 3D
function DAppIcon3D({ position, color, size = 0.5, delay = 0, icon = "💬" }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + delay;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.3}>
      <group ref={meshRef} position={position}>
        <Torus args={[size, size * 0.3, 16, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </Torus>
        {/* Icon representation */}
        <Sphere args={[size * 0.6, 16, 16]} position={[0, 0, 0.1]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
        </Sphere>
      </group>
    </Float>
  );
}

// Main Blockchain Network
function BlockchainNetwork() {
  const groupRef = useRef();
  const { scrollYProgress } = useScroll();
  const rotation = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  // Blockchain blocks positions
  const blockPositions = [
    [0, 0, 0],
    [2, 1, -1],
    [-2, -1, 1],
    [3, -1, -2],
    [-3, 1, 2],
    [1, 2, 1],
    [-1, -2, -1]
  ];

  return (
    <group ref={groupRef}>
      {/* Central blockchain node */}
      <Sphere position={[0, 0, 0]} args={[1, 32, 32]}>
        <meshStandardMaterial 
          color="#00f5ff" 
          emissive="#00f5ff" 
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
      
      {/* Blockchain blocks */}
      {blockPositions.map((pos, i) => (
        <BlockchainBlock 
          key={i} 
          position={pos} 
          rotation={[0, i * 0.5, 0]}
          delay={i * 0.2}
        />
      ))}
      
      {/* Connection lines */}
      {blockPositions.slice(1).map((pos, i) => (
        <ConnectionLine 
          key={i} 
          start={[0, 0, 0]} 
          end={pos}
          delay={i * 0.3}
        />
      ))}
      
      {/* DApp Icons */}
      <DAppIcon3D position={[6, 3, -4]} color="#00f5ff" size={0.6} delay={0} icon="💬" />
      <DAppIcon3D position={[-5, 4, -3]} color="#ff0080" size={0.7} delay={1} icon="🎨" />
      <DAppIcon3D position={[4, -3, -5]} color="#8b5cf6" size={0.5} delay={2} icon="📁" />
    </group>
  );
}

// Animated Background Grid
function AnimatedGrid() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <gridHelper 
      ref={meshRef} 
      args={[100, 100, "#00f5ff", "#00f5ff"]} 
      position={[0, -10, 0]} 
      transparent
      opacity={0.1}
    />
  );
}

// Main 3D Scene Component
export default function BlockchainLanding3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
        <color attach="background" args={["#000000"]} />
        
        {/* Advanced Lighting Setup */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ff0080" />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#8b5cf6" />
        <directionalLight position={[0, 10, 0]} intensity={0.3} />
        
        {/* Background elements */}
        <Stars 
          radius={100} 
          depth={50} 
          count={1000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        <AnimatedGrid />
        
        {/* Main blockchain network */}
        <BlockchainNetwork />
        
        {/* Crypto particles */}
        <CryptoParticles count={100} />
        
        {/* Camera controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 2.2}
          maxDistance={20}
          minDistance={8}
        />
      </Canvas>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
    </div>
  );
}

