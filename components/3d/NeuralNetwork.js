'use client'
// components/3d/NeuralNetwork.js
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleField({ count = 100 }) {
  const pointsRef = useRef()
  const lineRef = useRef()

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = []
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      velocities.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.006,
        z: (Math.random() - 0.5) * 0.003,
      })
    }
    return { positions, velocities }
  }, [count])

  // Line geometry for connections
  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), [])
  const maxLines = count * 8
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines])

  useFrame(() => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i].x
      pos[i * 3 + 1] += velocities[i].y
      pos[i * 3 + 2] += velocities[i].z
      if (Math.abs(pos[i * 3])     > 11) velocities[i].x *= -1
      if (Math.abs(pos[i * 3 + 1]) > 11) velocities[i].y *= -1
      if (Math.abs(pos[i * 3 + 2]) > 4)  velocities[i].z *= -1
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Draw connections
    let lineCount = 0
    const threshold = 4.2
    for (let i = 0; i < count && lineCount < maxLines; i++) {
      for (let j = i + 1; j < count && lineCount < maxLines; j++) {
        const dx = pos[i * 3] - pos[j * 3]
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < threshold) {
          linePositions[lineCount * 6]     = pos[i * 3]
          linePositions[lineCount * 6 + 1] = pos[i * 3 + 1]
          linePositions[lineCount * 6 + 2] = pos[i * 3 + 2]
          linePositions[lineCount * 6 + 3] = pos[j * 3]
          linePositions[lineCount * 6 + 4] = pos[j * 3 + 1]
          linePositions[lineCount * 6 + 5] = pos[j * 3 + 2]
          lineCount++
        }
      }
    }

    // Zero out unused
    for (let i = lineCount; i < maxLines; i++) {
      linePositions[i * 6] = linePositions[i * 6 + 1] = linePositions[i * 6 + 2] = 0
      linePositions[i * 6 + 3] = linePositions[i * 6 + 4] = linePositions[i * 6 + 5] = 0
    }

    if (lineRef.current) {
      lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(linePositions.slice(0, lineCount * 6), 3))
      lineRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#818cf8"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Connection lines */}
      <lineSegments ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#6366f1" transparent opacity={0.15} />
      </lineSegments>

      {/* Bright accent particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions.slice(0, 15 * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.14} color="#22d3ee" transparent opacity={0.8} sizeAttenuation />
      </points>
    </>
  )
}

function GlowOrb({ position, color, size = 1 }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.3
      meshRef.current.material.opacity = 0.06 + Math.sin(clock.elapsedTime * 0.8) * 0.03
    }
  })
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.06} />
    </mesh>
  )
}

export default function NeuralNetwork({ height = '100vh', particleCount = 100 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, height, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ParticleField count={particleCount} />
        <GlowOrb position={[-4, 2, -2]} color="#6366f1" size={3} />
        <GlowOrb position={[4, -2, -3]} color="#22d3ee" size={2.5} />
        <GlowOrb position={[0, 0, -4]} color="#3b82f6" size={4} />
      </Canvas>
    </div>
  )
}
