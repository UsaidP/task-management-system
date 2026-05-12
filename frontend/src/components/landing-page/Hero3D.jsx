import { Float, MeshDistortMaterial, OrbitControls, Sparkles, Stars } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

// Floating Task Card Component
function TaskCard({ position, color, delay = 0, distort = 0.3 }) {
  const meshRef = useRef()
  const reduced = useReducedMotion()

  useFrame((state) => {
    if (reduced) return
    const time = state.clock.elapsedTime + delay
    meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1
    meshRef.current.rotation.y = Math.cos(time * 0.15) * 0.15
  })

  return (
    <Float
      speed={reduced ? 0 : 1.5}
      rotationIntensity={reduced ? 0 : 0.2}
      floatIntensity={reduced ? 0 : 1}
      position={position}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.8, 2.4, 0.12]} />
        <MeshDistortMaterial
          color={color}
          distort={reduced ? 0 : distort}
          speed={2}
          roughness={0.6}
          metalness={0.2}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <lineSegments position={position}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.8, 2.4, 0.12)]} />
        <lineBasicMaterial color="#E8603A" transparent opacity={0.35} />
      </lineSegments>
    </Float>
  )
}

// Animated Particles System
function Particles({ count = 200 }) {
  const reduced = useReducedMotion()
  const meshRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (reduced) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.015
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#E8603A" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

// Mouse following camera
function CameraController() {
  const { camera, mouse } = useThree()
  const reduced = useReducedMotion()
  const vec = useRef(new THREE.Vector3())

  useFrame(() => {
    if (reduced) return
    vec.current.set(mouse.x * 0.3, mouse.y * 0.2, 0)
    camera.position.lerp(vec.current, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return null
}

// Scene content
function Scene() {
  const reduced = useReducedMotion()

  return (
    <>
      <ambientLight intensity={0.4} />

      <pointLight position={[2, 2, 2]} color="#E8603A" intensity={1.5} castShadow />

      <pointLight position={[-2, -2, 2]} color="#8BAF88" intensity={0.8} />

      <pointLight position={[0, 3, -2]} color="#6888A0" intensity={0.6} />

      <CameraController />

      {/* Floating Task Cards */}
      <TaskCard position={[-3.2, 1.5, -1]} color="#151522" delay={0} />
      <TaskCard position={[3, 0.5, -0.5]} color="#151522" delay={1.2} distort={0.25} />
      <TaskCard position={[-1.5, -1.8, 0]} color="#151522" delay={2.4} distort={0.35} />
      <TaskCard position={[1.5, 2, -1.5]} color="#151522" delay={0.6} />
      <TaskCard position={[0, -0.5, -2]} color="#151522" delay={1.8} distort={0.2} />
      <TaskCard position={[-0.5, 1.2, 0.5]} color="#151522" delay={3} />

      {/* Particles */}
      <Particles count={300} />

      {/* Sparkles effect */}
      {!reduced && (
        <Sparkles count={80} scale={12} size={2} speed={0.2} opacity={0.3} color="#E8603A" />
      )}

      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={1500}
        factor={4}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.5}
      />

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} makeDefault />
    </>
  )
}

// Main Hero3D Component
export const Hero3D = () => {
  const reduced = useReducedMotion()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (reduced || !loaded) {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#08080F]" aria-hidden="true" />
    )
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#08080F", 5, 20]} />
        <Scene />
      </Canvas>

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #08080F 75%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(232, 96, 58, 0.15) 0%, transparent 60%)",
        }}
      />
    </div>
  )
}

export default Hero3D
