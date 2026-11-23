import { useEffect, useRef, useState } from 'react'

// Tools as physical bubbles: they drop in when the section appears; drag and throw them. Tiny custom physics
// (circles, gravity, walls, pairwise collisions) - no library. Reduced motion: a plain static cluster.
const TOOLS = [
  ['PyTorch', 3], ['Python', 3], ['XGBoost', 2], ['ConvNeXt', 2], ['SHAP', 2], ['Grad-CAM', 2], ['scikit-learn', 2],
  ['Transformers', 2], ['OpenCV', 1], ['CatBoost', 1], ['timm', 1], ['LoRA', 1], ['MIMIC-IV', 2], ['PTB-XL', 1],
  ['NASA OSDR', 2], ['Vertex AI', 1], ['SQL', 1], ['C++', 1], ['LaTeX', 1], ['Git', 1],
]

export default function SkillBubbles() {
  const box = useRef(null)
  const els = useRef([])
  const [mode, setMode] = useState('static')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setMode('physics')
  }, [])

  useEffect(() => {
    if (mode !== 'physics') return
    const el = box.current
    let W = el.clientWidth, H = el.clientHeight
    // size bubbles so together they fill ~45% of the box, on any screen
    const base = TOOLS.map(([, w]) => 20 + w * 10)
    const area = base.reduce((s, r) => s + Math.PI * r * r, 0)
    const k = Math.min(1.6, Math.sqrt((0.38 * W * H) / area))
    const B = TOOLS.map((_, i) => {
      const r = base[i] * k
      return { x: r + ((i * 97) % Math.max(1, W - 2 * r)), y: -60 - i * 45, vx: (Math.random() - 0.5) * 2, vy: 0, r }
    })
    B.forEach((b, i) => { const n = els.current[i]; if (n) { n.style.width = n.style.height = `${b.r * 2}px` } })
    let drag = null, raf, running = false, last = 0

    const step = (t) => {
      const dt = Math.min(2, (t - last) / 16.67 || 1); last = t
      for (const b of B) {
        if (b === drag?.b) continue
        b.vy += 0.45 * dt
        b.vx *= 0.995; b.vy *= 0.995
        b.x += b.vx * dt; b.y += b.vy * dt
        if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -0.35; b.vx *= 0.9 }
        if (b.x < b.r) { b.x = b.r; b.vx *= -0.5 }
        if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -0.5 }
      }
      for (let k = 0; k < 5; k++) {
        for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
          const a = B[i], c = B[j]
          const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = a.r + c.r + 2
          if (d < min) {
            const o = (min - d) / 2, nx = dx / d, ny = dy / d
            const fa = a === drag?.b ? 0 : 1, fc = c === drag?.b ? 0 : 1
            a.x -= nx * o * fa * (fc ? 1 : 2); a.y -= ny * o * fa * (fc ? 1 : 2)
            c.x += nx * o * fc * (fa ? 1 : 2); c.y += ny * o * fc * (fa ? 1 : 2)
            const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny
            if (rv < 0) { const imp = -rv * 0.6; a.vx -= nx * imp * fa; a.vy -= ny * imp * fa; c.vx += nx * imp * fc; c.vy += ny * imp * fc }
          }
        }
      }
      for (const b of B) { // keep inside the walls after collision pushes
        if (b === drag?.b) continue
        b.x = Math.min(W - b.r, Math.max(b.r, b.x)); b.y = Math.min(H - b.r, b.y)
      }
      B.forEach((b, i) => { const n = els.current[i]; if (n) n.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)` })
      raf = requestAnimationFrame(step)
    }

    const start = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(step) } }
    const stop = () => { running = false; cancelAnimationFrame(raf) }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.15 })
    io.observe(el)
    const ro = new ResizeObserver(() => { W = el.clientWidth; H = el.clientHeight })
    ro.observe(el)

    const pos = (e) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
    const down = (e) => {
      const i = els.current.indexOf(e.target.closest('.bubble'))
      if (i < 0) return
      const [x, y] = pos(e)
      drag = { b: B[i], dx: x - B[i].x, dy: y - B[i].y, px: x, py: y }
      e.target.closest('.bubble').setPointerCapture(e.pointerId)
      el.classList.add('is-dragging')
    }
    const move = (e) => {
      if (!drag) return
      const [x, y] = pos(e)
      drag.b.vx = (x - drag.px) * 0.6; drag.b.vy = (y - drag.py) * 0.6
      drag.b.x = x - drag.dx; drag.b.y = y - drag.dy
      drag.px = x; drag.py = y
    }
    const up = () => { drag = null; el.classList.remove('is-dragging') }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      stop(); io.disconnect(); ro.disconnect()
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up)
    }
  }, [mode])

  return (
    <div className={`bubbles bubbles--${mode}`} ref={box}>
      <ul aria-label="Tools I use">
        {TOOLS.map(([name, w], i) => (
          <li key={name} ref={(n) => (els.current[i] = n)} className={`bubble bubble--w${w}`}>{name}</li>
        ))}
      </ul>
      {mode === 'physics' && <p className="bubbles__hint" aria-hidden="true">Drag and throw them</p>}
    </div>
  )
}
