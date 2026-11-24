import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Lens from './parts/Lens/Lens.jsx'
const Paper3D = lazy(() => import('./Paper3D.jsx'))
import { forms } from './data.js'

// Synthetic 12-lead ECG (procedural; no patient data). Units: mm at 25 mm/s and 10 mm/mV.
const LEADS = [
  ['I', 1, 0.6, 0.25], ['aVR', -1, -0.5, -0.2], ['V1', 0.35, -0.3, 0.15], ['V4', 1.4, 0.3, 0.45],
  ['II', 1.3, 0.8, 0.35], ['aVL', 0.5, 0.2, 0.12], ['V2', 0.7, -0.6, 0.35], ['V5', 1.5, 0.4, 0.4],
  ['III', 0.6, 0.35, 0.15], ['aVF', 0.95, 0.5, 0.25], ['V3', 1.1, -0.1, 0.4], ['V6', 1.2, 0.35, 0.3],
]
// one beat as [t (s), mV] points; r = R amplitude, s = S depth sign handled by r/t args
function beat(r, t, p) {
  const s = r > 0 ? -0.25 * Math.min(1, r) : 0.15
  return [[0, 0], [0.06, p * 0.12], [0.1, p * 0.15], [0.14, 0], [0.18, 0], [0.2, -0.08 * Math.sign(r || 1)],
    [0.23, r], [0.26, s], [0.29, 0], [0.4, 0.02], [0.48, t], [0.56, 0], [0.8, 0]]
}
function trace(x0, y0, secs, lead, offset = 0) {
  const [, r, t, p] = lead
  const b = beat(r, t, p * 1.2)
  let d = ''
  for (let k = -1; k * 0.8 < secs + 0.8; k++) {
    for (const [tt, v] of b) {
      const time = k * 0.8 + tt - offset
      if (time < 0 || time > secs) continue
      d += `${d ? 'L' : 'M'}${(x0 + time * 25).toFixed(1)} ${(y0 - v * 10).toFixed(1)}`
    }
  }
  return d
}
function Sheet() {
  const rows = [18, 44, 70]
  const paths = LEADS.map((l, i) => {
    const col = i % 4, row = Math.floor(i / 4)
    return { lab: l[0], x: 5 + col * 62.5, y: rows[row], d: trace(5 + col * 62.5, rows[row], 2.5, l, 0.13 * col) }
  })
  return (
    <svg className="sheet" viewBox="0 0 260 112" aria-hidden="true">
      <defs>
        <pattern id="g1" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0V1H0" className="g-minor" /></pattern>
        <pattern id="g5" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="url(#g1)" /><path d="M5 0V5H0" className="g-major" /></pattern>
      </defs>
      <rect width="260" height="112" className="paper" />
      <rect x="5" y="4" width="250" height="104" fill="url(#g5)" />
      {paths.map((p) => (
        <g key={p.lab}>
          <path d={p.d} className="ink" />
          <text x={p.x + 1} y={p.y - 8} className="lead">{p.lab}</text>
        </g>
      ))}
      <path d={trace(5, 96, 10, LEADS[4])} className="ink" />
      <text x="6" y="88" className="lead">II</text>
    </svg>
  )
}

const fmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(3)

