import React from 'react';
import { createRoot } from 'react-dom/client';
import '../src/home/home.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import PaperGrid from '../src/home/parts/PaperGrid/PaperGrid.jsx';

if (location.search.includes('dark')) document.documentElement.dataset.theme = 'dark';
document.body.style.cssText = 'margin:0;background:var(--bg);color:var(--text);font-family:var(--sans)';

createRoot(document.getElementById('root')).render(
  <main className="wrap section">
    <section style={{ position: 'relative', minHeight: 420, padding: '64px 24px', overflow: 'hidden' }}>
      <PaperGrid />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p className="eyebrow">Medical AI research</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(30px,6vw,52px)', margin: '8px 0 16px' }}>
          The same signal, on paper and in a photograph.
        </h1>
        <p style={{ maxWidth: 560, color: 'var(--muted)', fontSize: 18, lineHeight: 1.6 }}>
          Sample hero text over the grid. Move the cursor across the background to bend the paper.
        </p>
      </div>
    </section>
  </main>
);
