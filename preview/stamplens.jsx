import React from 'react'
import { createRoot } from 'react-dom/client'
import '../src/home/home.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/fraunces/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import Stamp from '../src/home/parts/Stamp/Stamp.jsx'
import Lens from '../src/home/parts/Lens/Lens.jsx'

if (location.search.includes('dark')) document.documentElement.dataset.theme = 'dark'

// synthetic ECG-like strip (not patient data)
function beat(x, y) {
  return `L${x},${y} L${x + 8},${y - 4} L${x + 16},${y} L${x + 22},${y} L${x + 25},${y + 5} L${x + 29},${y - 42} L${x + 33},${y + 12} L${x + 37},${y} L${x + 50},${y} L${x + 58},${y - 9} L${x + 66},${y}`
}
function Sheet() {
  let d = 'M0,80'
  for (let x = 10; x < 640; x += 80) d += ' ' + beat(x, 80)
  let d2 = 'M0,190'
  for (let x = 30; x < 640; x += 64) d2 += ' ' + beat(x, 190)
  return (
    <svg viewBox="0 0 640 260" width="100%" role="img" aria-label="Synthetic ECG strip" style={{ display: 'block', background: 'var(--surface)' }}>
      <defs>
        <pattern id="pv-s" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="var(--grid)" strokeWidth=".5" /></pattern>
        <pattern id="pv-l" width="25" height="25" patternUnits="userSpaceOnUse"><rect width="25" height="25" fill="url(#pv-s)" /><path d="M25 0H0V25" fill="none" stroke="var(--grid)" strokeWidth="1.2" /></pattern>
      </defs>
      <rect width="640" height="260" fill="url(#pv-l)" />
      <path d={d} fill="none" stroke="var(--text)" strokeWidth=".8" />
      <path d={d2} fill="none" stroke="var(--text)" strokeWidth=".8" />
      <text x="8" y="22" fontSize="9" fontFamily="var(--mono)" fill="var(--muted)">II  25 mm/s  10 mm/mV</text>
    </svg>
  )
}

const card = { position: 'relative', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface)', padding: 20, margin: '24px 0', minHeight: 150 }

createRoot(document.getElementById('root')).render(
  <main className="wrap section">
    <p className="eyebrow">Preview</p>
    <h2>Stamp and Lens</h2>
    <div style={card}>
      <h3 style={{ margin: 0, fontFamily: 'var(--serif)' }}>Test split</h3>
      <p style={{ color: 'var(--muted)', maxWidth: 420 }}>240 records, evaluated one time after labels were frozen.</p>
      <Stamp lines={['LOCKED TEST', 'OPENED ONCE']} date="21 NOV 2026" />
    </div>
    <div style={card}>
      <h3 style={{ margin: 0, fontFamily: 'var(--serif)' }}>Red-ink variant</h3>
      <Stamp red corner="bottom-left" lines={['NOT', 'DEMONSTRATED']} date="24 NOV 2026" />
    </div>
    <p style={{ color: 'var(--muted)' }}>Hover (or press and hold on touch) the sheet.</p>
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 10, maxWidth: 760 }}>
      <Lens zoom={2.5} size={150}><Sheet /></Lens>
    </div>
  </main>,
)