export default function SameSignal() {
  const [sel, setSel] = useState('render')
  useEffect(() => { // test hook: ?form=<id> (after hydration, so pre-rendered HTML stays identical)
    const q = new URLSearchParams(location.search).get('form')
    if (q && forms.some((x) => x.id === q)) setSel(q)
  }, [])
  const f = forms.find((x) => x.id === sel)
  // Paper physics (cheap): crumpling = animated SVG displacement, crushed past its rest value then relaxing;
  // leaving the form flattens it back. Pointer tilt + moving glare on fine pointers only.
  const disp = useRef(null), stage = useRef(null), cur = useRef(0)
  const [warp, setWarp] = useState(false)
  useEffect(() => {
    const target = sel === 'crumpled' ? 9 : 0
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = cur.current
    const set = (v) => { cur.current = v; disp.current?.setAttribute('scale', v.toFixed(2)); setWarp(v > 0.05) }
    if (reduce || from === target) { set(target); return }
    setWarp(true)
    const t0 = performance.now(), dur = target ? 900 : 600
    let raf
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      // crush overshoot when crumpling (to ~1.8x), plain ease-out when flattening
      const e = target ? 1 - Math.pow(1 - k, 3) + Math.sin(k * Math.PI) * 0.8 : 1 - Math.pow(1 - k, 3)
      set(from + (target - from) * e)
      if (k < 1) raf = requestAnimationFrame(tick)
      else set(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sel])
  // 3D crumple (paperlab) on capable desktops only: WebGL2, fine pointer, motion allowed
  const [src, setSrc] = useState(null)
  useEffect(() => {
    if (sel !== 'crumpled' || src) return
    const ok = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !!document.createElement('canvas').getContext('webgl2')
    if (!ok) return
    const svg = stage.current.querySelector('.sheet').cloneNode(true)
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); svg.setAttribute('width', '2080'); svg.setAttribute('height', '896')
    const css = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    css.textContent = '.paper{fill:#fffdf9}.g-minor{fill:none;stroke:#f3cfcf;stroke-width:.12}.g-major{fill:none;stroke:#e7a3a3;stroke-width:.22}.ink{fill:none;stroke:#1d1d1f;stroke-width:.38;stroke-linejoin:round}.lead{font:500 3.2px Arial,sans-serif;fill:#1d1d1f}'
    svg.prepend(css)
    const img = new Image()
    img.onload = () => { // rasterise: WebGL textures want pixels, not SVG
      const c = document.createElement('canvas'); c.width = 2080; c.height = 896
      c.getContext('2d').drawImage(img, 0, 0); setSrc(c.toDataURL('image/png'))
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML)
  }, [sel, src])
  const tilt = (e) => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = stage.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    const st = stage.current.style
    st.setProperty('--ty', `${((x - 0.5) * 10).toFixed(2)}deg`)
    st.setProperty('--tx', `${((0.5 - y) * 8).toFixed(2)}deg`)
    st.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
    st.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
    st.setProperty('--go', '1')
  }
  const untilt = () => { const st = stage.current?.style; if (!st) return; st.setProperty('--tx', '0deg'); st.setProperty('--ty', '0deg'); st.setProperty('--go', '0') }
  const lo = 0.8, hi = 0.86
  const pct = (v) => `${(((v - lo) / (hi - lo)) * 100).toFixed(1)}%`
  return (
    <section className="wrap section signal" aria-labelledby="signal-h">
      <p className="eyebrow">Robustness · the same signal</p>
      <h2 id="signal-h">One ECG, nine physical forms</h2>
      <p className="sub">
        The model was trained only on phone photographs from one hospital in Dhaka. It was then scored, without
        retraining, on 977 public ECGs (PTB-XL, Germany) that exist as a clean render, as scans, as phone photographs
        of clean, crumpled and stained paper, and as a photograph of a monitor.
      </p>
      <div className="signal-grid">
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <filter id="crumple"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="3" result="n" />
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" /></filter>
        </svg>
        <figure className={`stage form-${sel}`} ref={stage} onPointerMove={tilt} onPointerLeave={untilt}>
          <div className="tilt">
            <div className="sheet-wrap">
              <div className="warp" style={{ filter: warp ? 'url(#crumple)' : undefined }}><Lens zoom={2.5} size={150}><Sheet /></Lens></div>
              <span className="fx creases" /><span className="fx stains" /><span className="fx moire" /><span className="fx light" /><span className="glare" />
              {sel === 'crumpled' && src && <Suspense fallback={null}><div className="paper3d-wrap"><Paper3D src={src} /></div></Suspense>}
            </div>
          </div>
          <figcaption>Synthetic ECG drawn by this page; the effect only illustrates the form. No model runs here.</figcaption>
        </figure>
        <div className="panel">
          <div className="forms" role="radiogroup" aria-label="Physical form of the ECG">
            {forms.map((x) => (
              <label key={x.id} className={x.id === sel ? 'on' : ''}>
                <input type="radio" name="form" value={x.id} checked={x.id === sel} onChange={() => setSel(x.id)} />
                {x.label}
              </label>
            ))}
          </div>
          <div className="readout" role="status" aria-live="polite">
            <p className="ro-form">{f.label}</p>
            <p className="ro-note">{f.note}</p>
            <p className="ro-num"><span>{f.macro.toFixed(3)}</span> macro AUROC</p>
            <p className="ro-diff">{f.diff === null ? 'Reference form' : `${fmt(f.diff)} vs the clean render, same 977 ECGs`}</p>
          </div>
          <ol className="strip" aria-label="Macro AUROC for all nine forms">
            {forms.map((x) => (
              <li key={x.id} className={x.id === sel ? 'on' : ''}>
                <span className="s-lab">{x.label}</span>
                <span className="s-track"><i style={{ left: pct(x.macro) }} /></span>
                <span className="s-val">{x.macro.toFixed(3)}</span>
              </li>
            ))}
          </ol>
          <p className="fine">Measured once per form; mean AUROC of Normal, Ischaemia, Arrhythmia/block and Rate. Axis 0.80–0.86.
            Data: ECG-Image-Database (CC BY-ND 4.0). Per-label intervals are in the paper.</p>
        </div>
      </div>
    </section>
  )
}
