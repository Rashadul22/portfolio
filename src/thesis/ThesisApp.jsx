import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { drawEcgPaper } from './ecg.js'
import AurocChart from './AurocChart.jsx'

const PaperScene = lazy(() => import('./PaperScene.jsx'))

function StaticPaper() {
  const ref = useRef(null)
  useEffect(() => {
    // draw at the real on-screen size so thin grid lines stay crisp
    const c = ref.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = Math.round(c.clientWidth * dpr)
    c.height = Math.round(c.width / 2)
    drawEcgPaper(c.getContext('2d'), c.width, c.height, { minPx: 0.7 * dpr })
  }, [])
  return (
    <canvas
      ref={ref}
      className="paper-static"
      role="img"
      aria-label="A synthetic 12-lead paper ECG on pink grid paper, three rows of four leads plus a lead II rhythm strip"
    />
  )
}

function Hero() {
  const [mode, setMode] = useState('static') // static until we know motion is allowed
  const [ready, setReady] = useState(false)
  const [flash, setFlash] = useState(false)
  const [replay, setReplay] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      new URLSearchParams(location.search).has('static') // test hook for the reduced-motion path
    const webgl = !!document.createElement('canvas').getContext('webgl2')
    if (!reduce && webgl) setMode('3d')
  }, [])

  const onFlash = () => { setFlash(true); setTimeout(() => setFlash(false), 260) }

  return (
    <header className="t-hero">
      <div className="t-hero__text">
        <p className="t-kicker">B.Sc. thesis · Daffodil International University · 2026</p>
        <h1 className="t-title">Reading paper ECGs from a phone photo.</h1>
        <p className="t-lede">
          In many hospitals in Bangladesh, 12-lead ECGs are printed on thermal paper and handed to the patient; no
          digital signal is kept. A phone photograph is often the only copy. We built a dataset of{' '}
          <strong>1,191 smartphone photographs of paper ECGs</strong> from Enam Medical College Hospital (1,175
          patients), each labelled from the cardiologist&apos;s own written remark, and a strict evaluation protocol
          around it. A deliberately plain image model reads the photo directly and reaches a macro AUROC of{' '}
          <strong>0.923 (95% CI 0.895–0.946)</strong> on a locked test set opened once.
        </p>
        <ul className="t-status">
          <li><span>Paper 1</span> Manuscript in preparation for IEEE JBHI</li>
          <li><span>Paper 2</span> Photo to written report — in progress</li>
        </ul>
      </div>

      <div className="t-stage">
        {!ready && <StaticPaper />}
        {mode === '3d' && (
          <Suspense fallback={null}>
            <PaperScene replayKey={replay} onFlash={onFlash} onReady={() => setReady(true)} />
          </Suspense>
        )}
        <div className={`t-flash${flash ? ' on' : ''}`} aria-hidden="true" />
        <div className="t-stage__bar">
          <span>Synthetic ECG, drawn in code — no patient data.</span>
          {mode === '3d' && (
            <button type="button" className="t-btn" onClick={() => setReplay((r) => r + 1)}>
              ↻ Take the photo again
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default function ThesisApp() {
  return (
    <>
      <a className="skip" href="#t-main">Skip to content</a>
      <nav className="t-nav" aria-label="Site">
        <a href="../">← Md Rashadul Islam</a>
        <span>Thesis</span>
      </nav>
      <main id="t-main">
        <Hero />
        <section className="t-sec" aria-labelledby="results-title">
          <p className="t-kicker">Results · Paper 1</p>
          <h2 id="results-title" className="t-h2">How well does it read the photo?</h2>
          <AurocChart />
          <p className="t-note">Numbers are from the manuscript draft and may change in peer review.</p>
        </section>
      </main>
    </>
  )
}
