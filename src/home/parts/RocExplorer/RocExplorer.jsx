import { useMemo, useRef, useState } from 'react'
import data from '../../roc_test.json'
import './RocExplorer.css'

// Plot geometry (viewBox units)
const S = 360, L = 52, T = 14, R = 14, B = 46
const W = S + L + R, H = S + T + B
const px = (f) => L + f * S
const py = (t) => T + (1 - t) * S
const f2 = (v) => v.toFixed(2)
const pct = (v) => (v * 100).toFixed(1) + '%'

// Index of the point whose threshold is nearest 0.5
function startIndex(points) {
  let best = 0
  points.forEach((p, i) => { if (Math.abs(p[0] - 0.5) < Math.abs(points[best][0] - 0.5)) best = i })
  return best
}

export default function RocExplorer({ defaultLabel = 'Normal' }) {
  const [labelId, setLabelId] = useState(defaultLabel)
  const lab = data.labels.find((l) => l.id === labelId) || data.labels[0]
  const [idxByLabel, setIdxByLabel] = useState({})
  const idx = idxByLabel[lab.id] ?? startIndex(lab.points)
  const setIdx = (i) => setIdxByLabel((s) => ({ ...s, [lab.id]: i }))
  const svgRef = useRef(null)
  const tabsRef = useRef(null)

  const [thr, TP, FP] = lab.points[idx]
  const FN = lab.pos - TP, TN = lab.neg - FP
  const sens = TP / lab.pos, spec = TN / lab.neg
  const x = px(FP / lab.neg), y = py(sens)

  const path = useMemo(
    () => lab.curve.map((p, i) => (i ? 'L' : 'M') + px(p[0]).toFixed(1) + ' ' + py(p[1]).toFixed(1)).join(''),
    [lab]
  )
  // Hidden-table rows: seven evenly spaced operating points
  const rows = useMemo(() => {
    const n = lab.points.length, out = []
    for (let k = 0; k < 7; k++) out.push(lab.points[Math.round((k * (n - 1)) / 6)])
    return out
  }, [lab])

  // Drag: snap to the operating point closest to the pointer in plot space
  const move = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const fx = ((e.clientX - r.left) / r.width * W - L) / S
    const ty = 1 - ((e.clientY - r.top) / r.height * H - T) / S
    let best = idx, bd = Infinity
    lab.points.forEach((p, i) => {
      const d = (p[2] / lab.neg - fx) ** 2 + (p[1] / lab.pos - ty) ** 2
      if (d < bd) { bd = d; best = i }
    })
    setIdx(best)
  }
  const down = (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); move(e) }
  const dragging = (e) => { if (e.buttons) move(e) }

  const tabKey = (e) => {
    const n = data.labels.length
    const k = data.labels.findIndex((q) => q.id === lab.id)
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const j = (k + d + n) % n
    setLabelId(data.labels[j].id)
    tabsRef.current.children[j].focus()
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const summary = `${lab.name}, threshold ${f2(thr)}: sensitivity ${pct(sens)} (${TP} of ${lab.pos}), specificity ${pct(spec)} (${TN} of ${lab.neg}). ${FN} missed, ${FP} false alarms.`

  return (
    <section className="roc-wrap" aria-labelledby="roc-title">
      <h3 id="roc-title" className="roc-title">ROC explorer, locked test set</h3>
      <div className="roc-tabs" role="tablist" aria-label="Label" ref={tabsRef}>
        {data.labels.map((l) => (
          <button key={l.id} role="tab" aria-selected={l.id === lab.id} tabIndex={l.id === lab.id ? 0 : -1}
            className="roc-tab" onClick={() => setLabelId(l.id)} onKeyDown={tabKey}>
            {l.name}
          </button>
        ))}
      </div>

      <div className="roc-body">
        <div className="roc-plot">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img"
            aria-label={`ROC curve for ${lab.name}, AUROC ${lab.auc.toFixed(3)}. Drag the point or use the slider.`}
            onPointerDown={down} onPointerMove={dragging}>
            <rect x={L} y={T} width={S} height={S} className="roc-frame" />
            {ticks.map((t) => (
              <g key={t}>
                <line x1={px(t)} x2={px(t)} y1={T} y2={T + S} className="roc-grid" />
                <line x1={L} x2={L + S} y1={py(t)} y2={py(t)} className="roc-grid" />
                <text x={px(t)} y={T + S + 16} textAnchor="middle" className="roc-tick">{t}</text>
                <text x={L - 8} y={py(t) + 4} textAnchor="end" className="roc-tick">{t}</text>
              </g>
            ))}
            <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} className="roc-diag" />
            <path d={path} className="roc-curve" />
            <line x1={x} x2={x} y1={y} y2={py(0)} className="roc-guide" />
            <line x1={px(0)} x2={x} y1={y} y2={y} className="roc-guide" />
            <circle cx={x} cy={y} r="16" className="roc-hit" />
            <circle cx={x} cy={y} r="6" className="roc-dot" />
            <text x={L + S / 2} y={H - 6} textAnchor="middle" className="roc-axis">False positive rate</text>
            <text transform={`translate(13 ${T + S / 2}) rotate(-90)`} textAnchor="middle" className="roc-axis">Sensitivity</text>
            <text x={L + S - 8} y={T + S - 10} textAnchor="end" className="roc-auc">AUROC {lab.auc.toFixed(3)}</text>
          </svg>
        </div>

        <div className="roc-panel">
          <label className="roc-slider" htmlFor="roc-range">
            <span>Threshold <b className="roc-num">{f2(thr)}</b></span>
            <input id="roc-range" type="range" min="0" max={lab.points.length - 1} step="1" value={idx}
              onChange={(e) => setIdx(+e.target.value)}
              aria-valuetext={`threshold ${f2(thr)}`} />
            <span className="roc-ends"><span>flag more</span><span>flag fewer</span></span>
          </label>
          <dl className="roc-stats">
            <div><dt>Sensitivity</dt><dd className="roc-num">{pct(sens)}</dd><dd><small>{TP}/{lab.pos}</small></dd></div>
            <div><dt>Specificity</dt><dd className="roc-num">{pct(spec)}</dd><dd><small>{TN}/{lab.neg}</small></dd></div>
          </dl>
          <table className="roc-cm">
            <caption className="roc-vh">Confusion matrix</caption>
            <thead>
              <tr><td></td><th scope="col">Flagged</th><th scope="col">Not flagged</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">Disease present ({lab.pos})</th><td className="roc-ok">{TP}<small>TP</small></td><td className="roc-bad">{FN}<small>FN, missed</small></td></tr>
              <tr><th scope="row">Disease absent ({lab.neg})</th><td className="roc-bad">{FP}<small>FP, false alarm</small></td><td className="roc-ok">{TN}<small>TN</small></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <p role="status" aria-live="polite" className="roc-live">{summary}</p>
      <p className="roc-cap">Locked test set (n = {data.n}), opened once. Each threshold trades missed disease against false alarms.</p>
      <p className="roc-note">Scores from the saved test predictions; no model runs in the browser.</p>

      <table className="roc-vh">
        <caption>Operating points for {lab.name}</caption>
        <thead><tr><th>Threshold</th><th>Sensitivity</th><th>Specificity</th><th>TP</th><th>FP</th><th>FN</th><th>TN</th></tr></thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={i}><td>{f2(p[0])}</td><td>{pct(p[1] / lab.pos)}</td><td>{pct((lab.neg - p[2]) / lab.neg)}</td><td>{p[1]}</td><td>{p[2]}</td><td>{lab.pos - p[1]}</td><td>{lab.neg - p[2]}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
