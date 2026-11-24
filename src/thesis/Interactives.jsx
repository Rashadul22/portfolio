import { useEffect, useRef, useState } from 'react'
import { drawEcgPaper, paintCanvas, LEAD_BOXES, whenNear } from './ecg.js'
import { shortcut, robustForms, leadFindings } from './data.js'

// true once the canvas is near the viewport: drawing waits until then (keeps page load light)
function useNear(ref) {
  const [near, setNear] = useState(false)
  useEffect(() => whenNear(ref.current, () => setNear(true)), [])
  return near
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([k, l]) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} className={value === k ? 'is-on' : ''} onClick={() => onChange(k)}>
          {l}
        </button>
      ))}
    </div>
  )
}

/* ---------- 1. Shortcut test ---------- */
export function ShortcutTest() {
  const [mode, setMode] = useState('full')
  const ref = useRef(null)
  const near = useNear(ref)
  useEffect(() => {
    if (near) paintCanvas(ref.current, { grid: mode !== 'trace', trace: mode !== 'erased', header: false })
  }, [mode, near])
  const s = shortcut[mode]
  const pct = ((s.value - 0.5) / 0.5) * 100

  return (
    <div className="demo">
      <div className="demo__visual">
        <canvas ref={ref} className="demo__canvas" role="img" aria-label={`Synthetic ECG, ${s.label.toLowerCase()}`} />
      </div>
      <div className="demo__panel">
        <Segmented label="Input shown to the model" value={mode} onChange={setMode}
          options={Object.entries(shortcut).map(([k, v]) => [k, v.label])} />
        <p className="demo__big" aria-live="polite">{s.value.toFixed(3)} <span>macro AUROC</span></p>
        <div className="meter" aria-hidden="true">
          <i style={{ width: `${Math.max(1, pct)}%` }} />
          <b className="meter__chance">chance 0.5</b>
        </div>
        <p className="demo__text">{s.text}</p>
        <p className="demo__fine">Development cross-validation numbers, not the locked test set.</p>
      </div>
    </div>
  )
}

/* ---------- 2. Paper condition (robustness) ---------- */
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

function drawForm(canvas, form) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = (canvas.width = Math.max(300, Math.round(canvas.clientWidth * dpr)))
  const H = (canvas.height = Math.round(W / 2))
  const ctx = canvas.getContext('2d')
  const base = document.createElement('canvas')
  base.width = W; base.height = H
  drawEcgPaper(base.getContext('2d'), W, H, { minPx: 0.7 * dpr, header: false })
  const r = rng(7)
  const photo = form.startsWith('Phone')

  ctx.save()
  if (form === 'Photo of a monitor') {
    ctx.fillStyle = '#0E1116'; ctx.fillRect(0, 0, W, H)
    ctx.filter = 'brightness(1.08) saturate(0.8) hue-rotate(-8deg)'
    ctx.drawImage(base, W * 0.06, H * 0.07, W * 0.88, H * 0.86)
    ctx.filter = 'none'
    ctx.fillStyle = 'rgba(0,0,0,0.13)'
    for (let y = 0; y < H; y += 3 * dpr) ctx.fillRect(0, y, W, dpr)
    ctx.fillStyle = 'rgba(80,140,255,0.06)'; ctx.fillRect(0, 0, W, H)
  } else if (photo) {
    ctx.fillStyle = '#B9B2A6'; ctx.fillRect(0, 0, W, H)
    ctx.setTransform(0.9, 0.02, -0.04, 0.88, W * 0.07, H * 0.05) // slight tilt, like a hand-held photo
    ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 12 * dpr
    ctx.drawImage(base, 0, 0)
    ctx.shadowBlur = 0
    if (form.includes('crumpled')) {
      for (let k = 0; k < 14; k++) {
        const x1 = r() * W, y1 = r() * H, x2 = r() * W, y2 = r() * H
        const g = ctx.createLinearGradient(x1, y1, x1 + (y2 - y1) * 0.05, y1 - (x2 - x1) * 0.05)
        g.addColorStop(0, 'rgba(0,0,0,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0.18)')
        ctx.strokeStyle = g; ctx.lineWidth = (2 + r() * 5) * dpr
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + (r() - 0.5) * 60, (y1 + y2) / 2 + (r() - 0.5) * 60); ctx.lineTo(x2, y2); ctx.stroke()
      }
    }
    if (form.includes('stained')) {
      ;[[0.72, 0.3, 0.16], [0.25, 0.7, 0.11], [0.55, 0.82, 0.07]].forEach(([cx, cy, rr]) => {
        const g = ctx.createRadialGradient(cx * W, cy * H, 0, cx * W, cy * H, rr * W)
        g.addColorStop(0, 'rgba(150,95,40,0.10)'); g.addColorStop(0.82, 'rgba(150,95,40,0.20)'); g.addColorStop(1, 'rgba(150,95,40,0)')
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      })
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const v = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.7)
    v.addColorStop(0, 'rgba(255,220,170,0.05)'); v.addColorStop(1, 'rgba(0,0,0,0.22)')
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H)
  } else {
    if (form === 'B&W scan') ctx.filter = 'grayscale(1) contrast(1.15)'
    ctx.drawImage(base, 0, 0)
    ctx.filter = 'none'
    if (form.includes('scan')) {
      ctx.fillStyle = form === 'Colour scan' ? 'rgba(255,236,190,0.10)' : 'rgba(0,0,0,0.03)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      for (let k = 0; k < 900; k++) ctx.fillRect(r() * W, r() * H, dpr, dpr)
    }
  }
  ctx.restore()
}

