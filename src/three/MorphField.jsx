import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeShapes } from './shapes.js'

// "From a heartbeat to the stars": one fixed GPU particle field behind the home page. Scrolling flies the camera
// through five acts (ECG -> heart -> DNA -> planet -> stars). The ECG R-peak drives a shared heartbeat: the heart
// contracts and the glow pulses on every beat. Labelled hotspots link the 3D back to the content.

// Morphs happen inside the pinned chapter interludes ([data-chapter] 1..4): chapter k carries act k-1 -> act k.
// shape placement (desktop): x, y, scale
const PLACE = [[2.2, 0.1, 1.0], [3.0, 0.2, 0.72], [4.6, 0, 0.62], [3.0, 0.2, 0.85], [0, 0, 1.0]]
// camera distance per act; transitions add a forward "dive" through the morph
const CAM_Z = [9, 7.4, 7.0, 8.6, 9.5]
const COLORS = ['#5BD6EE', '#FF5C7A', '#62E3B4', '#7FA8FF', '#DDE7FF']
const BPM = 75
// test hook: ?snap jumps straight to the scroll target (used to screenshot each act)
const SNAP = typeof location !== 'undefined' && new URLSearchParams(location.search).has('snap')

// hotspots: shape-space anchor, act, label, link
export const HOTSPOTS = [
  { act: 0, p: [4.6, 2.6, 0], t: '12 leads · synthetic ECG', href: 'thesis/' },
  { act: 1, p: [1.6, 2.1, 0.6], t: 'Reading paper ECGs → thesis', href: 'thesis/' },
  // genes on the helix strand (NASA OSD-970 findings); they turn with the helix during the DNA flight
  ...[['Ucp1 · 12.21× up', 2.6], ['Angpt2', 1.2], ['Jun', 0], ['Irs2', -1.2], ['Klf2', -2.6]].map(([t, y]) => ({
    act: 2, p: [Math.cos(y * 1.15) * 1.2, y, Math.sin(y * 1.15) * 1.2], t, href: '#research', gene: true,
  })),
  { act: 3, p: [2.4, 1.6, 0], t: 'ISS · RR-1 · 37 days', href: '#research' },
]

// sharp systole envelope: 0..1, peaks right after each R-peak
const beatEnv = (t) => { const ph = (t * BPM / 60) % 1; return Math.exp(-ph * 9) }

