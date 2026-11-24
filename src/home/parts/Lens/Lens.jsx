// Magnifier loupe wrapper. Hover (mouse/pen) or press-and-hold (touch) shows a round lens with a magnified clone.
// Cheap: one CSS transform on the clone, updated via ref in rAF; no canvas, no re-render while moving.
// Note: the clone repeats the children's markup, so avoid id-dependent SVG defs inside (or accept duplicates).
import { useCallback, useEffect, useRef, useState } from 'react'
import './Lens.css'

export default function Lens({ zoom = 2.5, size = 150, children, className = '' }) {
  const wrap = useRef(null)
  const lens = useRef(null)
  const inner = useRef(null)
  const pos = useRef({ x: 0, y: 0, touch: false })
  const raf = useRef(0)
  const hold = useRef(0)
  const start = useRef(null)
  const [on, setOn] = useState(false)
  const onRef = useRef(false)

  const paint = useCallback(() => {
    raf.current = 0
    const w = wrap.current, l = lens.current, c = inner.current
    if (!w || !l || !c) return
    const { x, y, touch } = pos.current
    const lift = touch ? size / 2 + 28 : 0 // above the finger on touch
    l.style.transform = `translate(${x - size / 2}px, ${y - size / 2 - lift}px)`
    c.style.width = `${w.offsetWidth}px`
    c.style.transform = `translate(${size / 2 - x * zoom}px, ${size / 2 - y * zoom}px) scale(${zoom})`
  }, [size, zoom])

  const queue = () => { if (!raf.current) raf.current = requestAnimationFrame(paint) }
  const setPoint = (e) => {
    const r = wrap.current.getBoundingClientRect()
    pos.current.x = e.clientX - r.left
    pos.current.y = e.clientY - r.top
  }
  const show = (v) => { onRef.current = v; setOn(v) }

  const onEnter = (e) => {
    if (e.pointerType === 'touch') return
    pos.current.touch = false
    setPoint(e); show(true)
  }
  const onMove = (e) => {
    if (e.pointerType === 'touch') {
      if (onRef.current) { setPoint(e); queue() }
      else if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) {
        clearTimeout(hold.current); start.current = null // user is scrolling
      }
      return
    }
    setPoint(e); if (!onRef.current) show(true); queue()
  }
  const onLeave = (e) => { if (e.pointerType !== 'touch') show(false) }
  const onDown = (e) => {
    if (e.pointerType !== 'touch') return
    const r = wrap.current.getBoundingClientRect()
    const pt = { x: e.clientX, y: e.clientY }
    start.current = pt
    clearTimeout(hold.current)
    hold.current = setTimeout(() => {
      pos.current.touch = true
      pos.current.x = pt.x - r.left; pos.current.y = pt.y - r.top
      show(true)
    }, 350)
  }
  const onUp = (e) => {
    if (e.pointerType !== 'touch') return
    clearTimeout(hold.current); start.current = null; show(false)
  }

  // paint as soon as the clone exists; block scrolling only while the lens is held open
  useEffect(() => { if (on) paint() }, [on, paint])
  useEffect(() => {
    const w = wrap.current
    const block = (e) => { if (onRef.current && pos.current.touch && e.cancelable) e.preventDefault() }
    w.addEventListener('touchmove', block, { passive: false })
    return () => { w.removeEventListener('touchmove', block); clearTimeout(hold.current); cancelAnimationFrame(raf.current) }
  }, [])

  return (
    <div
      ref={wrap}
      className={`lns-wrap ${on ? 'lns-on' : ''} ${className}`}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onContextMenu={(e) => { if (pos.current.touch) e.preventDefault() }}
    >
      {children}
      {on && (
        <div ref={lens} className="lns-lens" style={{ width: size, height: size }} aria-hidden="true">
          <div ref={inner} className="lns-clone" inert="">{children}</div>
          <span className="lns-cross" />
          <span className="lns-label">{zoom}x</span>
        </div>
      )}
    </div>
  )
}
