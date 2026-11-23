# Research notes (facts used, so they are not searched again)

- 2026-11-23 Â· Node on this PC is 18.17.0 -> use Vite 5.4.x (Vite 7 needs Node 20.19+). Upgrade Node later if needed.
- 2026-11-23 Â· @react-three/fiber 8.x pairs with React 18; v9 needs React 19. Chosen: React 18.3.1 + R3F 8.17.10 + three 0.169.0.
- 2026-11-23 Â· Thick lines in WebGL need three/examples Line2 + LineMaterial (gl lineWidth is always 1px). Colors are
  stored per segment as start/end pairs (instanceColorStart/End).
- 2026-11-23 Â· GitHub Pages project site URL = https://rashadul22.github.io/portfolio/ -> Vite `base: '/portfolio/'`.
  Deploy plan: GitHub Actions workflow (actions/deploy-pages) building `dist/`.

- 2026-11-23 · Thesis brief copied to notes/thesis-brief.md. It supersedes the CV for all thesis numbers (CV still says ConvNeXt-Small trimodal, val AUC 0.837; brief: ConvNeXt-Tiny image-only, locked test macro AUROC 0.923, 1,191 photos / 1,175 patients).
- 2026-11-23 · No new installable skills found (SearchSkills empty). Using local skills: dataviz (charts), journal-figure-colour (palette).
- 2026-11-23 · Multi-page on GitHub Pages: second Vite input thesis/index.html -> URL /portfolio/thesis/ (no router needed).
