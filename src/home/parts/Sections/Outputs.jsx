import './sections.css'
import { publications } from '../../../content.js'
import { manuscripts } from '../../data.js'

const ROLE = 'My role: collected the photographs and clinical data, designed the labelling and evaluation protocol, trained and evaluated the models, and drafted the manuscript.'
const SEPSIS = 'Sepsis mortality prediction with cross-database external validation (MIMIC-IV, eICU): in progress, working description'

// Bold the author "M. R. Islam" inside an author string.
function Authors({ text }) {
  const parts = text.split('M. R. Islam')
  return parts.flatMap((p, i) => (i < parts.length - 1 ? [p, <b key={i}>M. R. Islam</b>] : [p]))
}

function Row({ year, children, url }) {
  return (
    <li className={'sx-row' + (url ? ' sx-hasurl' : '')}>
      <span className="sx-year">{year}</span>
      <div className="sx-body">{children}</div>
      <span className="sx-arrow" aria-hidden="true">{url ? '→' : ''}</span>
    </li>
  )
}

function Cite({ p, url }) {
  const title = url
    ? <a className="sx-link" href={url} target="_blank" rel="noopener noreferrer">{p.title}</a>
    : p.title
  return (
    <>
      <Authors text={p.authors} />{p.authors.endsWith(".") ? " " : ". "}<span className="sx-title">{title}</span>.
      <span className="sx-venue">{p.venue}</span>
    </>
  )
}

export default function Outputs() {
  const { peerReviewed, preprints } = publications
  return (
    <section className="wrap sx-sec" id="publications" aria-labelledby="sx-pub-h">
      <p className="eyebrow">Work</p>
      <h2 id="sx-pub-h">Publications and outputs</h2>

      <h3 className="sx-sub">Peer-reviewed</h3>
      <ul className="sx-list">
        {peerReviewed.map(p => <Row key={p.title} year={p.year}><Cite p={p} /></Row>)}
      </ul>

      <h3 className="sx-sub">Preprints (not peer reviewed)</h3>
      <ul className="sx-list">
        {preprints.map(p => <Row key={p.title} year={p.year} url={p.url}><Cite p={p} url={p.url} /></Row>)}
      </ul>

      <h3 className="sx-sub">Manuscripts in preparation</h3>
      <ul className="sx-list">
        {manuscripts.map(m => (
          <Row key={m.title} year="2026">
            <Authors text={m.authors} />. <span className="sx-title">{m.title}</span>.
            <span className="sx-venue">{m.status}</span>
            <span className="sx-role">{ROLE}</span>
          </Row>
        ))}
        <Row year="2026">
          <span className="sx-title">{SEPSIS}</span>
        </Row>
      </ul>

      <h3 className="sx-sub">Thesis</h3>
      <ul className="sx-list">
        <Row year="2026">
          <b>M. R. Islam</b>. <span className="sx-title">A Multimodal Deep Learning Framework for Multi-label Cardiovascular Disease Diagnosis from Smartphone-Captured Paper ECGs and Clinical Data in Low-Resource Settings</span> (B.Sc. thesis).
          <span className="sx-venue">Daffodil International University, 2026; supervisor Dr. Md. Ali Hossain</span>
          <span className="sx-role">{ROLE}</span>
        </Row>
      </ul>
    </section>
  )
}
