import { lazy, Suspense, useEffect, useRef, useState } from 'react'

// 3D stage beside the hero text: an ECG printing out of the roll (HeroPaper, lazy). Pointer tilts the stage,
// scroll pays the paper out, "Photograph it" plays the capture moment: flash, a scan line reads the strip and the
// five labels the model outputs appear (illustration of the output format, not a live prediction).
import { drawStrip } from './ecgStrip.js'
const HeroPaper = lazy(() => import('./HeroPaper.jsx'))
const LABELS = ['Normal', 'Ischaemia', 'Arrhythmia / block', 'Rate', 'Other']

export default function HeroStage() {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  const [prog, setProg] = useState(0.45)
  const [shot, setShot] = useState(0)
  const [poster, setPoster] = useState(null)
  useEffect(() => { setPoster(drawStrip()) }, [])
  useEffect(() => {
    const ok = !!document.createElement('canvas').getContext('webgl2') && !matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ok) return
    // 3D loads on the visitor's first interaction (move, scroll, touch, key): the page itself paints and becomes
    // interactive first, and the ~250 kB 3D bundle never blocks the first load.
    const evs = ['pointermove', 'scroll', 'touchstart', 'keydown', 'wheel']
    const go = () => { evs.forEach((e) => removeEventListener(e, go)); setOn(true) }
    evs.forEach((e) => addEventListener(e, go, { passive: true, once: true }))
    let raf = 0
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setProg(0.45 + Math.min(1, scrollY / 700) * 0.5)) }
    addEventListener('scroll', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); evs.forEach((e) => removeEventListener(e, go)) }
  }, [])
  const tilt = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--hx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`)
    ref.current.style.setProperty('--hy', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`)
  }
  const reset = () => { ref.current?.style.setProperty('--hx', '0deg'); ref.current?.style.setProperty('--hy', '0deg') }
  return (
    <figure className={`hero-stage${shot ? ' shot' : ''}`} ref={ref} onPointerMove={tilt} onPointerLeave={reset} data-caliper="fig · the input">
      <div className="hs-tilt">
        <div className="hs-poster" aria-hidden="true">{poster && <img src={poster} alt="" />}</div>
        {on && <Suspense fallback={null}><div className="hs-canvas"><HeroPaper progress={prog} /></div></Suspense>}
        <span className="hs-flash" key={`f${shot}`} />
        <span className="hs-scan" key={`s${shot}`} />
      </div>
      <div className="hs-out" key={`o${shot}`} aria-live="polite">
        {shot > 0 && LABELS.map((l, i) => <span key={l} style={{ animationDelay: `${0.9 + i * 0.12}s` }}>{l}</span>)}
      </div>
      <figcaption>
        <button type="button" className="hs-btn" data-magnetic onClick={() => setShot((n) => n + 1)}>Photograph it</button>
        <span>Synthetic ECG on 3D paper. Drag the paper; scroll to print more. The five labels show the output format only.</span>
      </figcaption>
    </figure>
  )
}
