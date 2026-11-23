import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { drawEcgPaper } from './ecg.js'

const PW = 2.5, PH = 1.25 // paper size in world units (250 x 125 mm)
const ACCENT = '#2F5D8A'

// Test hook: ?freeze=1.3 holds the timeline at 1.3 s (used to screenshot each step)
const FREEZE = (() => {
  const v = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('freeze') : null
  return v === null ? null : Number(v)
})()

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
const seg = (t, a, b) => ease((t - a) / (b - a))

function usePaperTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 2048; c.height = 1024
    drawEcgPaper(c.getContext('2d'), c.width, c.height)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [])
}

function Sheet({ clock0, onFlash, onReady }) {
  const drew = useRef(false)
  const tex = usePaperTexture()
  const group = useRef()
  const sheet = useRef()
  const phone = useRef()
  const frame = useRef()
  const flashed = useRef(false)
  const { viewport } = useThree()

  const geo = useMemo(() => new THREE.PlaneGeometry(PW, PH, 64, 32), [])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])

  const frustum = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 3), 3))
    return g
  }, [])
  const frameGeo = useMemo(() => {
    const hw = PW / 2 + 0.03, hh = PH / 2 + 0.03
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-hw, -hh, 0.01), new THREE.Vector3(hw, -hh, 0.01), new THREE.Vector3(hw, hh, 0.01),
      new THREE.Vector3(-hw, hh, 0.01), new THREE.Vector3(-hw, -hh, 0.01),
    ])
  }, [])

  const curlTo = (c) => {
    const p = geo.attributes.position.array
    for (let i = 0; i < p.length; i += 3) {
      const xn = base[i] / (PW / 2), yn = base[i + 1] / (PH / 2)
      p[i + 2] = c * (0.2 * xn * xn + 0.06 * Math.sin(yn * 2.2) + 0.14 * Math.max(0, xn * yn) ** 2)
    }
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
  }

  useEffect(() => { curlTo(1) }, [])
  useEffect(() => () => { tex.dispose(); geo.dispose(); frustum.dispose(); frameGeo.dispose() }, [])

  const lens = new THREE.Vector3()
  const corner = new THREE.Vector3()

  useFrame((state) => {
    if (!drew.current) { drew.current = true; onReady?.() } // hide the 2D fallback only once 3D has drawn
    const t = FREEZE ?? state.clock.elapsedTime - clock0.current
    // timeline: phone in (0-1.6) -> flash (1.7) -> flatten + face camera (1.9-3.1) -> idle tilt
    const inP = seg(t, 0.1, 1.6)
    const out = seg(t, 1.95, 2.9)
    const flat = seg(t, 1.9, 3.1)

    curlTo(1 - flat)
    const { x, y } = state.pointer
    const idle = flat
    group.current.rotation.x = THREE.MathUtils.lerp(-0.55, 0, flat) + idle * -y * 0.12
    group.current.rotation.y = THREE.MathUtils.lerp(0.35, 0, flat) + idle * x * 0.18
    group.current.rotation.z = THREE.MathUtils.lerp(-0.08, 0, flat)

    // phone flies in from top-right, then leaves
    phone.current.position.set(
      THREE.MathUtils.lerp(2.6, 0.15, inP) + out * 2.4,
      THREE.MathUtils.lerp(1.6, 0.35, inP) + out * 1.2,
      THREE.MathUtils.lerp(3.0, 1.35, inP) + out * 0.6,
    )
    phone.current.rotation.set(-0.35 * (1 - inP) - 0.2, 0.3 * (1 - inP), 0)
    phone.current.children.forEach((m) => { m.material.opacity = Math.min(inP * 1.4, 1) * (1 - out) })

    // frustum lines from lens to the 4 paper corners (visible while aiming)
    const fp = frustum.attributes.position.array
    phone.current.localToWorld(lens.set(0, 0.25, -0.03))
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
    corners.forEach(([cx, cy], i) => {
      sheet.current.localToWorld(corner.set((cx * PW) / 2, (cy * PH) / 2, 0))
      fp.set([lens.x, lens.y, lens.z, corner.x, corner.y, corner.z], i * 6)
    })
    frustum.attributes.position.needsUpdate = true
    frustumMat.opacity = 0.55 * seg(t, 0.9, 1.5) * (1 - seg(t, 1.75, 2.1))

    if (t > 1.7 && !flashed.current) { flashed.current = true; onFlash() }
    if (t < 0.1) flashed.current = false

    frame.current.material.opacity = seg(t, 2.9, 3.5)
    const s = Math.min(1.08, (viewport.width * 0.84) / PW)
    group.current.scale.setScalar(s)
  })

  const frustumMat = useMemo(() => new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0 }), [])

  return (
    <>
      <group ref={group}>
        <mesh ref={sheet} geometry={geo}>
          {/* unlit: printed paper keeps its exact colours (brief palette); curl reads from the silhouette */}
          <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <line ref={frame} geometry={frameGeo}>
          <lineBasicMaterial color={ACCENT} transparent opacity={0} />
        </line>
      </group>
      <lineSegments geometry={frustum} material={frustumMat} />
      <group ref={phone}>
        <mesh>
          <boxGeometry args={[0.34, 0.68, 0.035]} />
          <meshStandardMaterial color="#20252B" roughness={0.4} transparent opacity={0} />
        </mesh>
        <mesh position={[0, 0.25, -0.02]}>
          <circleGeometry args={[0.035, 24]} />
          <meshBasicMaterial color="#5E6B78" transparent opacity={0} />
        </mesh>
      </group>
    </>
  )
}

export default function PaperScene({ replayKey, onFlash, onReady }) {
  const wrap = useRef(null)
  const clock0 = useRef(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="paper3d">
      <Canvas
        dpr={[1, 2]}
        flat
        camera={{ position: [0, 0, 3.4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={visible ? 'always' : 'never'}
        onCreated={({ clock }) => { clock0.current = clock.elapsedTime }}
      >
        {/* lights sum to ~1.0 on a sheet facing the camera, so paper colours stay true */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 1.5, 5]} intensity={0.42} />
        <Replay replayKey={replayKey} clock0={clock0} />
        <Sheet clock0={clock0} onFlash={onFlash} onReady={onReady} />
      </Canvas>
    </div>
  )
}

function Replay({ replayKey, clock0 }) {
  const { clock } = useThree()
  useEffect(() => { clock0.current = clock.elapsedTime }, [replayKey])
  return null
}
