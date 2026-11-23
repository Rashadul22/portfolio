import { useEffect, useRef, useState } from 'react'
import { exampleReport } from './data.js'

// Report typewriter + referral gate. The case and its confidence are illustrative (synthetic, not a patient).
const CASES = {
  confident: { label: 'Clear case', conf: 0.86 },
  uncertain: { label: 'Uncertain case', conf: 0.41 },
}
const GATE = 0.6 // illustrative: in the study the most uncertain 20% are referred

export default function Report() {
  const [kase, setKase] = useState('confident')
  const [shown, setShown] = useState(0) // characters typed
  const [started, setStarted] = useState(false)
  const box = useRef(null)
  const c = CASES[kase]
  const refer = c.conf < GATE
  const lines = refer ? [] : exampleReport
  const full = lines.map(([k, v]) => `${k}: ${v}`).join('\n')

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.4 })
    io.observe(box.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(full.length); return }
    setShown(0)
    let i = 0
    const id = setInterval(() => { i += 2; setShown(i); if (i >= full.length) clearInterval(id) }, 22)
    return () => clearInterval(id)
  }, [started, kase])

  const typed = full.slice(0, shown)

  return (
    <div className="demo demo--report" ref={box}>
      <div className="report" aria-live="polite">
        <div className="report__head">
          <span>Generated report</span>
          <span className="report__tag">synthetic example</span>
        </div>
        {refer ? (
          <div className="report__refer">
            <strong>Refer to a cardiologist</strong>
            <p>Confidence is below the gate, so no report is written. Referring the most uncertain 20% cut disagreement
              with the cardiologist from 0.330 to 0.240 among the reports that were written.</p>
          </div>
        ) : (
          <pre className="report__body">
            {typed.split('\n').map((ln, i) => {
              const [k, ...rest] = ln.split(': ')
              return <span key={i} className="report__line"><b>{k}{rest.length ? ':' : ''}</b>{rest.length ? ' ' + rest.join(': ') : ''}{'\n'}</span>
            })}
            {shown < full.length && <span className="caret" aria-hidden="true" />}
          </pre>
        )}
        <div className="report__conf">
          <span>Confidence</span>
          <div className="conf"><i style={{ width: `${c.conf * 100}%` }} className={refer ? 'is-low' : ''} /><b style={{ left: `${GATE * 100}%` }} title="referral gate" /></div>
          <span className="report__verdict">{refer ? 'refer' : 'report'}</span>
        </div>
      </div>
      <div className="demo__panel">
        <div className="seg" role="radiogroup" aria-label="Example case">
          {Object.entries(CASES).map(([k, v]) => (
            <button key={k} type="button" role="radio" aria-checked={kase === k} className={kase === k ? 'is-on' : ''} onClick={() => setKase(k)}>{v.label}</button>
          ))}
        </div>
        <h3 className="demo__h">Four lines, cardiologist style</h3>
        <p className="demo__text">
          Rate, Findings, Impression and Advice, plus measurements and a confidence line. The chosen system (R3) is
          classifier-gated: the report can never contradict the classifier, by construction.
        </p>
        <p className="demo__fine">Example layout and confidence values are illustrative, not a patient. Paper 2 numbers are development cross-validation (n = 949); the internal test is not run yet.</p>
      </div>
    </div>
  )
}
