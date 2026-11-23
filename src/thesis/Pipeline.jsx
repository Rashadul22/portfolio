import { useEffect, useRef, useState } from 'react'
import { drawEcgPaper, whenNear } from './ecg.js'
import { pipeline, exampleOutputs } from './data.js'

// "Anatomy of a paper ECG": an exploded isometric stack (CSS 3D, no WebGL) that builds up as the reader scrolls.
function usePaperImages(ref) {
  const [img, setImg] = useState({ paper: null, masked: null })
  useEffect(() => whenNear(ref.current, () => {
    const make = (opts) => {
      const c = document.createElement('canvas')
      c.width = 640; c.height = 320 // plates are at most ~300 px wide on screen
      drawEcgPaper(c.getContext('2d'), c.width, c.height, { minPx: 0.8, ...opts })
      return c.toDataURL('image/webp', 0.85)
    }
    setImg({ paper: make({}), masked: make({ mask: true }) })
  }), [])
  return img
}

function Plate({ i, active, children, className = '' }) {
  const state = i < active ? 'below' : i === active ? 'on' : 'off'
  return (
    <div className={`plate plate--${state} ${className}`} style={{ '--i': i }} aria-hidden="true">
      {children}
    </div>
  )
}

const THRESH = 0.5 // illustrative threshold line for the example

export default function Pipeline() {
  const [active, setActive] = useState(0)
  const steps = useRef([])
  const stage = useRef(null)
  const img = usePaperImages(stage)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)) }),
      // phones: the pinned stage covers the top half, so a step counts as active in the lower part of the screen
      { rootMargin: window.innerWidth < 860 ? '-62% 0px -22% 0px' : '-45% 0px -45% 0px' },
    )
    steps.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const bg = (src) => (src ? { backgroundImage: `url(${src})` } : undefined)

  return (
    <section className="t-sec pipe" aria-labelledby="pipe-title">
      <p className="t-kicker">How it works</p>
      <h2 id="pipe-title" className="t-h2">Anatomy of a reading</h2>

      <div className="pipe__grid">
        <div className="pipe__stage" ref={stage}>
          <div className="pipe__label" aria-live="polite">
            <span>{String(active + 1).padStart(2, '0')}</span> {pipeline[active].k}
          </div>
          <div className="stack">
            <Plate i={0} active={active} className="plate--paper"><div className="plate__img" style={bg(img.paper)} /></Plate>
            <Plate i={1} active={active} className="plate--photo"><div className="plate__img" style={bg(img.paper)} /><div className="photo-tint" /></Plate>
            <Plate i={2} active={active}><div className="plate__img" style={bg(img.masked)} /></Plate>
            <Plate i={3} active={active} className="plate--px"><div className="plate__img" style={bg(img.masked)} /><div className="px-grid" /><span className="plate__dim">448 × 1024</span></Plate>
            <Plate i={4} active={active} className="plate--net">
              {['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'].map((s, k) => (
                <div key={s} className="net-block" style={{ '--k': k }}><span>{s}</span></div>
              ))}
            </Plate>
            <Plate i={5} active={active} className="plate--out">
              {exampleOutputs.map(([l, v]) => (
                <div key={l} className="out-row"><span>{l}</span><i style={{ width: `${v * 100}%` }} /></div>
              ))}
            </Plate>
            <Plate i={6} active={active} className="plate--out plate--th">
              {exampleOutputs.map(([l, v]) => (
                <div key={l} className={`out-row${v >= THRESH ? ' is-pos' : ''}`}>
                  <span>{l}</span><i style={{ width: `${v * 100}%` }} /><b style={{ left: `${THRESH * 100}%` }} />
                  <em>{v >= THRESH ? 'yes' : 'no'}</em>
                </div>
              ))}
            </Plate>
          </div>
          <p className="pipe__caption">Synthetic example; output values are illustrative, not a patient.</p>
        </div>

        <ol className="pipe__steps">
          {pipeline.map((s, i) => (
            <li key={s.k} ref={(el) => (steps.current[i] = el)} data-i={i} className={i === active ? 'is-on' : ''}>
              <span className="pipe__n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
