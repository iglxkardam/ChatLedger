import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, TorusKnot, Float, Stars } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Floating particles component
function FloatingParticles({ count = 30 }) {
  const mesh = useRef()
  const particles = useMemo(() => {
    const temp = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshBasicMaterial({ 
        color: '#A855F7',
        transparent: true,
        opacity: 0.6
      }),
      count
    )
    
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    temp.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return temp
  }, [count])

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001
      mesh.current.rotation.x += 0.0005
    }
  })

  return <primitive ref={mesh} object={particles} />
}

// Wireframe torus knot - low poly
function WireframeKnot() {
  const mesh = useRef()
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.005
      mesh.current.rotation.y += 0.01
    }
  })

  return (
    <TorusKnot
      ref={mesh}
      args={[1, 0.3, 100, 16]}
      position={[0, 0, -5]}
    >
      <meshBasicMaterial
        color="#22D3EE"
        wireframe
        transparent
        opacity={0.3}
      />
    </TorusKnot>
  )
}

// Floating geometric shapes
function FloatingShapes() {
  const shapes = useMemo(() => [
    { position: [3, 2, -3], color: '#A855F7', size: 0.5 },
    { position: [-3, -2, -4], color: '#22D3EE', size: 0.3 },
    { position: [2, -3, -2], color: '#A855F7', size: 0.4 },
    { position: [-2, 3, -6], color: '#22D3EE', size: 0.6 },
  ], [])

  return (
    <>
      {shapes.map((shape, index) => (
        <Float
          key={index}
          speed={1 + index * 0.5}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <Sphere position={shape.position} args={[shape.size, 8, 8]}>
            <meshBasicMaterial
              color={shape.color}
              wireframe
              transparent
              opacity={0.2}
            />
          </Sphere>
        </Float>
      ))}
    </>
  )
}

// Main 3D scene component
function CryptoScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#A855F7" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#22D3EE" />
        
        {/* Background stars */}
        <Stars 
          radius={100} 
          depth={50} 
          count={200} 
          factor={4} 
          saturation={0} 
          fade 
          speed={0.5}
        />
        
        {/* 3D Elements */}
        <WireframeKnot />
        <FloatingShapes />
        <FloatingParticles count={30} />
        
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

export default CryptoScene