const vert = /* glsl */ `
  attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
  attribute float aRand; attribute float aLead;
  uniform float uStage; uniform float uTime; uniform float uPixel; uniform float uSize; uniform float uBeat; uniform float uGlow; uniform float uReveal; uniform float uInk;
  uniform vec3 uMouse; uniform vec3 uCols[5];
  varying vec3 vColor; varying float vAlpha;

  vec3 shape(int i) {
    if (i == 0) return p0; if (i == 1) return p1; if (i == 2) return p2; if (i == 3) return p3; return p4;
  }
  void main() {
    float s = clamp(uStage, 0.0, 4.0);
    int i0 = int(floor(s)); int i1 = min(i0 + 1, 4);
    float f = fract(s);
    float fp = smoothstep(0.0, 1.0, clamp(f * 1.5 - aRand * 0.5, 0.0, 1.0));
    if (i0 == 4) fp = 0.0;
    vec3 a = shape(i0); vec3 b = shape(i1);

    // the heart contracts on every beat (systole), strongest while act 2 is on screen
    float heartW = 1.0 - min(abs(s - 1.0), 1.0);
    vec3 pos = mix(a, b, fp);
    pos *= 1.0 - 0.07 * uBeat * heartW;

    float mid = fp * (1.0 - fp);
    pos += vec3(sin(aRand * 40.0 + uTime), cos(aRand * 31.0 + uTime * 0.8), sin(aRand * 17.0)) * mid * 2.2;
    pos += vec3(sin(uTime * 0.6 + aRand * 6.28), cos(uTime * 0.5 + aRand * 6.28), 0.0) * 0.025;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    world.xy += normalize(d + 1e-4) * smoothstep(1.6, 0.0, length(d)) * 0.55;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    float traceW = 1.0 - clamp(s, 0.0, 1.0);
    gl_PointSize = uSize * uPixel * (0.55 + aRand * 0.9) * (1.0 + 0.7 * traceW) * (1.0 + uGlow * 1.2) / -mv.z;

    // ECG sweep: a bright head runs along each lead; the R-peak of the sweep is the heartbeat
    float head = fract(uTime * 0.12 + aLead * 0.37);
    float u = (p0.x + 7.0) / 14.0;
    float dd = head - u; if (dd < 0.0) dd += 1.0;
    float pulse = pow(max(0.0, 1.0 - dd / 0.55), 2.0);
    vAlpha = mix(1.0 + 0.6 * uBeat * heartW, 0.5 + 1.3 * pulse, traceW);
    vColor = mix(uCols[i0], uCols[i1], fp);

    // blueprint reveal (hero only): a pen draws each lead left to right in white-blue, then colour inks in
    float drawn = step(u, uReveal);
    float pen = exp(-abs(u - uReveal) * 60.0) * (1.0 - uInk);
    vAlpha *= mix(1.0, drawn * (0.55 + 0.45 * uInk) + pen * 2.5, traceW);
    vColor = mix(vColor, mix(vec3(0.78, 0.88, 1.0), vColor, uInk), traceW);
  }
`
// In-shader glow: a crisp core plus a soft gaussian halo. With additive blending this reads as bloom,
// without a post-processing pass (cheaper, and no colour-space round trip).
const frag = /* glsl */ `
  uniform float uFade; uniform float uGlow;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = smoothstep(0.42, 0.0, d);
    float halo = exp(-d * d * 5.0) * 0.32 * uGlow;
    float a = (core + halo) * vAlpha * uFade;
    gl_FragColor = vec4(vColor * a, a);
  }
`

