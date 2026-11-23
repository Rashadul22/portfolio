import { heroStats as stats } from '../content.js'
import { CountUp } from './fx.jsx'

// The 3D lives in the page-wide <MorphField> (App.jsx); the hero is text over it.
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__veil" aria-hidden="true" />
      {/* blueprint frame shown while the 3D ECG is being "drawn" (fades once it inks to colour) */}
      <div className="blueprint" aria-hidden="true">
        <i className="bp-c bp-tl" /><i className="bp-c bp-tr" /><i className="bp-c bp-bl" /><i className="bp-c bp-br" />
        <span className="bp-cap">FIG. 01 — 12-LEAD ECG · 25 mm/s · 10 mm/mV · SYNTHETIC</span>
      </div>

      <div className="hero__inner">
        <p className="eyebrow" data-rise style={{ '--i': 0 }}>
          <span className="dot" /> AI Researcher · Dhaka
        </p>
        <h1 id="hero-title" className="hero__title" data-rise style={{ '--i': 1 }}>
          Md Rashadul <em>Islam</em>
        </h1>
        <p className="hero__lede" data-rise style={{ '--i': 2 }}>
          I build explainable machine learning for medical data — images, physiological signals and
          clinical records — for settings where data, equipment and expertise are limited: from diagnosing
          heart disease using smartphone photos of paper ECGs, to the first ML re-analysis of NASA&nbsp;OSD-970.
        </p>
        <div className="hero__cta" data-rise style={{ '--i': 3 }}>
          <a className="btn btn--primary" href="#research" data-magnetic>View research</a>
          <a className="btn btn--ghost" href="thesis/" data-magnetic>Interactive thesis →</a>
        </div>

        <dl className="stats" data-rise style={{ '--i': 4 }}>
          {stats.map(([num, unit, note]) => (
            <div className="stat" key={note}>
              <dt className="stat__num"><CountUp value={num} /><span>{unit}</span></dt>
              <dd className="stat__note">{note}</dd>
            </div>
          ))}
        </dl>
      </div>

      <a className="scrollcue" href="#research" aria-label="Scroll to research">
        <span>Scroll</span><i aria-hidden="true" />
      </a>
    </section>
  )
}
