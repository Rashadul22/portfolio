import { useRef, useState, useEffect } from 'react'
import './sections.css'
import { profile } from '../../../content.js'

const SCHOLAR = 'https://scholar.google.com/citations?user=w472eK4AAAAJ&hl=en'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const inp = useRef(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    let ok = false
    try { await navigator.clipboard.writeText(profile.email); ok = true } catch { /* use fallback */ }
    if (!ok && inp.current) {
      inp.current.select()
      try { ok = document.execCommand('copy') } catch { ok = false }
    }
    if (ok) {
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } else if (inp.current) inp.current.select() // leave selected for manual copy
  }

  const L = profile.links
  const links = [['Google Scholar', SCHOLAR], ['GitHub', L.github], ['LinkedIn', L.linkedin], ['arXiv', L.arxiv]]
  return (
    <section className="wrap sx-sec sx-contact" id="contact" aria-labelledby="sx-contact-h">
      <h2 id="sx-contact-h">Contact</h2>
      <p>Open to research assistant, MSc and PhD positions in medical AI.</p>
      <div className="sx-mail">
        <input ref={inp} readOnly value={profile.email} aria-label="Email address" onFocus={e => e.target.select()} />
        <button type="button" className="sx-btn" onClick={copy}>{copied ? 'Copied' : 'Copy email'}</button>
        <span className="sx-sr" role="status" aria-live="polite">{copied ? 'Email copied' : ''}</span>
      </div>
      <ul className="sx-links">
        {links.map(([n, u]) => <li key={n}><a href={u} target="_blank" rel="noopener noreferrer">{n}</a></li>)}
      </ul>
      <p className="sx-loc">Dhaka, Bangladesh</p>
    </section>
  )
}
