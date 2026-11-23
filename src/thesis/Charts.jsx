import { useEffect, useRef, useState } from 'react'

// Shared chart shell: draws at the container's real width so text stays at true size on phones,
// hover/focus tooltip per mark, and a table view (dataviz skill: single series -> no legend; title names it).
function useWidth(dep) {
  const ref = useRef(null)
  const [w, setW] = useState(640)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [dep])
  return [ref, w]
}

const fmt = (v) => v.toFixed(3)

function Shell({ title, foot, table, setTable, children, rows, valueName }) {
  return (
    <figure className="chart">
      <figcaption className="chart__head">
        <span className="chart__title">{title}</span>
        <button type="button" className="chart__toggle" onClick={() => setTable((v) => !v)} aria-pressed={table}>
          {table ? 'Show chart' : 'Show table'}
        </button>
      </figcaption>
      {table ? (
        <div className="chart__tablewrap">
          <table className="chart__table">
            <thead><tr><th>Label</th><th>{valueName}</th><th>Notes</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{fmt(r.value)}{r.lo != null && ` (${fmt(r.lo)}–${fmt(r.hi)})`}</td>
                  <td>{r.extra || r.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : children}
      {foot && <p className="chart__foot">{foot}</p>}
    </figure>
  )
}

function Tip({ r, xPct, yPct, valueName }) {
  return (
    <div className="tip" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
      <strong>{r.label}</strong>
      <span>{valueName} {fmt(r.value)}{r.lo != null && ` (95% CI ${fmt(r.lo)}–${fmt(r.hi)})`}</span>
      {r.extra && <span>{r.extra}</span>}
      {r.note && <span>{r.note}</span>}
    </div>
  )
}

/** Dot (+ optional CI) chart. Use when values sit far from zero (AUROC). */
export function DotChart({ title, rows, domain = [0.5, 1], ticks, foot, valueName = 'AUROC', chance, sort = true, ariaLabel }) {
  const [hover, setHover] = useState(null)
  const [table, setTable] = useState(false)
  const [ref, W] = useWidth(table)
  const data = sort ? [...rows].sort((a, b) => b.value - a.value) : rows
  const ROW = 44, TOP = 28, PAD_R = 52
  const PAD_L = W < 460 ? 128 : 190
  const H = TOP + data.length * ROW + 34
  const [x0, x1] = domain
  const x = (v) => PAD_L + ((v - x0) / (x1 - x0)) * (W - PAD_L - PAD_R)
  const tk = ticks || [x0, (x0 + x1) / 2, x1]
  const shownTicks = W < 460 ? tk.filter((_, i) => i % 2 === 0) : tk

  return (
    <Shell title={title} foot={foot} table={table} setTable={setTable} rows={data} valueName={valueName}>
      <div className="chart__plot" ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={ariaLabel || title}>
          {shownTicks.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={TOP - 8} y2={H - 30} className={t === chance ? 'axis-chance' : 'axis-grid'} />
              <text x={x(t)} y={H - 12} className="axis-label" textAnchor="middle">{+t.toFixed(3)}</text>
            </g>
          ))}
          {chance != null && <text x={x(chance) + 4} y={TOP - 12} className="axis-note">chance</text>}
          {data.map((r, i) => {
            const cy = TOP + i * ROW + ROW / 2
            return (
              <g
                key={r.label}
                className={`row${r.primary ? ' row--primary' : ''}${hover === i ? ' row--on' : ''}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                aria-label={`${r.label}: ${valueName} ${fmt(r.value)}${r.lo != null ? `, 95% CI ${fmt(r.lo)} to ${fmt(r.hi)}` : ''}`}
              >
                <rect x={0} y={cy - ROW / 2} width={W} height={ROW} className="row__hit" />
                <text x={PAD_L - 14} y={cy + 4} textAnchor="end" className="row__label">{r.label}</text>
                {r.lo != null && <line x1={x(r.lo)} x2={x(r.hi)} y1={cy} y2={cy} className="row__ci" />}
                <circle cx={x(r.value)} cy={cy} r={r.primary ? 6.5 : 5} className="row__dot" />
                <text x={x(r.hi ?? r.value) + 10} y={cy + 4} className="row__value">{fmt(r.value)}</text>
              </g>
            )
          })}
        </svg>
        {hover !== null && (
          <Tip r={data[hover]} valueName={valueName} xPct={(x(data[hover].value) / W) * 100} yPct={((TOP + hover * ROW) / H) * 100} />
        )}
      </div>
    </Shell>
  )
}

/** Horizontal bars from zero. Use for scores where zero is meaningful (macro-F1). */
export function BarChart({ title, rows, max = 1, foot, valueName = 'Score', ariaLabel }) {
  const [hover, setHover] = useState(null)
  const [table, setTable] = useState(false)
  const [ref, W] = useWidth(table)
  const ROW = 44, TOP = 10, PAD_R = 56
  const PAD_L = W < 460 ? 140 : 210
  const H = TOP + rows.length * ROW + 30
  const x = (v) => PAD_L + (v / max) * (W - PAD_L - PAD_R)
  const ticks = [0, 0.25, 0.5, 0.75, 1].filter((t) => t <= max)

  return (
    <Shell title={title} foot={foot} table={table} setTable={setTable} rows={rows} valueName={valueName}>
      <div className="chart__plot" ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={ariaLabel || title}>
          {ticks.filter((_, i) => W >= 460 || i % 2 === 0).map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={TOP} y2={H - 26} className="axis-grid" />
              <text x={x(t)} y={H - 8} className="axis-label" textAnchor="middle">{t}</text>
            </g>
          ))}
          {rows.map((r, i) => {
            const cy = TOP + i * ROW + ROW / 2
            return (
              <g
                key={r.label}
                className={`row${r.primary ? ' row--primary' : ''}${hover === i ? ' row--on' : ''}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                aria-label={`${r.label}: ${valueName} ${fmt(r.value)}`}
              >
                <rect x={0} y={cy - ROW / 2} width={W} height={ROW} className="row__hit" />
                <text x={PAD_L - 14} y={cy + 4} textAnchor="end" className="row__label">{r.label}</text>
                <rect x={x(0)} y={cy - 9} width={Math.max(2, x(r.value) - x(0))} height={18} rx={4} className={r.primary ? 'bar bar--primary' : 'bar'} />
                <text x={x(r.value) + 8} y={cy + 4} className="row__value">{fmt(r.value)}</text>
              </g>
            )
          })}
        </svg>
        {hover !== null && <Tip r={rows[hover]} valueName={valueName} xPct={(x(rows[hover].value) / W) * 100} yPct={((TOP + hover * ROW) / H) * 100} />}
      </div>
    </Shell>
  )
}
