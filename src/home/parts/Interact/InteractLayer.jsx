// One global interaction layer (mount once at app root). Attribute-driven:
// data-caliper="label"  caliper cursor brackets around the element (fine pointer only)
// data-magnetic         element drifts up to 6 px toward the pointer
// data-tilt             3D tilt (max 5 deg) + moving glare
// data-reveal="crumpled|stained|scanned|monitor|photo"  hover/focus card with a mini ECG in that form
// data-scramble         digits re-type once on entering the viewport
// Idea credits: React Bits TargetCursor, Codrops InlineHoverReveals (independent implementations).
import { useEffect, useRef } from 'react'
import './Interact.css'

const FORMS = {
  crumpled: 'crumpled paper',
  stained: 'stained paper',
  scanned: 'paper, flatbed scan',
  monitor: 'a monitor, photographed',
  photo: 'paper, phone photo',
}

// synthetic beat train for the mini sheet (not patient data)
let TRACE = 'M0,58'
for (let x = 4; x < 160; x += 38)
  TRACE += ` L${x},58 L${x + 4},55 L${x + 8},58 L${x + 11},61 L${x + 13},30 L${x + 15},66 L${x + 17},58 L${x + 24},58 L${x + 28},52 L${x + 32},58`

const RING = 'a,button,input,select,textarea,summary,label,[role="button"],[data-magnetic]'

// Helper: <Reveal form="stained">stained</Reveal> renders the accessible span on the server.
export function Reveal({ form, children }) {
  return (
    <span data-reveal={form} tabIndex={0} aria-describedby={'ix-d-' + form}>
      {children}
    </span>
  )
}

export default function InteractLayer() {
  const ref = useRef(null)
  useEffect(() => setup(ref.current), [])
  return (
    <div ref={ref} className="ix">
      <div className="ix-dot" aria-hidden="true" />
      <div className="ix-cal" aria-hidden="true">
        <i className="ix-cl" />
        <i className="ix-cr" />
        <b className="ix-lab" />
      </div>
      <div className="ix-card" aria-hidden="true">
        <div className="ix-paper">
          <svg viewBox="0 0 160 100" width="160" height="100">
            <path d={TRACE} />
          </svg>
        </div>
        <span className="ix-cap" />
      </div>
      <svg className="ix-defs" width="0" height="0" aria-hidden="true">
        <filter id="ix-crumple">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
        </filter>
      </svg>
      {Object.keys(FORMS).map((k) => (
        <span key={k} id={'ix-d-' + k} className="ix-sr">
          {'Synthetic ECG on ' + FORMS[k]}
        </span>
      ))}
    </div>
  )
}

