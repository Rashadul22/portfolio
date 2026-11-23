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
- 2026-11-23 · FULL THESIS PAGE BUILT + verified (user said "build the rest"). Sections: hero 3D, problem, data +
  audit, pipeline scroll story (CSS 3D exploded stack, 7 steps), results (test AUROC dot chart), checks (shortcut
  toggle demo + session/phone caveats + robustness demo with 7 simulated paper forms and range bands), what did not
  work, paper 2 (report typewriter + refer gate, pre-training dot chart, direct-vs-digitise dot chart, report-systems
  bar chart, facts, lead explorer), next steps, credits + skills. Sticky in-page nav. Home: thesis card now uses brief
  numbers and links to thesis/; publications "in preparation" rows are working descriptions, not titles.
- Verified: mobile 375 + desktop 1280 screenshots of each demo; buttons work (shortcut 0.507, uncertain -> refer,
  MI highlights V1–V3 + aVF/III); no console errors from the current bundles.
- Lighthouse (prod build): thesis desktop 100/100/100/100, mobile perf 95–96 (TBT 100–160 ms), a11y 100, CLS 0;
  home desktop 100, mobile 85–95 (noise), CLS 0.
- Perf lessons: draw canvases only when near the viewport (`whenNear` in ecg.js); start the 3D hero on
  requestIdleCallback; inactive text uses a 4.5:1 grey, never opacity.
- Honesty rules applied: per-form robustness scores NOT shown (brief gives only 0.834–0.846); pipeline output values
  and report confidence labelled "illustrative"; dev-CV vs test numbers labelled everywhere.
- STILL TO CONFIRM with user: supervisor name in credits (used CV: Dr. Md. Ali Hossain); CV itself is out of date vs
  brief (ConvNeXt-Small trimodal 0.837 vs ConvNeXt-Tiny 0.923); per-form robustness numbers if they want the 9 bars;
  final paper titles.

### Home page interactions (2026-11-23) — LIVE on www.rashadul.me (user said "Yes, make it live"; merged home-fx -> main)
- User feedback: home page "didn't change"; wants reel-style interaction/effects/animation on the main page.
- Built: `src/three/MorphField.jsx` + `shapes.js` — one fixed full-screen GPU particle field (9k desktop / 4.2k
  mobile) that morphs on scroll: ECG traces (hero) -> heart (thesis card) -> DNA helix (NASA card) -> planet + ring
  (credentials) -> star field (contact); points shy away from the cursor; pauses when tab hidden. Anchors = section
  selectors in ANCHORS; placement in PLACE.
- `src/components/fx.jsx`: SplitTitle (word-by-word mask reveal on section titles), CountUp (numbers count up),
  usePointerFx (3D tilt + glare on [data-tilt] cards, magnetic [data-magnetic] buttons, cursor ring; desktop mouse
  only), useSmoothScroll (Lenis 1.1.18, lazy, desktop only; needs the html.lenis CSS in fx.css).
- `src/components/SkillBubbles.jsx`: draggable/throwable physics bubbles of 20 tools (custom physics, auto-sized to
  ~38% of the box); reduced motion -> static pills. Hero: scroll cue; 2nd button -> interactive thesis.
- Old `src/three/EcgScene.jsx` removed. Cards on frosted glass for readability over particles.
- Verified (dev, 1280 + 375): all five shapes appear at the right sections; drag/throw works; no horizontal scroll.
  Lighthouse prod build home: desktop 100/100/100/100; mobile 96/100/100/100 (2 runs); CLS 0.
- Browser-pane caveat: when hidden it throttles rAF/CSS animations, so screenshots can look empty/mid-animation;
  check element state with JS before assuming a bug.

### Chapters part (branch `chapters`, 2026-11-23) — built + verified, NOT live yet
- `src/components/Chapter.jsx`: 4 pinned interludes (CSS sticky, 170vh desktop / 130vh phone); the morph between
  acts now runs only inside chapters ([data-chapter] anchors in MorphField), so title and camera move together.
  Order: Hero · Ch1 · Research (Ch2 sits between project 2 and 3) · Publications · About · Ch3 · Credentials · Ch4 · Contact.
- DNA flight: while act 2 holds (Ch2 end -> Ch3 start) the helix turns 270° and slides; 5 gene hotspots
  (Ucp1 12.21× up, Angpt2, Jun, Irs2, Klf2) fade out when behind the helix; helix dimmed and pushed right (x 4.6).
- Blueprint hero: ECG drawn left to right by a "pen" in white-blue, then inked to cyan; FIG. 01 caption + corner
  marks (CSS) fade out. Starts after the intro on first visit.