function Field({ count, mobile, animate, bloom, hotspotEls }) {
  const group = useRef()
  const mat = useRef()
  const iss = useRef()
  const { camera, size, gl, scene } = useThree()
  const stage = useRef(0)
  const anchors = useRef([])
  const mouse = useRef(new THREE.Vector3(99, 99, 0))
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const tmp2 = useMemo(() => new THREE.Vector3(), [])
  // the hero ECG starts drawing once the first-visit intro has played
  const introDelay = useMemo(() => (document.documentElement.classList.contains('intro-seen') ? 0.3 : 1.7), [])

  const geo = useMemo(() => {
    const { P, rand, lead } = makeShapes(count)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(P[0].slice(), 3))
    P.forEach((arr, i) => g.setAttribute(`p${i}`, new THREE.BufferAttribute(arr, 3)))
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
    g.setAttribute('aLead', new THREE.BufferAttribute(lead, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30)
    return g
  }, [count])

  const uniforms = useMemo(() => ({
    uStage: { value: 0 }, uTime: { value: 0 }, uPixel: { value: 1 }, uSize: { value: mobile ? 40 : 46 }, uBeat: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uFade: { value: mobile ? 0.55 : 0.85 }, uGlow: { value: bloom ? 1 : 0.45 },
    uCols: { value: COLORS.map((c) => new THREE.Color(c)) }, uReveal: { value: 0 }, uInk: { value: 0 },
  }), [mobile, bloom])

  useEffect(() => {
    // each chapter: the morph runs while its pinned title is on screen
    const measure = () => {
      const vh = window.innerHeight
      anchors.current = [...document.querySelectorAll('[data-chapter]')]
        .sort((p, q) => p.dataset.chapter - q.dataset.chapter)
        .map((el) => {
          const top = el.getBoundingClientRect().top + window.scrollY
          return { start: top - vh * 0.35, end: top + el.offsetHeight - vh * 0.8 }
        })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    const onMove = (e) => {
      const v = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5)
        .unproject(camera).sub(camera.position).normalize()
      mouse.current.copy(camera.position).add(v.multiplyScalar(-camera.position.z / v.z))
    }
    if (!mobile) window.addEventListener('pointermove', onMove, { passive: true })
    return () => { ro.disconnect(); window.removeEventListener('pointermove', onMove) }
  }, [camera, mobile])

  const targetStage = () => {
    const y = window.scrollY, C = anchors.current
    let s = 0
    for (let k = 0; k < C.length; k++) {
      if (y >= C[k].end) { s = k + 1; continue }
      if (y > C[k].start) s = k + (y - C[k].start) / Math.max(1, C[k].end - C[k].start)
      break
    }
    return s
  }
  // DNA flight progress: 0..1 while act 2 holds (between chapter 2 and chapter 3)
  const dnaProgress = () => {
    const C = anchors.current
    if (C.length < 3) return 0
    return THREE.MathUtils.clamp((window.scrollY - C[1].end) / Math.max(1, C[2].start - C[1].end), 0, 1)
  }

  useFrame((state, dt) => {
    const u = mat.current.uniforms
    const t = animate ? state.clock.elapsedTime : 0
    stage.current += (targetStage() - stage.current) * Math.min(1, dt * (animate && !SNAP ? 3.5 : 60))
    const s = stage.current, i0 = Math.min(3, Math.floor(s)), f = s - i0
    const beat = animate ? beatEnv(t) : 0
    if (SNAP) window.__field = { s, target: targetStage(), anchors: anchors.current }

    u.uStage.value = s
    u.uTime.value = t
    u.uBeat.value = beat
    u.uPixel.value = state.gl.getPixelRatio() * (size.height / 900)
    u.uMouse.value.lerp(mouse.current, 0.15)

    // shape placement
    const a = PLACE[i0], b = PLACE[Math.min(4, i0 + 1)]
    const x = mobile ? 0 : a[0] + (b[0] - a[0]) * f
    const y = mobile ? (s < 0.5 ? 0.8 : 0.5) : a[1] + (b[1] - a[1]) * f
    const sc = (a[2] + (b[2] - a[2]) * f) * (mobile ? 0.62 : 1)
    // DNA flight: while act 2 holds, the helix turns and slides so the camera seems to travel along it
    const dnaW = Math.max(0, 1 - Math.abs(s - 2) * 2)
    const dp = dnaProgress()
    // the helix sits beside long text sections: dim it so the words stay readable
    u.uFade.value = (mobile ? 0.55 : 0.85) * (1 - 0.45 * dnaW)
    group.current.position.set(x, y + dnaW * (2.4 - dp * 4.8) * sc, 0)
    group.current.scale.setScalar(sc)
    const traceTilt = Math.max(0, 1 - s)
    group.current.rotation.set(
      -0.38 * traceTilt + dnaW * 0.18,
      -0.42 * traceTilt + (1 - traceTilt) * t * 0.18 * (1 - dnaW) + dnaW * dp * Math.PI * 1.5,
      -0.04 * traceTilt,
    )

    // blueprint reveal of the hero ECG: drawn left to right in white-blue, then inked to colour
    const since = state.clock.elapsedTime - introDelay
    u.uReveal.value = animate ? THREE.MathUtils.clamp(since / 1.6, 0, 1) : 1
    u.uInk.value = animate ? THREE.MathUtils.clamp((since - 1.5) / 0.9, 0, 1) : 1

    // camera: travels between acts and dives forward through each morph ("transitions feel like camera moves")
    const dive = animate ? Math.sin(Math.PI * f) * 3.2 : 0
    const cz = CAM_Z[i0] + (CAM_Z[Math.min(4, i0 + 1)] - CAM_Z[i0]) * f - dive
    // camera follows the shape only a little, so the shape stays beside the text (not behind it)
    camera.position.set(x * 0.12 + (animate ? Math.sin(t * 0.2) * 0.15 : 0), y * 0.2 - dive * 0.08, cz)
    camera.lookAt(x * 0.2, y * 0.3, 0)

    // ISS: a bright dot orbiting the planet in act 4
    const issW = Math.max(0, 1 - Math.abs(s - 3) * 2)
    iss.current.visible = issW > 0.01
    if (iss.current.visible) {
      const ang = t * 0.6
      iss.current.position.set(Math.cos(ang) * 2.8, Math.sin(ang) * 2.8 * Math.sin(0.42), Math.sin(ang) * 2.8 * Math.cos(0.42))
      iss.current.material.opacity = issW
    }

    // hotspots: project their 3D anchors to the screen; show the one whose act is on screen
    hotspotEls.current.forEach((el, k) => {
      if (!el) return
      const h = HOTSPOTS[k]
      const w = mobile ? 0 : Math.max(0, 1 - Math.abs(s - h.act) * 4)
      if (w < 0.05) { if (el.dataset.on !== '0') { el.dataset.on = '0'; el.style.opacity = '0'; el.tabIndex = -1 } return }
      tmp.set(...h.p)
      group.current.localToWorld(tmp)
      // genes behind the helix fade out (depth vs. the helix centre, in camera space)
      let face = 1
      if (h.gene) {
        const zp = tmp.clone().applyMatrix4(camera.matrixWorldInverse).z
        const zc = group.current.getWorldPosition(tmp2).applyMatrix4(camera.matrixWorldInverse).z
        face = THREE.MathUtils.clamp((zp - zc) / 0.6 + 0.5, 0, 1)
      }
      tmp.project(camera)
      const px = ((tmp.x + 1) / 2) * size.width, py = ((1 - tmp.y) / 2) * size.height
      const vis = w * face * (py > 60 && py < size.height - 20 ? 1 : 0)
      el.style.transform = `translate(${px}px, ${py}px)`
      el.classList.toggle('hotspot--flip', px > size.width - 300) // label goes left of the dot near the edge
      el.style.opacity = String(vis)
      const on = vis > 0.4 ? '1' : '0'
      if (el.dataset.on !== on) { el.dataset.on = on; el.tabIndex = on === '1' ? 0 : -1 }
    })

  })

  useEffect(() => () => geo.dispose(), [geo])

  return (
    <group ref={group}>
      <points geometry={geo}>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh ref={iss} visible={false}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#FFE9A8" transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}

// device tier: phones and <= 4-core / <= 4 GB machines get no bloom and fewer points
function getTier() {
  const mobile = window.matchMedia('(max-width: 760px)').matches || /Mobi|Android/i.test(navigator.userAgent)
  const low = mobile || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4
  return { mobile, low }
}

export default function MorphField() {
  const [visible, setVisible] = useState(true)
  const hotspotEls = useRef([])
  const [cfg] = useState(() => {
    const { mobile, low } = getTier()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return { mobile, reduced, bloom: !low && !reduced, count: low ? 4200 : 9000 }
  })
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <>
      <div className="field" aria-hidden="true">
        <Canvas
          dpr={[1, cfg.mobile ? 1.5 : cfg.bloom ? 1.5 : 2]}
          camera={{ position: [0, 0, 9], fov: 42 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: false }}
          frameloop={visible ? 'always' : 'never'}
        >
          <Field count={cfg.count} mobile={cfg.mobile} animate={!cfg.reduced} bloom={cfg.bloom} hotspotEls={hotspotEls} />
        </Canvas>
      </div>
      {!cfg.mobile && (
        <nav className="hotspots" aria-label="Highlights in the 3D scene">
          {HOTSPOTS.map((h, k) => (
            <a key={h.t} href={h.href} ref={(el) => (hotspotEls.current[k] = el)} className="hotspot" tabIndex={-1} data-on="0">
              <i aria-hidden="true" /><span>{h.t}</span>
            </a>
          ))}
        </nav>
      )}
    </>
  )
}
