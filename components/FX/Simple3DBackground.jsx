import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Float } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Simple floating spheres
function FloatingSpheres() {
  const spheres = [
    { position: [2, 1, -3], size: 0.3, color: '#ffffff' },
    { position: [-2, -1, -4], size: 0.2, color: '#ffffff' },
    { position: [1, -2, -2], size: 0.25, color: '#ffffff' },
    { position: [-1, 2, -5], size: 0.35, color: '#ffffff' },
  ]

  return (
    <>
      {spheres.map((sphere, index) => (
        <Float
          key={index}
          speed={1 + index * 0.3}
          rotationIntensity={0.2}
          floatIntensity={0.3}
        >
          <Sphere position={sphere.position} args={[sphere.size, 16, 16]}>
            <meshBasicMaterial
              color={sphere.color}
              transparent
              opacity={0.1}
              wireframe
            />
          </Sphere>
        </Float>
      ))}
    </>
  )
}

// Simple rotating cube
function RotatingCube() {
  const mesh = useRef()
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.005
      mesh.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={mesh} position={[0, 0, -3]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.05}
        wireframe
      />
    </mesh>
  )
}

// Main 3D background component
function Simple3DBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Very subtle lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.2} color="#ffffff" />
        
        {/* 3D Elements */}
        <RotatingCube />
        <FloatingSpheres />
        
        {/* Subtle camera movement */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

export default Simple3DBackground