function setup(root) {
  if (!root) return
  const mq = (q) => matchMedia(q).matches
  const fx = mq('(hover: hover) and (pointer: fine)') && !mq('(prefers-reduced-motion: reduce)')
  const q = (s) => root.querySelector(s)
  const dot = q('.ix-dot'), cal = q('.ix-cal'), lab = q('.ix-lab'), card = q('.ix-card'), cap = q('.ix-cap')
  const D = document, html = D.documentElement
  const tg = (el, c, v) => el.classList.toggle(c, v)
  const on = (t, e, f, o) => (t.addEventListener(e, f, o), () => t.removeEventListener(e, f, o))
  const offs = [], P = { passive: true }
  const clamp = (v, m) => Math.max(-m, Math.min(m, v))

  // ---- springs: one loop steps everything, stops when settled ----
  const springs = new Map()
  const sp = (key, n, f, k = 0.2, d = 0.7) => {
    let s = springs.get(key)
    if (!s) springs.set(key, (s = { c: Array(n).fill(0), t: Array(n).fill(0), v: Array(n).fill(0), f, k, d }))
    s.done = false
    return s
  }
  const rest = (s) => { if (s) { s.t.fill(0); s.done = true } }
  let raf = 0, px = -99, py = -99, tgt = null, dirty = false, seen = false
  let mag = null, tilt = null, moveFx, outFx, update
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
  function frame() {
    raf = 0
    if (dirty) { dirty = false; update() }
    let moving = false
    for (const [key, s] of springs) {
      let m = false
      for (let i = 0; i < s.c.length; i++) {
        const dd = s.t[i] - s.c[i]
        s.v[i] = (s.v[i] + dd * s.k) * s.d
        s.c[i] += s.v[i]
        if (Math.abs(dd) > 0.05 || Math.abs(s.v[i]) > 0.05) m = true
        else { s.c[i] = s.t[i]; s.v[i] = 0 }
      }
      s.f(s.c, !m && s.done)
      if (m) moving = true
      else if (s.done) springs.delete(key)
    }
    if (moving) kick()
  }

  // ---- cursor, calipers, magnetic, tilt (fine pointer, motion allowed) ----
  if (fx) {
    tg(html, 'ix-fx', true)
    const ds = sp('dot', 2, (c) => (dot.style.transform = `translate(${c[0]}px,${c[1]}px)`), 0.28, 0.62)
    const cs = sp('cal', 4, (c) => {
      cal.style.transform = `translate(${c[0]}px,${c[1]}px)`
      cal.style.width = c[2] + 'px'
      cal.style.height = c[3] + 'px'
    }, 0.22, 0.66)
    update = () => {
      ds.t[0] = px; ds.t[1] = py
      const c = tgt && tgt.closest('[data-caliper]')
      tg(dot, 'ix-ring', !!(tgt && tgt.closest(RING)))
      tg(dot, 'ix-in', !!c)
      if (c) {
        const r = c.getBoundingClientRect()
        cs.t = [r.left - 6, r.top - 6, r.width + 12, r.height + 12]
        lab.textContent = c.dataset.caliper || 'fig'
      } else cs.t = [px - 14, py - 14, 28, 28]
      tg(cal, 'ix-show', !!c)

      const m = tgt && tgt.closest('[data-magnetic]')
      if (m !== mag) { rest(springs.get(mag)); mag = m }
      if (m) {
        const s = sp(m, 2, (c, end) => (m.style.translate = end ? '' : `${c[0]}px ${c[1]}px`), 0.16, 0.7)
        const r = m.getBoundingClientRect()
        s.t = [clamp((px - r.left - r.width / 2 + s.c[0]) * 0.3, 6), clamp((py - r.top - r.height / 2 + s.c[1]) * 0.3, 6)]
      }

      const t = tgt && tgt.closest('[data-tilt]')
      if (t !== tilt) { rest(springs.get(tilt)); tilt = t }
      if (t) {
        const s = sp(t, 5, (c, end) =>
          ['rx', 'ry', 'gx', 'gy', 'go'].forEach((p, i) =>
            end ? t.style.removeProperty('--ix-' + p) : t.style.setProperty('--ix-' + p, i > 3 ? c[i] / 100 : c[i] + (i < 2 ? 'deg' : '%'))), 0.14, 0.72)
        const r = t.getBoundingClientRect()
        const x = (px - r.left) / r.width, y = (py - r.top) / r.height
        s.t = [(0.5 - y) * 10, (x - 0.5) * 10, x * 100, y * 100, 100]
      }
    }
    moveFx = (e) => {
      if (e.pointerType !== 'mouse') return
      px = e.clientX; py = e.clientY; tgt = e.target
      if (!seen) { seen = true; ds.c = [px, py]; cs.c = [px - 14, py - 14, 28, 28]; tg(dot, 'ix-show', true) }
      dirty = true; kick()
    }
    outFx = () => { tg(dot, 'ix-show', false); tg(cal, 'ix-show', false); seen = false; tgt = null; dirty = true; kick() }
    offs.push(on(window, 'scroll', () => { if (tgt) { tgt = D.elementFromPoint(px, py); dirty = true; kick() } }, P))
  }

  // ---- inline hover reveal (all devices; keyboard focus too) ----
  let rev = null
  const place = (x, y) => {
    let l = x + 16, t = y + 20
    if (l + 172 > innerWidth - 8) l = Math.max(8, x - 176)
    if (t + 112 > innerHeight - 8) t = Math.max(8, y - 120)
    card.style.transform = `translate(${l}px,${t}px)`
  }
  const show = (el, x, y) => {
    const f = el.dataset.reveal
    if (!FORMS[f]) return
    rev = el
    cap.textContent = f
    place(x, y)
    card.className = 'ix-card ix-show ix-f-' + f
  }
  const hide = () => { rev = null; tg(card, 'ix-show', false) }
  offs.push(
    on(D, 'pointerover', (e) => {
      const el = e.target.closest?.('[data-reveal]')
      if (el && el !== rev) show(el, e.clientX, e.clientY)
    }),
    on(D, 'pointerout', (e) => {
      const to = e.relatedTarget
      if (!to && outFx) outFx()
      if (rev && !(to && rev.contains(to)) && D.activeElement !== rev) hide()
    }),
    // the one pointermove listener
    on(D, 'pointermove', (e) => {
      if (moveFx) moveFx(e)
      if (rev && D.activeElement !== rev) place(e.clientX, e.clientY)
    }, P),
    on(D, 'focusin', (e) => {
      const el = e.target.closest?.('[data-reveal]')
      if (el) { const r = el.getBoundingClientRect(); show(el, r.left, r.bottom - 12) }
    }),
    on(D, 'focusout', (e) => { if (e.target === rev) hide() }),
    on(D, 'keydown', (e) => { if (e.key === 'Escape') hide() }),
  )

  // ---- scramble-in numbers + patch raw reveal spans ----
  const done = new WeakSet()
  const scramble = (el) => {
    const w = D.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = []
    while (w.nextNode()) nodes.push(w.currentNode)
    const orig = nodes.map((n) => n.data), len = orig.join('').length || 1
    // 14 fixed steps of 45 ms: always ends on the original text, even if timers are throttled
    const tick = (s) => {
      let k = 0
      nodes.forEach((n, i) => {
        n.data = orig[i].replace(/./g, (ch) => (k++ / len >= s / 14 && /\d/.test(ch) ? (Math.random() * 10) | 0 : ch))
      })
      if (s < 14) setTimeout(tick, 45, s + 1)
    }
    tick(1)
  }
  const io = !mq('(prefers-reduced-motion: reduce)') && 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { io.unobserve(e.target); scramble(e.target) }
      }), { threshold: 0.6 })
    : null
  const scan = () => {
    D.querySelectorAll('[data-reveal]').forEach((el) => {
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0
      if (!el.hasAttribute('aria-describedby') && FORMS[el.dataset.reveal]) el.setAttribute('aria-describedby', 'ix-d-' + el.dataset.reveal)
    })
    if (io) D.querySelectorAll('[data-scramble]').forEach((el) => { if (!done.has(el)) { done.add(el); io.observe(el) } })
  }
  scan()
  let pend = 0
  const mo = new MutationObserver(() => { if (!pend) pend = requestAnimationFrame(() => { pend = 0; scan() }) })
  mo.observe(D.body, { childList: true, subtree: true })

  return () => {
    offs.forEach((f) => f())
    mo.disconnect(); io && io.disconnect()
    cancelAnimationFrame(raf); cancelAnimationFrame(pend)
    tg(html, 'ix-fx', false)
  }
}
