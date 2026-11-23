// Synthetic 12-lead ECG, drawn procedurally. NEVER a traced patient ECG (brief, privacy rules).
// Beat = sum of Gaussians (P, Q, R, S, T) at 75/min; 25 mm/s, 10 mm/mV, 1 mm / 5 mm grid.

export const PAPER = { minor: '#F4C7C3', major: '#E08A84', trace: '#1A1A1A', bg: '#FFF8F6' }

const g = (t, mu, s) => Math.exp(-((t - mu) ** 2) / (2 * s * s))

// Per-lead shape [p, q, r, s, t] amplitudes in mV (roughly normal-ECG morphology)
const LEADS = {
  I: [0.1, -0.05, 0.7, -0.1, 0.25],
  II: [0.15, -0.08, 1.1, -0.15, 0.35],
  III: [0.06, -0.05, 0.5, -0.12, 0.12],
  aVR: [-0.12, 0.05, -0.8, 0.1, -0.28],
  aVL: [0.04, -0.06, 0.35, -0.08, 0.1],
  aVF: [0.1, -0.06, 0.8, -0.13, 0.22],
  V1: [0.08, 0, 0.25, -0.95, 0.12],
  V2: [0.1, 0, 0.45, -1.15, 0.38],
  V3: [0.1, -0.03, 0.8, -0.7, 0.42],
  V4: [0.1, -0.06, 1.35, -0.4, 0.4],
  V5: [0.1, -0.08, 1.2, -0.22, 0.33],
  V6: [0.1, -0.06, 0.95, -0.12, 0.27],
}

/** mV at time t (s) for a lead. opts.rbbb widens QRS and adds rsR' in V1/V2. */
export function ecgValue(lead, t, opts = {}) {
  const [p, q, r, s, tw] = LEADS[lead]
  const rr = 60 / 75
  const ph = (t % rr) / rr // 0..1 within a beat
  const w = opts.rbbb ? 1.6 : 1
  let v =
    p * g(ph, 0.16, 0.025) +
    q * g(ph, 0.3, 0.008 * w) +
    r * g(ph, 0.325, 0.011 * w) +
    s * g(ph, 0.35, 0.011 * w) +
    tw * g(ph, 0.6, 0.045)
  if (opts.rbbb && (lead === 'V1' || lead === 'V2')) v += 0.75 * g(ph, 0.385, 0.014) // R'
  if (opts.rbbb && (lead === 'I' || lead === 'V6')) v -= 0.25 * g(ph, 0.39, 0.02) // slurred S
  return v
}

// Classic 3 x 4 layout + lead II rhythm strip
export const LAYOUT = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
]

/**
 * Draw an ECG printout onto a 2D canvas. Paper = 250 x 125 mm (10 s x 4 rows).
 * Returns lead box rectangles in mm (for the lead explorer).
 */
export function drawEcgPaper(ctx, W, H, opts = {}) {
  const mmW = 250, mmH = 125
  const k = Math.min(W / mmW, H / mmH)
  const lw = (mm) => Math.max(mm, (opts.minPx ?? 0) / k) // keep lines visible when drawn small
  ctx.save()
  ctx.fillStyle = PAPER.bg
  ctx.fillRect(0, 0, W, H)
  ctx.scale(k, k)

  const showGrid = opts.grid !== false
  const showTrace = opts.trace !== false
  if (!showGrid) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, mmW, mmH) }

  // grid
  for (let x = 0; showGrid && x <= mmW; x += 1) {
    ctx.strokeStyle = x % 5 === 0 ? PAPER.major : PAPER.minor
    ctx.lineWidth = lw(x % 5 === 0 ? 0.22 : 0.1)
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mmH); ctx.stroke()
  }
  for (let y = 0; showGrid && y <= mmH; y += 1) {
    ctx.strokeStyle = y % 5 === 0 ? PAPER.major : PAPER.minor
    ctx.lineWidth = lw(y % 5 === 0 ? 0.22 : 0.1)
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mmW, y); ctx.stroke()
  }

  const rowH = 30, top = 18, colW = 62.5
  const boxes = []
  ctx.strokeStyle = PAPER.trace
  ctx.lineWidth = lw(0.32) * (opts.minPx ? 1.6 : 1)
  ctx.lineJoin = 'round'
  ctx.fillStyle = PAPER.trace
  ctx.font = '3.2px Inter, Arial, sans-serif'

  const trace = (lead, x0, y0, seconds, t0) => {
    if (!showTrace) return
    ctx.beginPath()
    const n = Math.round(seconds * 25 * 4) // 0.25 mm steps
    for (let i = 0; i <= n; i++) {
      const t = t0 + (i / n) * seconds
      const x = x0 + (t - t0) * 25
      const y = y0 - ecgValue(lead, t, opts) * 10
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.stroke()
  }

  LAYOUT.forEach((row, ri) => {
    const y0 = top + ri * rowH
    row.forEach((lead, ci) => {
      const x0 = ci * colW
      trace(lead, x0, y0, 2.5, ci * 2.5)
      if (showTrace) ctx.fillText(lead, x0 + 1.5, y0 - 9)
      boxes.push({ lead, x: x0, y: y0 - 14, w: colW, h: rowH - 2 })
      if (ci && showTrace) { ctx.beginPath(); ctx.moveTo(x0, y0 - 3); ctx.lineTo(x0, y0 + 3); ctx.stroke() }
    })
  })
  const yr = top + 3 * rowH
  trace('II', 0, yr, 10, 0)
  if (showTrace) ctx.fillText('II', 1.5, yr - 9)
  boxes.push({ lead: 'II (rhythm)', x: 0, y: yr - 14, w: mmW, h: rowH - 2 })

  // header band (synthetic, no patient data); can be masked like the real pipeline masks printed text
  ctx.font = '3px Inter, Arial, sans-serif'
  if (opts.mask) {
    ctx.fillStyle = '#8A9099'
    ctx.fillRect(0, 1, mmW, 6)
  } else if (opts.header !== false) {
    ctx.fillText('25 mm/s   10 mm/mV   HR 75   Synthetic ECG — not a patient', 2, 5)
  }
  ctx.restore()
  return { boxes, mm: { w: mmW, h: mmH } }
}

// Lead boxes in % of the paper (matches drawEcgPaper geometry), for HTML overlays.
export const LEAD_BOXES = (() => {
  const out = []
  LAYOUT.forEach((row, ri) => row.forEach((lead, ci) => {
    out.push({ lead, left: (ci * 62.5) / 250, top: (18 + ri * 30 - 14) / 125, width: 62.5 / 250, height: 28 / 125 })
  }))
  out.push({ lead: 'II rhythm', left: 0, top: (108 - 14) / 125, width: 1, height: 28 / 125 })
  return out
})()

/** Run `fn` once the element is within ~300px of the viewport (keeps canvas drawing off the load path). */
export function whenNear(el, fn) {
  if (!('IntersectionObserver' in window)) { fn(); return () => {} }
  let done = false
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !done) { done = true; io.disconnect(); fn() }
  }, { rootMargin: '300px 0px' })
  io.observe(el)
  return () => io.disconnect()
}

/** Draw the paper onto a canvas element at its on-screen size (crisp lines). */
export function paintCanvas(canvas, opts = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(300, Math.round(canvas.clientWidth * dpr))
  canvas.height = Math.round(canvas.width / 2)
  const ctx = canvas.getContext('2d')
  drawEcgPaper(ctx, canvas.width, canvas.height, { minPx: 0.7 * dpr, ...opts })
  return ctx
}
