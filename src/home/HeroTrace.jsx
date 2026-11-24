import { useMemo, useRef, useState } from 'react'

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
  const ref = useRef(null)
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * width
    let i = peaks.findIndex((p) => p > vx) - 1
    if (i < 0) i = 0
    if (i >= peaks.length - 1) i = peaks.length - 2
    const a = peaks[i], b = peaks[i + 1], ms = Math.round((b - a) * 10)
    setCal({ a, b, ms, bpm: Math.round(60000 / ms) })
  }
  return (
    <div className="hero-trace" ref={ref} onPointerMove={move} onPointerDown={move} onPointerLeave={() => setCal(null)}>
      <svg className="trace" viewBox={`0 0 ${width} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={d} />
        {cal && (
          <g className="cal">
            <rect x={cal.a} y="0" width={cal.b - cal.a} height={H} />
            <line x1={cal.a} x2={cal.a} y1="0" y2={H} />
            <line x1={cal.b} x2={cal.b} y1="0" y2={H} />
          </g>
        )}
      </svg>
      {cal && (
        <span className="cal-label" style={{ left: `${((cal.a + cal.b) / 2 / width) * 100}%` }}>
          RR {cal.ms} ms · {cal.bpm}/min
        </span>
      )}
      <p className="trace-hint" aria-hidden="true">{cal ? 'Calipers measure the beat-to-beat interval of this synthetic strip' : 'Point at the strip: ECG calipers'}</p>
    </div>
  )
}
