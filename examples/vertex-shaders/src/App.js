import * as THREE from 'three'
import React, { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Text, Loader } from '@react-three/drei'
import { LayerMaterial, Base, Depth, Fresnel, Noise } from 'lamina'
import { useControls } from 'leva'
import { Vector3 } from 'three'
import Frame from './Frame'

export default function App() {
  const { Controls } = useControls({
    Controls: {
      options: ['Orbit', 'Rig'],
      value: 'Rig'
    }
  })

  return (
    <>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 5, 15], fov: 22, near: 0.001 }}>
        <Suspense fallback={null}>
          <Bg />
          <Blob />
          <Orbs />

          <group scale={0.19} rotation={[-Math.PI / 16, -Math.PI / 8, 0]}>
            <Frame />
            <Text position={[0, -7, 0.4]} fontSize={2}>
              <meshStandardMaterial color={'#0F1C4D'} />
              lamina
            </Text>
          </group>

          {Controls === 'Rig' ? <Rig /> : <OrbitControls />}

          <ContactShadows opacity={1.5} position={[0, -1.85, 0]} scale={10} far={2} blur={3} />
          <pointLight position={[10, 10, 5]} />
          <pointLight position={[-10, -10, -5]} color={'purple'} />
          <ambientLight intensity={0.4} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  )
}

function Blob() {
  const noise = useRef()
  const noise2 = useRef()
  const glow = useRef()
  useFrame((state, dt) => {
    if (noise.current) {
      noise.current.offset = new Vector3(
        state.clock.elapsedTime * 0.2, //
        state.clock.elapsedTime * 0.2,
        state.clock.elapsedTime * 0.2
      )
      noise2.current.offset = new Vector3(
        state.clock.elapsedTime * 0.05, //
        state.clock.elapsedTime * 0.05,
        state.clock.elapsedTime * 0.05
      )

      glow.current.lookAt(state.camera.position)
    }
  })

  return (
    <>
      <mesh>
        <sphereGeometry args={[0.8, 128, 128]} />
        <LayerMaterial>
          <Base color="#603295" />
          <Depth colorA="white" colorB="#0F1C4D" alpha={0.5} mode="normal" near={0} far={2} origin={[-0.5, 1, 0.5]} />
          <Depth colorA="#0F1C4D" colorB="red" alpha={0.1} mode="normal" near={1} far={2} origin={[1, 0, -1]} />

          {/* Expensive ass layers */}
          <Noise mapping="local" type="curl" scale={2} colorA="white" colorB="black" mode="softlight" />
          <Noise ref={noise2} mapping="local" type="curl" scale={10} colorA="white" colorB="#0F1C4D" mode="softlight" />
          {/* *********** */}

          <Fresnel mode="softlight" color="#a55bff" intensity={1} power={3} bias={0} />
          <Noise scale={1.22} strength={1} mapping="local" mode="softlight" />
          <Noise mapping="local" type="cell" scale={10} colorA="white" colorB="#0F1C4D" mode="softlight" />

          {/* Vertex Shaders  */}
          <Noise ref={noise} vertex scale={1.25} strength={0.5} mapping="local" />
        </LayerMaterial>
      </mesh>
      <mesh ref={glow} scale={0.6}>
        <circleGeometry args={[2, 16]} />
        <LayerMaterial transparent depthWrite={false} side={THREE.FrontSide} blending={THREE.AdditiveBlending}>
          <Depth colorA="orange" colorB="black" alpha={1} mode="normal" near={-2} far={1.22} origin={[0, 0, 0]} />
          <Noise mapping="local" type="simplex" scale={200} colorA="#fff" colorB="black" mode="multiply" />
        </LayerMaterial>
      </mesh>
    </>
  )
}

function Bg() {
  const mesh = useRef()
  useFrame((_, delta) => {
    mesh.current.rotation.x = mesh.current.rotation.y = mesh.current.rotation.z += delta * 0.5
  })
  return (
    <mesh ref={mesh} scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <LayerMaterial attach="material" side={THREE.BackSide}>
        <Depth colorA={'#603295'} colorB={'#241140'} alpha={1} mode="normal" near={0} far={200} origin={[-100, 100, 100]} />
      </LayerMaterial>
    </mesh>
  )
}

function Orbs() {
  const refs = useRef([])
  const randData = useMemo(
    () =>
      new Array(15).fill(0).map(() => ({
        position: [
          THREE.MathUtils.randFloat(-2, 2), //
          THREE.MathUtils.randFloat(-2, 2),
          THREE.MathUtils.randFloat(-2, 2)
        ],
        scale: THREE.MathUtils.randFloat(0.3, 1)
      })),
    []
  )

  useFrame((state, dt) => {
    refs.current.forEach((ref, i) => {
      ref.position.x += Math.sin(state.clock.elapsedTime * randData[i % randData.length].scale) * 0.001
      ref.position.y += Math.cos(state.clock.elapsedTime * randData[i % randData.length].scale) * 0.001
    })
  })

  return (
    <>
      {randData.map((d, i) => (
        <mesh ref={(r) => r && refs.current.push(r)} {...d} key={i}>
          <sphereGeometry args={[0.2, 64, 64]} />
          <meshPhysicalMaterial
            transmission={1} //
            thickness={3}
            roughness={0.55}
            clearcoat={1}
            clearcoatRoughness={0.2}
          />
        </mesh>
      ))}
    </>
  )
}

function Rig({ v = new THREE.Vector3() }) {
  return useFrame((state) => {
    state.camera.position.lerp(v.set(state.mouse.x * 8, state.mouse.y * 4 + 3, 10), 0.05)
    state.camera.lookAt(0, 0, 0)
  })
}
