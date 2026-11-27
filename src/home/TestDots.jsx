import { useEffect, useMemo, useRef, useState } from 'react'
import data from './test_dots.json'

// "Every dot is one photograph": the 240 locked-test ECG photographs, placed by the model's score that the ECG is
// NOT normal and coloured by the cardiologist's label. Real saved predictions, no identifiers, shuffled order.
// Beeswarm layout is computed deterministically, so the prerendered SVG already shows the final picture.
const W = 900, H = 200, R = 5.2, PAD = 30
// Scores pile up near 0 and 1, so the axis is on the log-odds scale (ticks still read as probabilities).
const LO = -12, HI = 12
const lg = (s) => { const c = Math.min(1 - 1e-6, Math.max(1e-6, s)); return Math.min(HI, Math.max(LO, Math.log(c / (1 - c)))) }
const sx = (s) => PAD + ((lg(s) - LO) / (HI - LO)) * (W - 2 * PAD)
const TICKS = [0.00001, 0.001, 0.1, 0.5, 0.9, 0.999, 0.99999]

function swarm(rows) {
  const pts = rows.map(([s, ab, k], i) => ({ i, s, ab, k, x: sx(s), y: 0 })).sort((a, b) => a.x - b.x)
  const placed = []
  for (const p of pts) {
    for (let step = 0; step < 400; step++) {
      const off = (step % 2 ? 1 : -1) * Math.ceil(step / 2) * (R * 0.9)
      const y = H / 2 + off
      if (!placed.some((q) => Math.abs(q.x - p.x) < 2 * R && Math.hypot(q.x - p.x, q.y - y) < 2 * R + 0.6)) { p.y = y; break }
    }
    placed.push(p)
  }
  return placed
}

export default function TestDots() {
  const pts = useMemo(() => swarm(data.rows), [])
  const [hover, setHover] = useState(null)
  const [cut, setCut] = useState(0.5)
  const [inView, setInView] = useState(false)
  const [armed, setArmed] = useState(false) // dots hidden only after JS runs, so the prerendered HTML shows them
  const svg = useRef(null)
  useEffect(() => {
    if (svg.current.getBoundingClientRect().top > innerHeight) setArmed(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect() } }, { threshold: 0.25 })
    io.observe(svg.current); return () => io.disconnect()
  }, [])
  const ab = pts.filter((p) => p.ab), nm = pts.filter((p) => !p.ab)
  const tp = ab.filter((p) => p.s >= cut).length, tn = nm.filter((p) => p.s < cut).length
  const toX = (e) => { const r = svg.current.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W }
  const move = (e) => {
    const x = toX(e), y = ((e.clientY - svg.current.getBoundingClientRect().top) / svg.current.getBoundingClientRect().height) * H
    let best = null, bd = 14
    for (const p of pts) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p } }
    setHover(best)
  }
  return (
    <section className="td" aria-labelledby="td-h">
      <p className="eyebrow">Locked test set · every dot is one photograph</p>
      <h3 id="td-h" className="td-h">240 photographs, one score each</h3>
      <p className="td-sub">Each dot is a phone photograph from the locked test set, placed by how strongly the model says
        the ECG is <em>not normal</em>. Filled dots: the cardiologist wrote an abnormal finding. Hollow dots: normal.
        Drag the slider to move the cut-off. The axis is stretched at both ends because most scores sit near 0 or 1.</p>
      <div className="td-wrap" data-caliper="fig · 240 test photographs">
        <svg ref={svg} viewBox={`0 0 ${W} ${H + 30}`} className={`${armed ? 'arm' : ''}${inView ? ' in' : ''}`} onPointerMove={move} onPointerLeave={() => setHover(null)}
          role="img" aria-label={`Beeswarm of ${pts.length} test photographs by model score; ${ab.length} abnormal by the cardiologist.`}>
          <line className="td-axis" x1={PAD} x2={W - PAD} y1={H + 6} y2={H + 6} />
          {TICKS.map((t) => (
            <text key={t} className="td-tick" x={sx(t)} y={H + 24} textAnchor="middle">{t}</text>
          ))}
          {pts.map((p) => (
            <circle key={p.i} cx={p.x} cy={p.y} r={hover === p ? R * 1.7 : R}
              className={`td-dot ${p.ab ? 'ab' : 'nm'}${(p.s >= cut) === !!p.ab ? '' : ' wrong'}`}
              style={{ '--d': `${(p.x / W) * 900 + (p.i % 7) * 30}ms`, '--fy': `${-p.y - 20}px` }} />
          ))}
          <line className="td-cut" x1={sx(cut)} x2={sx(cut)} y1={8} y2={H + 6} />
        </svg>
        {hover && (
          <p className="td-tip" style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / (H + 30)) * 100}%` }}>
            Cardiologist: <b>{hover.ab ? `abnormal${hover.k > 1 ? ` (${hover.k} findings)` : ''}` : 'normal'}</b><br />Model score {hover.s.toFixed(2)}
          </p>
        )}
      </div>
      <div className="td-ctl">
        <label htmlFor="td-cut">Cut-off <b>{cut.toFixed(2)}</b></label>
        <input id="td-cut" type="range" min="0.02" max="0.98" step="0.01" value={cut} onChange={(e) => setCut(+e.target.value)} />
        <p role="status" aria-live="polite">Abnormal caught <b>{tp}</b> of {ab.length} · normal kept clear <b>{tn}</b> of {nm.length} · faded dots are the mistakes at this cut-off.</p>
      </div>
      <p className="td-note">Scores from the saved predictions of the frozen model (no model runs here). Order shuffled; no identifiers.</p>
    </section>
  )
}
