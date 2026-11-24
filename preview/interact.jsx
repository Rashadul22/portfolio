import React from 'react'
import { createRoot } from 'react-dom/client'
import '../src/home/home.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/fraunces/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import InteractLayer, { Reveal } from '../src/home/parts/Interact/InteractLayer.jsx'

if (location.search.includes('dark')) document.documentElement.dataset.theme = 'dark'

// synthetic ROC-like curve (illustration only)
function Fig() {
  return (
    <figure data-caliper="fig · ROC" style={{ margin: '24px 0', maxWidth: 420, border: '1px solid var(--line)', borderRadius: 8, padding: 12, background: 'var(--surface)' }}>
      <svg viewBox="0 0 200 200" width="100%" role="img" aria-label="Illustrative ROC curve">
        <path d="M20 180H180M20 180V20" stroke="var(--muted)" fill="none" />
        <path d="M20 180L180 20" stroke="var(--line)" strokeDasharray="4 4" fill="none" />
        <path d="M20 180C26 90 60 40 180 20" stroke="var(--accent)" strokeWidth="2" fill="none" />
      </svg>
      <figcaption style={{ fontSize: 14, color: 'var(--muted)' }}>Illustrative curve (synthetic).</figcaption>
    </figure>
  )
}
const btn = { font: 'inherit', padding: '10px 18px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', marginRight: 12 }

createRoot(document.getElementById('root')).render(
  <>
    <InteractLayer />
    <main className="wrap section">
      <p className="eyebrow">Preview</p>
      <h2>Interaction layer</h2>
      <p style={{ maxWidth: 640 }}>
        The same ECG was tested as a <span data-reveal="crumpled">crumpled</span> sheet, a{' '}
        <Reveal form="stained">stained</Reveal> sheet, a <span data-reveal="scanned">scanned</span> page, a photo of a{' '}
        <span data-reveal="monitor">monitor</span> and a <span data-reveal="photo">phone photo</span>.
      </p>
      <Fig />
      <p>
        <button data-magnetic style={btn}>Magnetic button</button>
        <a href="#x" data-magnetic style={{ ...btn, display: 'inline-block', textDecoration: 'none', background: 'var(--accent)', color: 'var(--accent-ink)' }}>Magnetic link</a>
      </p>
      <div data-tilt style={{ margin: '28px 0', maxWidth: 420, padding: 24, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--serif)' }}>Tilt card</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 0 }}>Move the pointer across this card.</p>
      </div>
      <p style={{ fontFamily: 'var(--mono)' }}>
        Test AUROC <span data-scramble>0.923</span> (95% CI <span data-scramble>0.895-0.946</span>), <span data-scramble>1,191</span> photographs.
      </p>
      <div style={{ height: 600 }} />
      <p style={{ fontFamily: 'var(--mono)' }}>Below the fold: <span data-scramble>1,175</span> patients.</p>
    </main>
  </>,
)

// test hook: ?demo=fig|tilt|mag|reveal-<form> fakes a mouse hover for headless screenshots
const demo = new URLSearchParams(location.search).get('demo')
if (demo) setTimeout(() => {
  const sel = demo === 'fig' ? 'figure' : demo === 'tilt' ? '[data-tilt]' : demo === 'mag' ? 'button[data-magnetic]' : `[data-reveal="${demo.slice(7)}"]`
  const el = document.querySelector(sel), r = el.getBoundingClientRect()
  const x = r.left + r.width * 0.8, y = r.top + r.height * 0.3
  const o = { bubbles: true, clientX: x, clientY: y, pointerType: 'mouse' }
  el.dispatchEvent(new PointerEvent('pointerover', o))
  for (let i = 0; i < 4; i++) setTimeout(() => el.dispatchEvent(new PointerEvent('pointermove', o)), i * 50)
}, 300)
