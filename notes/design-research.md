# Design research: award-level 3D portfolio (2026-11-23)

## Sources (read, not just searched)
- utsubo.com/blog/best-threejs-websites-2026 — 8 award sites + techniques (agency blog, self-promotional pick inside).
- hontran.dev/blog/webgl-website-examples and /best-award-winning-websites-2026 — juror-style criteria.
- svilenkovic.com/3d/scrollytelling-trends-2026 — tooling (Lenis, ScrollTrigger, CSS view-timeline).
- Hands-on: oryzo.ai (Lusion, Awwwards SOTM Apr 2026), minhpham.design. Reels: notes/reels.md.
All are studio/vendor blogs: directional, not measured. Where they disagree (is 3D growing?), we ignore it.

## What award juries reward (consistent across sources)
1. **One hard idea, executed cleanly.** One object / one scroll story. "Effects bolted on" is the named anti-pattern.
2. **3D is the narrative or navigation, not decoration.** The single floating hero object is called dated.
3. **Directed motion:** section changes should feel like **camera moves**, not fades or hard cuts.
4. **Art direction:** restrained editorial type, a calm palette, cinematic light (bloom/glow done with shaders).
5. **Performance is judged:** about 60 fps on a mid-range phone; device-tier detection, lighter scene on weak devices,
   static fallback without WebGL, HTML first for SEO and Core Web Vitals; reduced-motion path checked.
6. Tooling consensus: Three.js (R3F for component sites) + GSAP ScrollTrigger + Lenis; glTF + Draco/Meshopt, KTX2.

## Seen hands-on
- **Oryzo:** intro is a blueprint/CAD line drawing of the product that turns into the real object; the camera moves on
  Z with inertial easing; huge editorial wordmark; then a dark, single-object close-up. One object the whole way.
- **Minh Pham:** a short intro screen with a "start" button before the site; 3D kept below the work.

## Verdict on our current home page (honest)
- Good: one particle system morphing through shapes tied to the work; fast (Lighthouse 100/96).
- Below the award bar: (a) shapes morph **in place**, the camera never moves, so it reads as a background, not a story;
  (b) no cinematic light (no bloom/depth); (c) the heart doesn't *beat*, the ECG doesn't *drive* anything, so there is no
  cause and effect; (d) the 3D doesn't link to the content (no hotspots, nothing clickable); (e) extra effects
  (cursor ring, tilt, magnetic, bubbles) sit side by side, not in one idea; (f) no intro moment.

## The one idea for this portfolio
**"From a heartbeat to the stars."** One continuous camera journey that mirrors the research:
1. Intro (about 1.5 s, once per visit): a blueprint line drawing of an ECG strip draws itself, then lights up.
2. Act 1, hero: the 12-lead ECG in 3D; the R-peaks of the live trace **trigger** everything that follows.
3. Act 2, thesis: the camera **dives into the trace**, and the points become a 3D heart that **beats in sync with the
   ECG R-peak** (75 bpm). Hotspot: "Reading paper ECGs" leads to the thesis.
4. Act 3, NASA: the camera travels **along a DNA helix**; gene hotspots (Ucp1 12.21×) are labelled.
5. Act 4, space: the camera pulls back to a planet with an orbiting station dot (ISS, 37 days).
6. Act 5, contact: stars; the heartbeat pulse ripples through the field one last time.
Bloom on all acts (high tier only). The ECG pulse colour is the one accent that ties the acts together.

## Fixed checks for the upgrade (do not move)
- Desktop Lighthouse performance >= 95, mobile >= 85; CLS 0; accessibility 100.
- Low-tier devices (<= 4 cores or mobile): no bloom, half the particles; holds a smooth frame rate.
- Reduced motion: no intro, no camera flight; shapes switch without motion; site fully usable.
- Every hotspot is a real link with a text label, reachable by keyboard.
- No console errors; no horizontal scroll at 375 px.
