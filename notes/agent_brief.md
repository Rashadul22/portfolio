# Brief for build agents (read fully before coding)

Project: H:\portfolio (Vite 5 + React 19.2 + plain CSS, prerendered static site). Academic portfolio of Md Rashadul
Islam, medical-AI researcher (thesis: smartphone photographs of PAPER 12-lead ECGs). Audience: professors hiring
RA/MSc/PhD students; they must trust it in 30 seconds. Concept "The Same Signal": warm paper, ink, one clinical blue,
ECG-pink grid. Credibility beats spectacle. Read PROJECT_STATE.md top section for decisions.

## Hard rules
- Create ONLY new files in your own folder `src/home/parts/<YourComponent>/` plus your preview page
  `preview/<yourcomponent>.html` (+ `preview/<yourcomponent>.jsx`). Do NOT edit any existing file (another session
  integrates). No new npm packages unless your task explicitly allows one.
- Default export a React component. Own CSS file imported by the component. Use ONLY these CSS variables (defined in
  src/home/home.css, light + dark): --bg --surface --text --muted --line --accent --accent-ink --trace --grid
  --serif --sans --mono. Existing helper classes: .wrap (max-width 1040, side padding), .section, .eyebrow, h2.
  Prefix all your class names with a short unique prefix to avoid clashes.
- Prerender-safe: no window/document at module scope or during render; browser code in useEffect only. Render
  meaningful HTML on the server (text and numbers visible without JS).
- Accessibility: keyboard operable, visible focus, aria labels, a text/table equivalent for every chart, contrast
  >= 4.5:1 for text. `prefers-reduced-motion: reduce` -> no animation, final state shown.
- Phone 375 px: no horizontal scroll, touch works, text >= 14 px. Desktop 1440.
- Performance: no heavy libraries; pause animations off screen (IntersectionObserver); no layout shift.
- Honesty: never "first", "state of the art", "clinically validated". Synthetic ECG visuals only (no patient
  images). Use only numbers given in your task; label development vs test where relevant.
- Comments in English, short.

## Check before you finish
1. The dev server runs at http://localhost:5173/portfolio/ (do not start or stop it). Your preview page is at
   http://localhost:5173/portfolio/preview/<yourcomponent>.html . Preview html template:
   `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="./<yourcomponent>.jsx"></script></body></html>`
   and the .jsx imports '../src/home/home.css', '@fontsource/inter/latin-400.css', '@fontsource/fraunces/latin-400.css',
   '@fontsource/jetbrains-mono/latin-500.css' and renders your component inside <main className="wrap section">.
2. Screenshot with headless Chrome (desktop and phone):
   "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,1400 --virtual-time-budget=6000 --screenshot=H:/portfolio/notes/agents/<name>_desktop.png "<preview url>"
   For phone width, Chrome headless cannot go below ~500 px: make a file notes/agents/<name>_phone.html containing an
   iframe 375 px wide pointing at the preview url, and screenshot that file at --window-size=375,1800.
   Look at both images (Read tool) and fix what is wrong. Also test dark theme: add ?dark to your preview and set
   document.documentElement.dataset.theme='dark' in the preview jsx when location.search includes 'dark'.
3. Run `cd /h/portfolio && npx vite build --logLevel error` is NOT needed; just make sure the preview loads without
   console errors (if you can, read them via a quick headless --dump-dom run).
4. Report: files created, how to use the component (props), what you verified, what you could not.