export function Robustness() {
  const [form, setForm] = useState(robustForms[0])
  const ref = useRef(null)
  const near = useNear(ref)
  useEffect(() => { if (near) drawForm(ref.current, form) }, [form, near])
  const x = (v) => ((v - 0.8) / 0.1) * 100

  return (
    <div className="demo">
      <div className="demo__visual">
        <canvas ref={ref} className="demo__canvas" role="img" aria-label={`Synthetic ECG shown as: ${form}`} />
      </div>
      <div className="demo__panel">
        <Segmented label="Physical form of the same ECG" value={form} onChange={setForm} options={robustForms.map((f) => [f, f])} />
        <div className="range" aria-label="AUROC range across physical forms">
          <div className="range__axis">
            <span style={{ left: '0%' }}>0.80</span><span style={{ left: '50%' }}>0.85</span><span style={{ left: '100%' }}>0.90</span>
          </div>
          <div className="range__track">
            <i className="range__band range__band--ext" style={{ left: `${x(0.83)}%`, width: `${x(0.89) - x(0.83)}%` }} />
            <i className="range__band" style={{ left: `${x(0.826)}%`, width: `${x(0.844) - x(0.826)}%` }} />
          </div>
          <ul className="range__key">
            <li><i className="key key--forms" /> Same 977 ECGs in nine physical forms: <strong>0.826–0.844</strong></li>
            <li><i className="key key--ext" /> Three external image sets (Germany, China, USA): 0.83–0.89</li>
          </ul>
        </div>
        <p className="demo__text">
          The model was never retrained on these images. Crumpling, stains and scanning barely matter: every change
          stays within ±0.021.
        </p>
        <p className="demo__fine">Pictures are a synthetic simulation of each form. The brief gives the range, not a per-form score, so none is shown.</p>
      </div>
    </div>
  )
}

/* ---------- 3. Lead explorer ---------- */
export function LeadExplorer() {
  const [finding, setFinding] = useState('RBBB')
  const [focus, setFocus] = useState(null)
  const ref = useRef(null)
  const f = leadFindings[finding]
  const near = useNear(ref)
  useEffect(() => { if (near) paintCanvas(ref.current, { rbbb: !!f.rbbb, header: false }) }, [finding, near])
  const level = (lead) => (f.strong.includes(lead) ? 'strong' : f.medium.includes(lead) ? 'medium' : 'none')

  return (
    <div className="demo demo--leads">
      <div className="demo__visual">
        <div className="leads">
          <canvas ref={ref} className="demo__canvas" role="img" aria-label="Synthetic 12-lead ECG with lead boxes" />
          {LEAD_BOXES.map((b) => {
            const lv = level(b.lead)
            return (
              <button
                key={b.lead} type="button"
                className={`lead lead--${lv}`}
                style={{ left: `${b.left * 100}%`, top: `${b.top * 100}%`, width: `${b.width * 100}%`, height: `${b.height * 100}%` }}
                onMouseEnter={() => setFocus(b.lead)} onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(b.lead)} onBlur={() => setFocus(null)}
                aria-label={`${b.lead}: ${lv === 'none' ? 'not a key lead' : lv + ' importance'} for ${f.label}`}
              >
                <span>{b.lead}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="demo__panel">
        <Segmented label="Finding" value={finding} onChange={setFinding} options={Object.entries(leadFindings).map(([k]) => [k, k])} />
        <h3 className="demo__h">{f.label}</h3>
        <p className="demo__text">{f.note}</p>
        <ul className="lead-key">
          <li><i className="key key--strong" /> strongest effect when blanked</li>
          <li><i className="key key--medium" /> clear effect</li>
        </ul>
        <p className="demo__text demo__focus" aria-live="polite">
          {focus ? `${focus}: ${level(focus) === 'none' ? 'blanking it changes little for this finding.' : `a ${level(focus)} lead for ${f.label.toLowerCase()}.`}` : 'Hover or tab through the lead boxes.'}
        </p>
        <p className="demo__fine">
          Method: blank out one lead box and measure the change. These match the clinically expected territories.
          Caveat: aVR sits next to V1 on the print, so part of its effect may be alignment.
        </p>
      </div>
    </div>
  )
}
