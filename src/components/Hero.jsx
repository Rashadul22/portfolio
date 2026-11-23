import { lazy, Suspense, useEffect, useState } from 'react'
import { heroStats as stats } from '../content.js'

const EcgScene = lazy(() => import('../three/EcgScene.jsx'))

export default function Hero() {
  // 3D loads only in the browser, after first paint (never during pre-render)
  const [show3d, setShow3d] = useState(false)
  useEffect(() => { setShow3d(true) }, [])

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__canvas" aria-hidden="true">
        {show3d && (
          <Suspense fallback={null}>
            <EcgScene />
          </Suspense>
        )}
      </div>
      <div className="hero__veil" aria-hidden="true" />

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
          <a className="btn btn--primary" href="#research">View research</a>
          <a className="btn btn--ghost" href="#contact">Get in touch</a>
        </div>

        <dl className="stats" data-rise style={{ '--i': 4 }}>
          {stats.map(([num, unit, note]) => (
            <div className="stat" key={note}>
              <dt className="stat__num">{num}<span>{unit}</span></dt>
              <dd className="stat__note">{note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
