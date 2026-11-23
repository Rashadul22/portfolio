# PROJECT_STATE — Research portfolio (Md Rashadul Islam)

## Goal
Professional upgrade of the research portfolio: Vite + React + Three.js 3D hero, mobile-first, fast; existing content kept.
**Done means:** live on GitHub Pages (https://rashadul22.github.io/portfolio/) and all checks below pass.

### Fixed checks (do not move)
- Mobile 375 px: no horizontal scroll, nothing overlaps, text readable.
- No console errors; `npm run build` clean.
- `prefers-reduced-motion`: no animation, static 3D frame.
- Keyboard: skip link, visible focus, all links reachable.
- Text paints without waiting for 3D (3D chunk lazy-loaded); DPR capped at 2; rendering pauses off screen / hidden tab.
- Lighthouse desktop performance >= 85 (run before deploy).

## Decisions taken
- 2026-11-23 · Task = "Professional upgrade", done = "GitHub Pages live" (user chose).
- 2026-11-23 · Stack: Vite 5.4.11, React 18.3.1, R3F 8.17.10, three 0.169.0, GSAP 3.12.5. Plain CSS with tokens
  (no Tailwind: one page, fewer deps). No drei (not needed).
- 2026-11-23 · Hero concept: 12-lead ECG traces as glowing 3D lines on faint ECG-paper grid + star field
  (ties thesis = paper ECG + space biology). Fonts: Fraunces (display), Inter (text), JetBrains Mono (labels).
- 2026-11-23 · Old single-file site moved to `legacy/old-index.html` (kept, not deleted).

## State now
- 2026-11-23 · FULL SITE BUILT + verified: hero, Research (3 projects), Publications (2+3+2), About (interests,
  education, skills), Credentials (+ community, beyond the lab), Contact, footer. All text from CV via src/content.js.
- Verified: desktop 1440 + mobile 375 screenshots of every section, no horizontal scroll, keyboard skip link works,
  no console errors on the production build.
- Lighthouse (production build, local): desktop 100/100/100/100; mobile perf 95 (2 of 3 runs; one run 84 = noise),
  a11y/best-practices/SEO 100. Mobile LCP 2.3 s, CLS 0.053.
- Speed work: page HTML is pre-rendered at build (scripts/prerender.mjs), fonts self-hosted (@fontsource, no Google),
  3D scene loads client-only after first paint. GSAP removed (unused). Favicon added.
- Deploy ready but NOT done: `.github/workflows/deploy.yml` builds and deploys to Pages on push to main.
  Nothing committed or pushed yet. Needs user's yes, then: commit + push, and on github.com repo
  Settings -> Pages -> Source = "GitHub Actions" (gh CLI not installed on this PC).
- Defaults taken without answer (change if user says): phone OFF the site; CV PDF not offered as download;
  'Beyond the lab' + community kept; Google Scholar link hidden until URL given (profile.links.scholar).
- OPEN QUESTION: CV lists domain rashadul.me — use it? Then set Vite base to '/' and add public/CNAME.

### Thesis showcase (/thesis) — started 2026-11-23
- Source of truth: `notes/thesis-brief.md` (user's brief; overrides CV for thesis numbers; privacy rules inside:
  synthetic ECGs only, no real photos/patient data, no "first/novel/SOTA", status wording fixed, palette fixed).
- Reels studied -> `notes/reels.md`. Pattern adopted: scroll-explained object ("anatomy of"), labelled hotspots,
  editorial serif, calm light palette. Rejected: avatars, physics toys, glossy decoration.
- SAMPLE DONE + verified (waiting for user's OK on look): `thesis/index.html` -> /portfolio/thesis/
  - Hero: 3D curled pink-grid synthetic 12-lead sheet; phone flies in with camera-frustum lines, flash, sheet
    flattens into a blue-framed "model input"; mouse tilt; replay button. Reduced motion / no WebGL2 -> crisp 2D
    canvas still. Test hooks: `?freeze=<sec>` holds the timeline, `?static` forces the still.
  - Chart 1: locked test-set AUROC per label, dot + 95% CI, sorted, hover/focus tooltip, table toggle, draws at
    real container width (readable at 375 px).
  - Lighthouse thesis page: desktop 99/100/100/100; mobile perf 84–95 (noise), a11y/BP/SEO 100, CLS 0.
  - Fixes learned: R3F default tone mapping + lights > 1.0 wash out paper colours -> unlit material + `flat`;
    font-swap layout shift fixed with metric-matched fallback @font-face (both pages now CLS 0).
- Home page: hero stat corrected to "1,191 ECG photos (1,175 patients)".
- NEXT (after user OK on sample), build in this order: (1) pipeline scroll story "anatomy of a paper ECG"
  (paper -> photo -> mask -> 448x1024 -> ConvNeXt-Tiny blocks -> 5 outputs); (2) shortcut-test toggle
  (full / trace erased / trace only: dev CV 0.89 / 0.507 / 0.847); (3) paper-condition robustness slider + 9-bar strip
  (0.834–0.846); (4) lead explorer hotspots (RBBB V1 +2.12, V2 +0.88; MI/ischaemia V1–V3, aVF, III; rate -> rhythm strip;
  aVR alignment caveat); (5) paper 2: report typewriter + confidence/refer meter, charts (pre-training bars,
  direct vs digitise, report systems); (6) what did not work; (7) where this goes; skills; credits;
  (8) teaser card on home page + update home thesis card to brief numbers.
- CONFLICT to show user: CV thesis text (ConvNeXt-Small trimodal, val AUC 0.837, "1,191 patients") is out of date vs
  brief (ConvNeXt-Tiny image model, locked test 0.923, 1,191 photos / 1,175 patients). Home research card still has
  the CV version until the user confirms. Brief credits: supervisor name to confirm (CV: Dr. Md. Ali Hossain);
  co-supervisor Dr Mohammad Ali Moni (Charles Sturt University).

## Where things are
- Content: `src/content.js` (from CV). Old site text: `notes/content-extracted.txt`.
- Thesis page: `thesis/index.html`, `src/thesis/` (ThesisApp, PaperScene 3D, ecg.js synthetic ECG + paper drawing,
  AurocChart, data.js numbers from brief, thesis.css light palette). Build has two inputs (vite.config.js).
- Code: `src/App.jsx`, `src/components/Hero.jsx`, `src/components/Sections.jsx`, `src/three/EcgScene.jsx`,
  `src/styles.css` (base + hero), `src/sections.css`, `src/entry-server.jsx` + `scripts/prerender.mjs` (pre-render).
- Run: `npm run dev` (open http://localhost:5173/portfolio/) · Build: `npm run build` -> `dist/` (pre-rendered).
- Test production: `npx vite preview --port 4173` -> http://localhost:4173/portfolio/ ; Lighthouse:
  `npx lighthouse@12.2.1 <url> [--preset=desktop]` (Chrome is installed).
- Deploy: `.github/workflows/deploy.yml` (Node 20 on GitHub).
- Preview config for Claude: `.claude/launch.json` (name `portfolio-dev`).

## Rules
- Ask before deploy/push/publish/delete/upload. No private data in the repo (student email is already public on the old site).
- User writes Bengali; reply short in Bengali; files in English.