- Lighthouse prod: desktop 100/100/100/100; mobile 95/100/100/100 (2 runs); CLS 0.

### Cinematic upgrade (2026-11-23) — LIVE (merged to main, user said "Live + next part")
- User asked: research trends first, then build top-level 3D/interaction. Research: `notes/design-research.md`
  (sources, jury criteria, hands-on Oryzo/Minh Pham, verdict on our page, the one idea, fixed checks).
- One idea: "From a heartbeat to the stars". Built so far: camera travels between acts and dives through each morph;
  75 bpm heartbeat (R-peak envelope) makes the heart contract and glow; in-shader glow (core + halo, no
  post-processing; the `postprocessing` lib was tried and dropped: colour-space double-encode lightened the bg);
  ISS dot orbits the planet; projected 3D hotspots (links, keyboard reachable only when visible, flip near edge,
  desktop only); first-visit CSS intro (ECG line draws, R-peak, name; sessionStorage skip; reduced motion skip);
  device tier (phones / <=4 cores / <=4 GB: fewer points, smaller glow).
- Test hooks: `?snap` (field jumps to scroll target; exposes window.__field), thesis `?freeze`, `?static`.
- Lighthouse prod home: desktop 100/100/100/100; mobile 95–96/100/100/100; CLS 0; TBT 0.
- NEXT candidates (from research, in order): GSAP ScrollTrigger pinned chapters so text and camera move together;
  camera flight along the DNA with gene hotspots; Oryzo-style blueprint-to-real transition of the hero sheet;
  section transitions that feel like camera moves; audio-off-by-default heartbeat.

## DEPLOYED — LIVE at https://www.rashadul.me (2026-11-23, user said "Yes, deploy")
- HOSTING FACT: rashadul.me is served by **Vercel**, connected to this repo; every push to `main` deploys
  automatically (~15 s). rashadul.me redirects to www.rashadul.me. Pages: `/` and `/thesis/`.
- Vercel sets VERCEL=1 at build -> vite base '/'. Locally base stays '/portfolio/' (dev URL
  http://localhost:5173/portfolio/). Before this fix the live site was broken (all assets 404 under /portfolio/).
- GitHub Pages is NOT used: the user-site repo `rashadul22.github.io` owns the rashadul.me custom domain, so project
  Pages would redirect to rashadul.me/portfolio/ (not served by Vercel). `deploy.yml` is now manual-only.
  The user made the repo public and may have touched Pages settings; harmless.
- Live Lighthouse: home desktop 100/100/100/100, mobile 100/100/100/100; thesis desktop 100/100/100/100,
  mobile 85/100/100/100; CLS 0 everywhere. Live console: no errors. All assets 200.
- Git: `main` = live. Branch `thesis-showcase` merged (fast-forward). Pushing to main = publishing: ask first.

## Where things are
- Content: `src/content.js` (from CV). Old site text: `notes/content-extracted.txt`.
- Thesis page: `thesis/index.html`, `src/thesis/`: ThesisApp (page), PaperScene (3D hero), ecg.js (synthetic ECG,
  paper drawing, lead boxes, whenNear), Charts.jsx (DotChart, BarChart), Pipeline.jsx, Interactives.jsx (shortcut,
  robustness, lead explorer), Report.jsx, data.js (all numbers from the brief), thesis.css. Two Vite inputs.
- Code: `src/App.jsx`, `src/components/Hero.jsx`, `src/components/Sections.jsx`, `src/three/EcgScene.jsx`,
  `src/styles.css` (base + hero), `src/sections.css`, `src/entry-server.jsx` + `scripts/prerender.mjs` (pre-render).
- Run: `npm run dev` (open http://localhost:5173/portfolio/) · Build: `npm run build` -> `dist/` (pre-rendered).
- Test production: `npx vite preview --port 4173` -> http://localhost:4173/portfolio/ ; Lighthouse:
  `npx lighthouse@12.2.1 <url> [--preset=desktop]` (Chrome is installed).
- Deploy: push to `main` -> Vercel -> https://www.rashadul.me (automatic). `.github/workflows/deploy.yml` = manual-only
  GitHub Pages fallback, not used. To test a root-path build locally: set env VERCEL=1, then `npm run build`.
- Preview config for Claude: `.claude/launch.json` (name `portfolio-dev`).

## Rules
- Ask before deploy/push/publish/delete/upload. No private data in the repo (student email is already public on the old site).
- User writes Bengali; reply short in Bengali; files in English.
