import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeShapes } from './shapes.js'

// One fixed, full-screen particle field behind the home page. Scrolling morphs it through five shapes that match
// the sections (ECG -> heart -> DNA -> planet -> stars); points shy away from the cursor. All morphing runs on the GPU.

// [sectionSelector, stage]: when that element reaches mid-screen the field is in that stage
const ANCHORS = [
  ['#main', 0],
  ['.project:nth-child(1)', 1],
  ['.project:nth-child(3)', 2],
  ['#credentials', 3],
  ['#contact', 4],
]
// where each shape sits (desktop): x offset, y offset, scale
const PLACE = [
  [2.2, 0.1, 1.0],
  [2.9, 0.1, 0.9],
  [3.4, 0, 0.9],
  [3.1, 0.2, 0.95],
  [0, 0, 1.0],
]
const COLORS = ['#5BD6EE', '#FF6B81', '#62E3B4', '#7FA8FF', '#DDE7FF']

const vert = /* glsl */ `
  attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
  attribute float aRand; attribute float aLead;
  uniform float uStage; uniform float uTime; uniform float uPixel; uniform float uSize;
  uniform vec3 uMouse; uniform vec3 uCols[5];
  varying vec3 vColor; varying float vAlpha;

  vec3 shape(int i) {
    if (i == 0) return p0; if (i == 1) return p1; if (i == 2) return p2; if (i == 3) return p3; return p4;
  }
  void main() {
    float s = clamp(uStage, 0.0, 4.0);
    int i0 = int(floor(s)); int i1 = min(i0 + 1, 4);
    float f = fract(s);
    // staggered per point, so shapes dissolve and re-form instead of sliding as one block
    float fp = smoothstep(0.0, 1.0, clamp(f * 1.5 - aRand * 0.5, 0.0, 1.0));
    if (i0 == 4) fp = 0.0;
    vec3 a = shape(i0); vec3 b = shape(i1);
    vec3 pos = mix(a, b, fp);
    float mid = fp * (1.0 - fp);
    pos += vec3(sin(aRand * 40.0 + uTime), cos(aRand * 31.0 + uTime * 0.8), sin(aRand * 17.0)) * mid * 2.2;
    pos += vec3(sin(uTime * 0.6 + aRand * 6.28), cos(uTime * 0.5 + aRand * 6.28), 0.0) * 0.025;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    float dist = length(d);
    world.xy += normalize(d + 1e-4) * smoothstep(1.6, 0.0, dist) * 0.55;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixel * (0.55 + aRand * 0.9) * (1.0 + 0.7 * (1.0 - clamp(s, 0.0, 1.0))) / -mv.z;

    // ECG pulse travelling along each lead (only while the traces are visible)
    float head = fract(uTime * 0.12 + aLead * 0.37);
    float u = (p0.x + 7.0) / 14.0;
    float dd = head - u; if (dd < 0.0) dd += 1.0;
    float pulse = pow(max(0.0, 1.0 - dd / 0.55), 2.0);
    float traceW = 1.0 - clamp(s, 0.0, 1.0);
    vAlpha = mix(1.0, 0.5 + 1.3 * pulse, traceW);
    vColor = mix(uCols[i0], uCols[i1], fp);
  }
`
const frag = /* glsl */ `
  uniform float uFade;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * vAlpha * uFade;
    gl_FragColor = vec4(vColor * a, a);
  }
`

function Field({ count, mobile, animate }) {
  const group = useRef()
  const mat = useRef()
  const { camera, size } = useThree()
  const stage = useRef(0)
  const anchors = useRef([])
  const mouse = useRef(new THREE.Vector3(99, 99, 0))

  const geo = useMemo(() => {
    const { P, rand, lead } = makeShapes(count)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(P[0].slice(), 3))
    P.forEach((arr, i) => g.setAttribute(`p${i}`, new THREE.BufferAttribute(arr, 3)))
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
    g.setAttribute('aLead', new THREE.BufferAttribute(lead, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30) // shapes move on the GPU
    return g
  }, [count])

  const uniforms = useMemo(() => ({
    uStage: { value: 0 }, uTime: { value: 0 }, uPixel: { value: 1 }, uSize: { value: mobile ? 40 : 46 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uFade: { value: mobile ? 0.55 : 0.85 },
    uCols: { value: COLORS.map((c) => new THREE.Color(c)) },
  }), [mobile])

  // measure where each anchor section sits on the page
  useEffect(() => {
    const measure = () => {
      anchors.current = ANCHORS.map(([sel, st]) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const top = el.getBoundingClientRect().top + window.scrollY
        return [Math.max(0, top - window.innerHeight * 0.55), st]
      }).filter(Boolean)
      anchors.current[0][0] = 0
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    const onMove = (e) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1
      const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize()
      const t = -camera.position.z / v.z
      mouse.current.copy(camera.position).add(v.multiplyScalar(t))
    }
    if (!mobile) window.addEventListener('pointermove', onMove, { passive: true })
    return () => { ro.disconnect(); window.removeEventListener('pointermove', onMove) }
  }, [camera, mobile])

  useEffect(() => () => geo.dispose(), [geo])

  const targetStage = () => {
    const y = window.scrollY, A = anchors.current
    if (!A.length || y <= A[0][0]) return 0
    for (let i = 0; i < A.length - 1; i++) {
      const [y0, s0] = A[i], [y1, s1] = A[i + 1]
      if (y < y1) return s0 + ((y - y0) / Math.max(1, y1 - y0)) * (s1 - s0)
    }
    return A[A.length - 1][1]
  }

  useFrame((state, dt) => {
    const u = mat.current.uniforms
    const tgt = targetStage()
    stage.current += (tgt - stage.current) * Math.min(1, dt * (animate ? 4 : 60))
    u.uStage.value = stage.current
    if (animate) u.uTime.value = state.clock.elapsedTime
    u.uPixel.value = state.gl.getPixelRatio() * (size.height / 900)
    u.uMouse.value.lerp(mouse.current, 0.15)

    // place the shape: right of the text on desktop, centred and dimmer on phones
    const s = stage.current, i0 = Math.min(3, Math.floor(s)), f = s - i0
    const a = PLACE[i0], b = PLACE[Math.min(4, i0 + 1)]
    const x = mobile ? 0 : a[0] + (b[0] - a[0]) * f
    const y = mobile ? (s < 0.5 ? 0.8 : 0.5) : a[1] + (b[1] - a[1]) * f
    const sc = (a[2] + (b[2] - a[2]) * f) * (mobile ? 0.62 : 1)
    group.current.position.set(x, y, 0)
    group.current.scale.setScalar(sc)
    const spin = animate ? state.clock.elapsedTime : 0
    const traceTilt = Math.max(0, 1 - s)
    group.current.rotation.set(-0.38 * traceTilt, -0.42 * traceTilt + (1 - traceTilt) * spin * 0.18, -0.04 * traceTilt)
  })

  return (
    <group ref={group}>
      <points geometry={geo}>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}

export default function MorphField() {
  const [visible, setVisible] = useState(true)
  const [cfg] = useState(() => {
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return { mobile, reduced, count: mobile ? 4200 : 9000 }
  })
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <div className="field" aria-hidden="true">
      <Canvas
        dpr={[1, cfg.mobile ? 1.5 : 2]}
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'never'}
      >
        <Field count={cfg.count} mobile={cfg.mobile} animate={!cfg.reduced} />
      </Canvas>
    </div>
  )
}
