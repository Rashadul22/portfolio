import { useEffect, useMemo, useRef, useState } from 'react'

// Synthetic rhythm strip (sinus rhythm with mild beat-to-beat variation; drawn by this page, not patient data).
// Scale: 100 viewBox units = 1 s. Pointer over the strip -> ECG calipers measure the RR interval around it.
const RR = [0.84, 0.78, 0.81, 0.74, 0.88, 0.8, 0.77, 0.86, 0.79]
const H = 60

function build() {
  const base = H * 0.66
  let d = `M0 ${base}`, x = 0
  const peaks = []
  for (const rr of RR) {
    const w = rr * 100
    const p = (f, y) => `L${(x + f * 80).toFixed(1)} ${(base - y).toFixed(1)}`
    // fixed-duration complex (0.6 s) then flat line to fill the RR interval
    d += p(0.12, 0) + p(0.2, 5) + p(0.28, 0) + p(0.34, 0) + p(0.37, -5) + p(0.41, H * 0.58) + p(0.45, -11) +
      p(0.48, 0) + p(0.6, 0) + p(0.7, 8) + p(0.8, 0)
    peaks.push(x + 0.41 * 80)
    x += w
    d += `L${x.toFixed(1)} ${base}`
  }
  return { d, peaks, width: x }
}

export default function HeroTrace() {
  const { d, peaks, width } = useMemo(build, [])
  const [cal, setCal] = useState(null)
  const ref = useRef(null), canvas = useRef(null), pathEl = useRef(null), fx = useRef(null)
  // Fray effect: near the pointer the ink line dissolves into its sample points, pushed away like iron filings;
  // they spring back when the pointer leaves. Canvas in pixel space; the SVG line is masked under the pointer.
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = canvas.current, g = c.getContext('2d'), path = pathEl.current
    const N = 900, L = path.getTotalLength()
    const pts = Array.from({ length: N }, (_, i) => { const q = path.getPointAtLength((i / (N - 1)) * L); return { u: q.x, v: q.y, dx: 0, dy: 0, vx: 0, vy: 0 } })
    const st = { mx: -999, my: -999, on: false, raf: 0, w: 0, h: 0 }
    const size = () => { const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); st.w = r.width; st.h = r.height; c.width = r.width * dpr; c.height = r.height * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0) }
    size(); const ro = new ResizeObserver(size); ro.observe(c)
    const ink = getComputedStyle(path).stroke
    const tick = () => {
      let active = false
      g.clearRect(0, 0, st.w, st.h)
      g.fillStyle = ink
      for (const p of pts) {
        const x = (p.u / width) * st.w, y = (p.v / H) * st.h
        const ddx = x - st.mx, ddy = y - st.my, d = Math.hypot(ddx, ddy)
        if (st.on && d < 70) { const f = (1 - d / 70) * 2.2; p.vx += (ddx / (d || 1)) * f + (Math.random() - .5) * .6; p.vy += (ddy / (d || 1)) * f + (Math.random() - .5) * .6 }
        p.vx += -p.dx * 0.08; p.vy += -p.dy * 0.08; p.vx *= 0.82; p.vy *= 0.82; p.dx += p.vx; p.dy += p.vy
        const off = Math.abs(p.dx) + Math.abs(p.dy)
        if (off > 0.3 || (st.on && d < 72)) { active = true; g.globalAlpha = Math.min(1, 0.35 + off / 12); g.fillRect(x + p.dx - 1, y + p.dy - 1, 2, 2) }
      }
      g.globalAlpha = 1
      st.raf = active || st.on ? requestAnimationFrame(tick) : 0
    }
    fx.current = {
      move(x, y) { st.mx = x; st.my = y; st.on = true; ref.current.style.setProperty('--mx', `${x}px`); ref.current.style.setProperty('--my', `${y}px`); ref.current.classList.add('fray'); if (!st.raf) st.raf = requestAnimationFrame(tick) },
      leave() { st.on = false; ref.current.classList.remove('fray'); if (!st.raf) st.raf = requestAnimationFrame(tick) },
    }
    return () => { cancelAnimationFrame(st.raf); ro.disconnect(); fx.current = null }
  }, [width])
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    if (e.pointerType === 'mouse') fx.current?.move(e.clientX - r.left, e.clientY - r.top)
    const vx = ((e.clientX - r.left) / r.width) * width
    let i = peaks.findIndex((p) => p > vx) - 1
    if (i < 0) i = 0
    if (i >= peaks.length - 1) i = peaks.length - 2
    const a = peaks[i], b = peaks[i + 1], ms = Math.round((b - a) * 10)
    setCal({ a, b, ms, bpm: Math.round(60000 / ms) })
  }
  return (
    <div className="hero-trace" ref={ref} onPointerMove={move} onPointerDown={move} onPointerLeave={() => { setCal(null); fx.current?.leave() }}>
      <svg className="trace" viewBox={`0 0 ${width} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={d} ref={pathEl} />
        {cal && (
          <g className="cal">
            <rect x={cal.a} y="0" width={cal.b - cal.a} height={H} />
            <line x1={cal.a} x2={cal.a} y1="0" y2={H} />
            <line x1={cal.b} x2={cal.b} y1="0" y2={H} />
          </g>
        )}
      </svg>
      <canvas ref={canvas} className="fray-canvas" aria-hidden="true" />
      {cal && (
        <span className="cal-label" style={{ left: `${((cal.a + cal.b) / 2 / width) * 100}%` }}>
          RR {cal.ms} ms · {cal.bpm}/min
        </span>
      )}
      <p className="trace-hint" aria-hidden="true">{cal ? 'Calipers measure the beat-to-beat interval of this synthetic strip' : 'Point at the strip: ECG calipers'}</p>
    </div>
  )
}
