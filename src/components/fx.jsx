import { useEffect, useRef, useState } from 'react'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** Headline whose words rise out of a mask one by one when it scrolls into view (editorial reveal). */
export function SplitTitle({ as: Tag = 'h2', text, className, id }) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={`split ${className || ''}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="split__mask" aria-hidden="true">
            <span className="split__word" style={{ '--d': `${i * 55}ms` }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

/** Counts a number up from zero when it first becomes visible; keeps decimals, commas and suffixes. */
export function CountUp({ value }) {
  const m = /^([^\d]*)([\d,]*\.?\d+)(.*)$/.exec(value)
  const ref = useRef(null)
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (!m || reduced() || !('IntersectionObserver' in window)) return
    const [, pre, num, post] = m
    const target = parseFloat(num.replace(/,/g, ''))
    const dec = (num.split('.')[1] || '').length
    const comma = num.includes(',')
    const fmt = (v) => {
      const s = v.toFixed(dec)
      return pre + (comma ? Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s) + post
    }
    setShown(fmt(0))
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now(), dur = 1400
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur)
        setShown(fmt(target * (1 - Math.pow(1 - k, 3))))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    io.observe(ref.current)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value])
  return <span ref={ref} className="countup">{shown}</span>
}

/** Page-wide pointer effects: 3D tilt + glare on cards, magnetic buttons, cursor ring. Desktop mouse only. */
export function usePointerFx() {
  useEffect(() => {
    if (reduced() || !finePointer()) return
    const root = document.documentElement
    root.classList.add('fx-on')

    // cursor ring
    const ring = document.createElement('div')
    ring.className = 'cursor'
    document.body.appendChild(ring)
    let cx = -100, cy = -100, rx = -100, ry = -100, raf
    const loop = () => {
      rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2
      ring.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onMove = (e) => {
      cx = e.clientX; cy = e.clientY
      const t = e.target instanceof Element ? e.target : null
      ring.classList.toggle('is-link', !!t?.closest('a, button, [role="button"], .bubble'))

      const tilt = t?.closest('[data-tilt]')
      if (tilt) {
        const r = tilt.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
        tilt.style.setProperty('--rx', `${(0.5 - py) * 7}deg`)
        tilt.style.setProperty('--ry', `${(px - 0.5) * 9}deg`)
        tilt.style.setProperty('--mx', `${px * 100}%`)
        tilt.style.setProperty('--my', `${py * 100}%`)
        tilt.classList.add('is-tilting')
      }
      const mag = t?.closest('[data-magnetic]')
      if (mag) {
        const r = mag.getBoundingClientRect()
        mag.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`
      }
    }
    const onOut = (e) => {
      const t = e.target instanceof Element ? e.target : null
      const tilt = t?.closest('[data-tilt]')
      if (tilt && !tilt.contains(e.relatedTarget)) {
        tilt.classList.remove('is-tilting')
        tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg')
      }
      const mag = t?.closest('[data-magnetic]')
      if (mag && !mag.contains(e.relatedTarget)) mag.style.transform = ''
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })
    return () => {
      cancelAnimationFrame(raf); ring.remove(); root.classList.remove('fx-on')
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerout', onOut)
    }
  }, [])
}

/** Inertia smooth scrolling (Lenis), loaded after first paint; off for reduced motion and touch screens. */
export function useSmoothScroll() {
  useEffect(() => {
    if (reduced() || !finePointer()) return
    let lenis, raf, cancelled = false
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({ lerp: 0.1, anchors: true })
      const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
      raf = requestAnimationFrame(loop)
    })
    return () => { cancelled = true; cancelAnimationFrame(raf); lenis?.destroy() }
  }, [])
}
