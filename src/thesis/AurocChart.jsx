import { useEffect, useRef, useState } from 'react'
import { testSet } from './data.js'

// Dot + 95% CI interval, sorted by AUROC. Single series (one accent), primary row emphasised.
// Drawn at the container's real width so text stays at true size on phones.
const ROW = 44, PAD_R = 52, TOP = 28
const X0 = 0.5, X1 = 1.0

export default function AurocChart() {
  const [hover, setHover] = useState(null)
  const [table, setTable] = useState(false)
  const plot = useRef(null)
  const [W, setW] = useState(640)
  useEffect(() => {
    if (!plot.current) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(plot.current)
    return () => ro.disconnect()
  }, [table])
  const PAD_L = W < 460 ? 118 : 150
  const rows = [...testSet].sort((a, b) => b.auroc - a.auroc)
  const H = TOP + rows.length * ROW + 34
  const x = (v) => PAD_L + ((v - X0) / (X1 - X0)) * (W - PAD_L - PAD_R)
  const ticks = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

  return (
    <figure className="chart">
      <figcaption className="chart__head">
        <span className="chart__title">Locked test set, AUROC per label (n = 240, opened once)</span>
        <button type="button" className="chart__toggle" onClick={() => setTable((v) => !v)} aria-pressed={table}>
          {table ? 'Show chart' : 'Show table'}
        </button>
      </figcaption>

      {table ? (
        <div className="chart__tablewrap">
          <table className="chart__table">
            <thead><tr><th>Label</th><th>AUROC (95% CI)</th><th>Sens.</th><th>Spec.</th><th>Positives</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td><td>{r.auroc.toFixed(3)} ({r.lo.toFixed(3)}–{r.hi.toFixed(3)})</td>
                  <td>{r.sens ?? '—'}</td><td>{r.spec ?? '—'}</td><td>{r.pos ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart__plot" ref={plot}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Dot plot of test-set AUROC with 95% confidence intervals per label">
            {(W >= 460 ? ticks : [0.5, 0.7, 0.9]).map((t) => (
              <g key={t}>
                <line x1={x(t)} x2={x(t)} y1={TOP - 8} y2={H - 30} className={t === 0.5 ? 'axis-chance' : 'axis-grid'} />
                <text x={x(t)} y={H - 12} className="axis-label" textAnchor="middle">{t.toFixed(1)}</text>
              </g>
            ))}
            <text x={x(0.5) + 4} y={TOP - 12} className="axis-note">chance</text>
            {rows.map((r, i) => {
              const cy = TOP + i * ROW + ROW / 2
              const on = hover === i
              return (
                <g
                  key={r.label}
                  className={`row${r.primary ? ' row--primary' : ''}${on ? ' row--on' : ''}`}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                  aria-label={`${r.label}: AUROC ${r.auroc}, 95% CI ${r.lo} to ${r.hi}`}
                >
                  <rect x={0} y={cy - ROW / 2} width={W} height={ROW} className="row__hit" />
                  <text x={PAD_L - 14} y={cy + 4} textAnchor="end" className="row__label">{r.label}</text>
                  <line x1={x(r.lo)} x2={x(r.hi)} y1={cy} y2={cy} className="row__ci" />
                  <circle cx={x(r.auroc)} cy={cy} r={r.primary ? 6.5 : 5} className="row__dot" />
                  <text x={x(r.hi) + 8} y={cy + 4} className="row__value">{r.auroc.toFixed(3)}</text>
                </g>
              )
            })}
          </svg>
          {hover !== null && (
            <div className="tip" style={{ left: `${(x(rows[hover].auroc) / W) * 100}%`, top: `${((TOP + hover * ROW) / H) * 100}%` }}>
              <strong>{rows[hover].label}</strong>
              <span>AUROC {rows[hover].auroc.toFixed(3)} (95% CI {rows[hover].lo.toFixed(3)}–{rows[hover].hi.toFixed(3)})</span>
              {rows[hover].sens != null && <span>Sensitivity {rows[hover].sens} · Specificity {rows[hover].spec} · {rows[hover].pos} positives</span>}
              {rows[hover].note && <span>{rows[hover].note}</span>}
            </div>
          )}
        </div>
      )}
      <p className="chart__foot">
        Primary endpoint = macro AUROC over Normal, Ischaemia, Arrhythmia/block and Rate. Development cross-validation of
        the same model: 0.892 (0.875–0.909). Weak spots: Arrhythmia/block sensitivity 0.42; “Other” is hard.
      </p>
    </figure>
  )
}
