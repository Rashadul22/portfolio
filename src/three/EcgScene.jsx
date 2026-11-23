import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'

// 12 leads, like a paper ECG, drawn as glowing traces in a tilted plane.
const LEADS = 12
const POINTS = 520
const WIDTH = 14
const GAP = 0.62
const TRAIL = 0.55 // fraction of width that stays lit behind the pulse

const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s))
function beat(p, lead) {
  // P-QRS-T complex; each lead gets its own amplitude and polarity, as in a real 12-lead
  const pol = [1, 1, 0.6, -0.8, 0.7, 0.9, -0.4, 0.5, 1.1, 1.3, 1.2, 1][lead]
  return (
    0.12 * g(p, 0.2, 0.025) -
    0.1 * pol * g(p, 0.37, 0.008) +
    0.95 * pol * g(p, 0.4, 0.011) -
    0.28 * g(p, 0.435, 0.01) +
    0.26 * g(p, 0.66, 0.045)
  )
}

const CYAN = new THREE.Color('#5BD6EE')
const MINT = new THREE.Color('#62E3B4')

function Traces({ animate }) {
  const group = useRef()
  const { size } = useThree()

  const leads = useMemo(() => {
    return Array.from({ length: LEADS }, (_, i) => {
      const pos = new Float32Array(POINTS * 3)
      const beats = 3.2 + (i % 3) * 0.15
      for (let k = 0; k < POINTS; k++) {
        const u = k / (POINTS - 1)
        const p = (u * beats + i * 0.07) % 1
        pos[k * 3] = (u - 0.5) * WIDTH
        pos[k * 3 + 1] = beat(p, i) * 0.42 + (LEADS / 2 - i - 0.5) * GAP
        pos[k * 3 + 2] = 0
      }
      const geo = new LineGeometry()
      geo.setPositions(pos)
      const colors = new Float32Array(POINTS * 3)
      geo.setColors(colors)
      const mat = new LineMaterial({
        vertexColors: true,
        linewidth: 1.6,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const line = new Line2(geo, mat)
      return { line, geo, mat, colors, base: i % 4 === 2 ? MINT : CYAN, offset: (i * 0.137) % 1, speed: 0.11 + (i % 5) * 0.006 }
    })
  }, [])

  useEffect(() => {
    leads.forEach(({ mat }) => mat.resolution.set(size.width, size.height))
  }, [leads, size])

  useEffect(() => () => leads.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose() }), [leads])

  const paint = (t) => {
    for (const L of leads) {
      const head = animate ? (t * L.speed + L.offset) % 1 : 1
      const c = L.colors
      for (let k = 0; k < POINTS; k++) {
        const u = k / (POINTS - 1)
        let d = head - u
        if (d < 0) d += 1
        let a = animate ? Math.max(0, 1 - d / TRAIL) ** 2 : 0.55
        a = 0.06 + a * 0.94 // faint baseline always visible
        if (animate && d < 0.012) a = 1.6 // bright pulse head
        c[k * 3] = L.base.r * a
        c[k * 3 + 1] = L.base.g * a
        c[k * 3 + 2] = L.base.b * a
      }
      const attr = L.geo.attributes.instanceColorStart
      attr.data.array.set(packColors(c, attr.data.array))
      attr.data.needsUpdate = true
    }
  }

  useEffect(() => { paint(0) }, []) // first frame for static / reduced motion

  useFrame((state) => {
    if (!animate) return
    paint(state.clock.elapsedTime)
    const { x, y } = state.pointer
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -0.42 + x * 0.08, 0.04)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -0.38 - y * 0.05, 0.04)
  })

  return (
    <group ref={group} rotation={[-0.38, -0.42, -0.04]} position={[1.6, 0.1, 0]}>
      {leads.map(({ line }, i) => <primitive key={i} object={line} />)}
      <PaperGrid />
    </group>
  )
}

// LineGeometry stores colors as interleaved start/end pairs per segment.
let scratch
function packColors(c, out) {
  const n = c.length / 3 - 1
  if (!scratch || scratch.length !== out.length) scratch = new Float32Array(out.length)
  for (let i = 0; i < n; i++) {
    scratch.set(c.subarray(i * 3, i * 3 + 6), i * 6)
  }
  return scratch
}

function PaperGrid() {
  const geo = useMemo(() => {
    const pts = []
    const h = LEADS * GAP + 1
    for (let x = -WIDTH / 2; x <= WIDTH / 2 + 1e-6; x += 0.5) pts.push(x, -h / 2, -0.01, x, h / 2, -0.01)
    for (let y = -h / 2; y <= h / 2 + 1e-6; y += 0.5) pts.push(-WIDTH / 2, y, -0.01, WIDTH / 2, y, -0.01)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#5BD6EE" transparent opacity={0.05} depthWrite={false} />
    </lineSegments>
  )
}

function Stars({ animate }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const n = 700
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40
      p[i * 3 + 1] = (Math.random() - 0.5) * 24
      p[i * 3 + 2] = -6 - Math.random() * 14
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  useFrame((_, dt) => { if (animate) ref.current.rotation.z += dt * 0.006 })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.045} color="#BFD4FF" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  )
}

export default function EcgScene() {
  const wrap = useRef(null)
  const [visible, setVisible] = useState(true)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // stop rendering when the hero is off screen or the tab is hidden
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    io.observe(wrap.current)
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  const animate = !reduced
  return (
    <div ref={wrap} className="scene">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={animate && visible ? 'always' : 'demand'}
      >
        <Stars animate={animate} />
        <Traces animate={animate} />
      </Canvas>
    </div>
  )
}
