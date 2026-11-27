import { useEffect, useState } from 'react'
import { person, facts, research, testAuroc } from './data.js'
import SameSignal from './SameSignal.jsx'
import HeroTrace from './HeroTrace.jsx'
import PullCord from './PullCord.jsx'
import HeroStage from './HeroStage.jsx'
import InteractLayer from './parts/Interact/InteractLayer.jsx'
import PaperGrid from './parts/PaperGrid/PaperGrid.jsx'
import TestDots from './TestDots.jsx'
import RocExplorer from './parts/RocExplorer/RocExplorer.jsx'
import ReportCard from './parts/ReportCard/ReportCard.jsx'
import ExternalTests from './parts/MoreResearch/ExternalTests.jsx'
import VlmCard from './parts/MoreResearch/VlmCard.jsx'
import NasaCard from './parts/MoreResearch/NasaCard.jsx'
import Stamp from './parts/Stamp/Stamp.jsx'
import Outputs from './parts/Sections/Outputs.jsx'
import About from './parts/Sections/About.jsx'
import Credentials from './parts/Sections/Credentials.jsx'
import Contact from './parts/Sections/Contact.jsx'
import Footer from './parts/Sections/Footer.jsx'

// One synthetic ECG beat pattern (drawn procedurally; not patient data)
function ecgPath(width = 640, h = 56, beats = 5) {
  const base = h * 0.62
  const step = width / beats
  let d = `M0 ${base}`
  for (let i = 0; i < beats; i++) {
    const x = i * step
    const p = (f, y) => `L${(x + f * step).toFixed(1)} ${(base - y).toFixed(1)}`
    d += p(0.18, 0) + p(0.24, 5) + p(0.30, 0) + p(0.40, 0) + p(0.43, -6) + p(0.47, h * 0.58) + p(0.51, -12) +
      p(0.54, 0) + p(0.66, 0) + p(0.73, 9) + p(0.80, 0) + p(1, 0)
  }
  return d
}

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.dataset.theme === 'dark'), [])
  const flip = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch (e) { /* storage blocked */ }
    setDark(!dark)
  }
  return (
    <button className="theme" type="button" onClick={flip} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}

function Header() {
  return (
    <header className="top">
      <div className="wrap top-in">
        <a className="brand" href="#main">M. R. Islam</a>
        <nav aria-label="Sections">
          <a href="#research">Research</a>
          <a href="#publications">Publications</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <PullCord />
      </div>
    </header>
  )
}

function Hero() {
  return (
    <div className="hero-bg"><PaperGrid />
    <section className="hero wrap" aria-labelledby="name">
      <div className="hero-grid"><div className="hero-text">
      <p className="eyebrow">{person.role}</p>
      <h1 id="name">{person.name}</h1>
      <p className="aff"><span className="aff-pos">{person.position}</span><br />{person.affiliation}</p>
      <p className="tagline">{person.tagline}</p>
      <p className="lead">{person.intro}</p>
      <p className="seeking">{person.seeking}</p>
      <div className="actions">
        {person.cv && <a className="btn primary" href={person.cv}>CV (PDF)</a>}
        {person.links.map(([label, href], i) => (
          <a key={label} data-magnetic className={`btn${!person.cv && i === 0 ? ' primary' : ''}`} href={href}
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>{label}</a>
        ))}
      </div>
      </div><HeroStage /></div>
      <HeroTrace />
      <dl className="facts">
        {facts.map(([n, t]) => (
          <div key={n}><dt data-scramble>{n}</dt><dd>{t}</dd></div>
        ))}
      </dl>
    </section></div>
  )
}

// Dot + 95% CI chart of the locked-test AUROC per label (real numbers). HTML rows so text stays
// readable at phone width; positions in % of the 0.5-1.0 axis.
function AurocChart() {
  const lo = 0.5, hi = 1.0
  const pct = (v) => `${(((v - lo) / (hi - lo)) * 100).toFixed(2)}%`
  const ticks = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  return (
    <figure className="fig" data-caliper="fig · test AUROC">
      <div className="chart" role="table" aria-label="Test AUROC per label with 95% confidence intervals">
        {testAuroc.map(([label, v, a, b]) => (
          <div className="row" role="row" key={label}>
            <span className="lab" role="rowheader">{label}</span>
            <span className="track" role="cell" aria-label={`${v.toFixed(3)}, 95% CI ${a.toFixed(3)} to ${b.toFixed(3)}`}>
              {ticks.map((t) => <i className="grid" key={t} style={{ left: pct(t) }} />)}
              <i className="ci" style={{ left: pct(a), width: `calc(${pct(b)} - ${pct(a)})` }} />
              <i className="dot" style={{ left: pct(v) }} />
            </span>
            <span className="val" role="cell" aria-hidden="true">{v.toFixed(3)}</span>
          </div>
        ))}
        <div className="row axis" aria-hidden="true">
          <span />
          <span className="track">{ticks.map((t) => <b key={t} style={{ left: pct(t) }}>{t.toFixed(1)}</b>)}</span>
          <span />
        </div>
      </div>
      <figcaption>Locked test set (n = 240): AUROC per label, dots with 95% bootstrap intervals.</figcaption>
    </figure>
  )
}

function ResearchCard({ item, figure }) {
  return (
    <article className="card" id={item.id} data-tilt>
      {item.id === 'ecg' && <Stamp lines={['LOCKED TEST', 'OPENED ONCE']} date="21 NOV 2026" corner="bottom-right" />}
      <div className="card-text">
        <p className="tag">{item.tag}</p>
        <h3>{item.title}</h3>
        <p className="finding">{item.finding}</p>
        <p>{item.detail}</p>
        <p className="status">{item.status}</p>
        <p className="links">
          {item.links.map(([label, href]) => <a key={href} href={href}>{label} →</a>)}
        </p>
      </div>
      {figure}
    </article>
  )
}

export default function Home() {
  return (
    <>
      <InteractLayer />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <SameSignal />
        <section id="research" className="wrap section" aria-labelledby="research-h">
          <h2 id="research-h">Research</h2>
          <ResearchCard item={research[0]} figure={<AurocChart />} />
          <TestDots />
          <div className="roc-block" data-caliper="fig · ROC, locked test"><RocExplorer /></div>
          <div className="more-block" data-tilt><ReportCard /></div>
          <div className="more-block" data-caliper="fig · external tests"><ExternalTests /></div>
          <div className="more-block" data-caliper="fig · VLM blind spots"><VlmCard /></div>
          <div className="more-block" data-caliper="fig · Ucp1"><NasaCard /></div>
        </section>
        <Outputs />
        <About />
        <Credentials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
