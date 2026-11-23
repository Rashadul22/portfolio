import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { drawEcgPaper } from './ecg.js'
import { DotChart, BarChart } from './Charts.jsx'
import Pipeline from './Pipeline.jsx'
import Report from './Report.jsx'
import { ShortcutTest, Robustness, LeadExplorer } from './Interactives.jsx'
import {
  testSet, dataFacts, labels, audit, pretraining, directVsDigitise, reportSystems, reportFacts, negatives, next, skills,
} from './data.js'

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
    if (reduce || !webgl) return
    // start 3D when the browser is idle, so text and controls respond first
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 600))
    const id = idle(() => setMode('3d'), { timeout: 2500 })
    return () => (window.cancelIdleCallback || clearTimeout)(id)
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

function Sec({ id, kicker, title, children, lead }) {
  return (
    <section className="t-sec" id={id} aria-labelledby={`${id}-title`}>
      <p className="t-kicker">{kicker}</p>
      <h2 id={`${id}-title`} className="t-h2">{title}</h2>
      {lead && <p className="t-lead">{lead}</p>}
      {children}
    </section>
  )
}

const toc = [
  ['problem', 'Problem'], ['data', 'Data'], ['results', 'Results'], ['checks', 'Checks'],
  ['report', 'Paper 2'], ['next', 'Next'],
]

