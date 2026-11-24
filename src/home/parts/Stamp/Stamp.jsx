// Ink rubber-stamp that thumps onto its parent card once when scrolled into view.
// Technique credit: inspired by FeralUI Stamp (feralui.dev/stamp, MIT); this is an independent implementation.
// The parent element must be position: relative (the stamp is absolutely placed in a corner).
import { useEffect, useId, useRef, useState } from 'react'
import './Stamp.css'

const CHAR_W = 15 // px per glyph at font-size 22 (monospace, with spacing)
const CORNERS = ['top-right', 'top-left', 'bottom-right', 'bottom-left']

export default function Stamp({
  lines = ['LOCKED TEST', 'OPENED ONCE'],
  date = '21 NOV 2026',
  color,
  red = false,
  corner = 'top-right',
  className = '',
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ref = useRef(null)
  // 'done' = shown stamped (server render, reduced motion); 'wait' = hidden until seen; 'hit' = animating
  const [phase, setPhase] = useState('done')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setPhase('wait')
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect()
          setPhase('hit')
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const L = lines.filter(Boolean)
  const longest = Math.max(...L.map((s) => s.length), (date || '').length, 6)
  const W = longest * CHAR_W + 44
  const lineH = 28
  const H = 24 + L.length * lineH + (date ? 26 : 0) + 8
  const label = [...L, date].filter(Boolean).join(', ')
  const ink = color || (red ? 'var(--trace)' : 'var(--accent)')
  const corn = CORNERS.includes(corner) ? corner : 'top-right'

  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      className={`stp-root stp-${corn} stp-${phase} ${className}`}
      style={{ '--stp-ink': ink, width: W, maxWidth: '70%' }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true" focusable="false">
        <defs>
          {/* rough, uneven ink: noise thresholded into an alpha mask, plus slight edge wobble */}
          <filter id={`stpf${uid}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.35" result="m" />
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" seed="3" result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale="2.2" result="d" />
            <feComposite in="d" in2="m" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#stpf${uid})`} fill={ink} stroke={ink}>
          <rect x="3" y="3" width={W - 6} height={H - 6} rx="6" fill="none" strokeWidth="3.5" />
          <rect x="9" y="9" width={W - 18} height={H - 18} rx="3" fill="none" strokeWidth="1.2" />
          {L.map((s, i) => (
            <text
              key={i}
              x={W / 2}
              y={22 + (i + 1) * lineH - 6}
              textAnchor="middle"
              textLength={s.length * CHAR_W}
              lengthAdjust="spacingAndGlyphs"
              stroke="none"
              style={{ font: '700 22px var(--mono)' }}
            >
              {s}
            </text>
          ))}
          {date && (
            <text
              x={W / 2}
              y={H - 15}
              textAnchor="middle"
              textLength={date.length * 11}
              lengthAdjust="spacingAndGlyphs"
              stroke="none"
              style={{ font: '500 14px var(--mono)' }}
            >
              {date}
            </text>
          )}
        </g>
      </svg>
    </span>
  )
}
