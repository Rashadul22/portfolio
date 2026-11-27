import './sections.css'
import { profile, education, languages } from '../../../content.js'

export default function About() {
  return (
    <section className="wrap sx-sec" id="about" aria-labelledby="sx-about-h">
      <p className="eyebrow">About</p>
      <h2 id="sx-about-h">Research interests and education</h2>
      <div className="sx-two">
        <div>
          <h3 className="sx-h3">Interests</h3>
          <p>{profile.interests}</p>
          <p className="sx-lang"><b>Languages.</b> {languages}</p>
        </div>
        <div>
          <h3 className="sx-h3">Education</h3>
          <ul className="sx-edu">
            {education.map(e => (
              <li key={e.degree + e.period}>
                <strong>{e.degree}</strong>
                <span className="sx-meta">{e.place} · {e.period}</span>
                <ul>{e.details.map(d => <li key={d}>{d}</li>)}</ul>
              </li>
            ))}
          </ul>
          <h3 className="sx-h3">Experience</h3>
          <ul className="sx-edu">
            <li>
              <strong>Research Assistant</strong>
              <span className="sx-meta">NanoBio Technology Center, Daffodil International University, Dhaka · May 2026 – present</span>
              <ul><li>Machine learning for medical data, with Dr. Md. Ali Hossain (Director)</li></ul>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