export default function ThesisApp() {
  return (
    <>
      <a className="skip" href="#t-main">Skip to content</a>
      <nav className="t-nav" aria-label="Site">
        <a href="../">← Md Rashadul Islam</a>
        <ul className="t-toc">
          {toc.map(([id, l]) => <li key={id}><a href={`#${id}`}>{l}</a></li>)}
        </ul>
      </nav>
      <main id="t-main">
        <Hero />

        <Sec id="problem" kicker="The problem" title="Most ECG AI needs a signal. Here, there is only paper.">
          <div className="t-cols3">
            <div><h3>No digital signal</h3><p>Paper printouts keep no signal, and most ECG models need one.</p></div>
            <div><h3>Messy photos</h3><p>Phone, light, tilt, curl, shadows and handwriting on the page all vary.</p></div>
            <div><h3>Few clinic photos</h3><p>Existing image datasets are mostly scans or renders; few are phone photos from real South-Asian clinics.</p></div>
          </div>
          <p className="t-claim">The contribution is <strong>the dataset and the evaluation protocol</strong>, not a fancy model. The model is plain on purpose, so the results measure the data and the protocol.</p>
        </Sec>

        <Sec id="data" kicker="Paper 1 · The data" title="1,191 photos, labelled from the cardiologist’s own remark">
          <dl className="t-facts">
            {dataFacts.map(([n, l]) => <div key={l}><dt>{n}</dt><dd>{l}</dd></div>)}
          </dl>
          <div className="t-cols2">
            <div>
              <h3 className="t-h3">Five labels (multi-label)</h3>
              <ul className="t-chips">{labels.map((l) => <li key={l}>{l}</li>)}</ul>
              <p className="t-p">Each handwritten remark was mapped to classes with a published vocabulary (AHA/ACCF/HRS 2007 statements, PTB-XL codes); rate abnormality comes from the printed heart rate (&lt;60 or &gt;100). The split was frozen before training: 949 development records (5-fold cross-validation by patient) and 240 test records, opened exactly once and enforced by code.</p>
            </div>
            <div>
              <h3 className="t-h3">What careful data work found</h3>
              <ol className="t-audit">{audit.map(([k, v]) => <li key={k}><strong>{k}.</strong> {v}</li>)}</ol>
            </div>
          </div>
        </Sec>

        <Pipeline />

        <Sec id="results" kicker="Paper 1 · Results" title="How well does it read the photo?">
          <DotChart
            title="Locked test set, AUROC per label (n = 240, opened once)"
            rows={testSet} domain={[0.5, 1]} ticks={[0.5, 0.6, 0.7, 0.8, 0.9, 1]} chance={0.5}
            foot="Primary endpoint = macro AUROC over Normal, Ischaemia, Arrhythmia/block and Rate. Development cross-validation of the same model: 0.892 (0.875–0.909). Honest weak spots: Arrhythmia/block sensitivity 0.42; “Other” is hard."
          />
        </Sec>

        <Sec id="checks" kicker="Paper 1 · Checks" title="Does it read the ECG, or a shortcut?"
          lead="Toggle what the model sees. If it were reading the paper, the grid or the handwriting, erasing the trace would not hurt.">
          <ShortcutTest />
          <ul className="t-list">
            <li><strong>0.851</strong> when one whole capture session is left out: it works on unseen sessions.</li>
            <li><strong>Caveat:</strong> phones and sessions are 98% identifiable from the image, and Honor photos score lower than iPhone photos (0.877 vs 0.931 in a later model).</li>
            <li><strong>0.645 vs 0.643</strong> macro-F1: the machine’s printed interpretation and our model are level on 200 records. The cardiologist saw the machine statement, which favours the machine.</li>
          </ul>
          <h3 className="t-h3 t-h3--gap">Same ECG, different paper</h3>
          <Robustness />
        </Sec>

        <Sec id="negatives" kicker="Pre-registered" title="What did not work" lead="Negative results, reported as planned.">
          <ul className="t-neg">{negatives.map(([k, v]) => <li key={k}><h3>{k}</h3><p>{v}</p></li>)}</ul>
        </Sec>

        <Sec id="report" kicker="Paper 2 · In progress" title="From a photo to a written report"
          lead="Idea of the co-supervisor, Dr Mohammad Ali Moni (Charles Sturt University). All numbers are development cross-validation (n = 949); the internal test is not run yet.">
          <Report />
          <div className="t-chartgrid">
            <DotChart title="Pre-training: macro AUROC by starting point" rows={pretraining} domain={[0.88, 0.93]} ticks={[0.88, 0.89, 0.9, 0.91, 0.92, 0.93]}
              foot="Every pre-trained seed beats every ImageNet seed. What transfers is “ECG-like paper”, not the exact layout (pre-registered control; seeds 1–2 still running)." />
            <DotChart title="Read the photo directly, or digitise it to a signal first?" rows={directVsDigitise} domain={[0.84, 0.93]} ticks={[0.84, 0.87, 0.9, 0.93]}
              foot="Direct reading wins by +0.062 (CI +0.044 to +0.082). Digitising loses Arrhythmia/block (−0.128) and Ischaemia (−0.080) detail." />
            <BarChart title="Report quality: impression macro-F1" rows={reportSystems} valueName="Macro-F1"
              foot="A large public ECG vision-language model with no training calls almost everything abnormal; a small fine-tuned one does worse than the classifier-based design." />
          </div>
          <dl className="t-facts t-facts--4">
            {reportFacts.map(([n, l]) => <div key={l}><dt>{n}</dt><dd>{l}</dd></div>)}
          </dl>
          <h3 className="t-h3 t-h3--gap">Which leads does the model look at?</h3>
          <LeadExplorer />
        </Sec>

        <Sec id="next" kicker="Where this goes" title="Next steps">
          <ul className="t-next">{next.map(([k, v]) => <li key={k}><h3>{k}</h3><p>{v}</p></li>)}</ul>
        </Sec>

        <Sec id="credits" kicker="Credits" title="People and skills">
          <div className="t-cols2">
            <dl className="t-credits">
              <div><dt>Student</dt><dd>Md Rashadul Islam</dd></div>
              <div><dt>Supervisor</dt><dd>Dr. Md. Ali Hossain, NanoBio Technology Center, DIU</dd></div>
              <div><dt>Co-supervisor / collaborator</dt><dd>Dr Mohammad Ali Moni, Charles Sturt University</dd></div>
              <div><dt>Hospital</dt><dd>Enam Medical College Hospital, Bangladesh</dd></div>
            </dl>
            <div>
              <h3 className="t-h3">What this project shows</h3>
              <ul className="t-chips">{skills.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </div>
          <p className="t-note">Numbers are from the manuscript draft and may change in peer review. All ECG images on this page are synthetic.</p>
        </Sec>
      </main>
      <footer className="t-foot">
        <a href="../">← Back to portfolio</a>
        <span>© 2026 Md Rashadul Islam</span>
      </footer>
    </>
  )
}
