# Prompts for ChatGPT (paste one at a time, in order; bring every answer back)

Use the strongest model with web search / deep research ON. Paste each prompt as is.

---------------------------------------------------------------------------------------------------------------
## PROMPT 1 - Concept: red-team and alternatives

You are a jury member of Awwwards and an editor at Distill.pub at the same time. Be harsh and specific.

Context about me: I am an early-career ML-for-healthcare researcher from Bangladesh (B.Sc. CSE 2026) applying for
research-assistant, MSc and PhD positions (readers: professors and admissions committees, often on a phone,
spending 30-90 seconds). My main work: a dataset of 1,191 smartphone photographs of PAPER 12-lead ECG printouts
(1,175 patients, one hospital), labelled from the cardiologist's handwritten remark; a plain ConvNeXt-Tiny reads the
photo directly; locked test set opened once: macro AUROC 0.923 (95% CI 0.895-0.946); the same ECGs printed, crumpled,
stained, scanned or photographed off a monitor (9 physical forms) score 0.834-0.846; a second system writes a
four-line clinical report from the photo; external tests in Germany, Pakistan and the USA. Other work: NASA OSDR
mouse microgravity re-analysis (16 mice), a VLM blind-spot study on paper ECGs, exoplanet vetting preprint.
I cannot show real patient photographs (privacy); only synthetic ECGs or charts.

My current concept, "The printout": the whole site looks like a paper ECG record (pink 1 mm grid, the machine's
header block filled with my own facts). Signature interaction: the visitor can crumple, stain, tilt or "photograph"
the printout with paper physics, and a small model readout beside it keeps reading it, quoting the real robustness
result. Below it: a fast editorial academic page; each research card has one small explorable (Distill style).

Tasks:
1. Attack this concept: where would it feel gimmicky, slow, unreadable or unprofessional to a professor? What must be
   true for it to work?
2. Propose 5 genuinely different concepts that could only belong to THIS researcher (not generic "AI" visuals: no
   neural-network node graphs, no particle brains, no floating DNA). For each: the one idea, the first screen in
   one sentence, the signature interaction, why a professor would remember it, the risk.
3. Rank all 6 against: memorability, credibility for academic hiring, first-screen information, phone performance,
   build effort for one developer in one week. Give a table and one recommendation.
4. Name 10 real websites (with exact URLs) whose specific technique I should study for the recommended concept, and
   what exactly to take from each. Only list sites you are certain exist; say "unsure" otherwise.

---------------------------------------------------------------------------------------------------------------
## PROMPT 2 - Craft: how award-level sites achieve "feel"

I am building a personal research portfolio in React 18 + Vite + Three.js (react-three-fiber), static site on Vercel,
prerendered HTML. Concept: [PASTE THE CONCEPT CHOSEN AFTER PROMPT 1].

Explain like a senior creative developer from studios such as Lusion, Active Theory, Locomotive or Resn:
1. The 10 craft details that separate a top-0.5% site from a template site (typography system, grid, motion
   curves and durations, micro-interactions, cursor, sound, loading, transitions, texture/grain, colour), each with
   concrete values (e.g. easing curves, ms, font pairings, sizes) I can implement.
2. For paper physics in the browser (a sheet that crumples, folds, gets stained and flattens back), compare 3
   techniques: (a) verlet/cloth simulation on a mesh, (b) vertex shader driven by pre-baked crumple displacement
   maps, (c) 2D canvas/CSS fake. For each: realism, frame time on a mid-range Android phone, code complexity, and a
   minimal code sketch. Recommend one.
3. A performance budget: JS kB, texture sizes, draw calls, target LCP/INP/CLS, and how to keep Lighthouse mobile
   performance >= 90 with one WebGL scene (lazy load, idle mount, DPR cap, pause off screen, static fallback).
4. Accessibility for such a site: reduced motion, keyboard, screen readers, contrast on a pink grid.
5. The 8 most common mistakes that make such a portfolio look amateur.

---------------------------------------------------------------------------------------------------------------
## PROMPT 3 - Content: what makes professors reply

You are a professor who hires research assistants and PhD students in medical AI (UK/EU/US/Australia). You get
50 emails a week with portfolio links.
1. In the first 10 seconds on a portfolio, what do you look for and in what order? What makes you close the tab?
2. Write the first-screen text (name line, one-sentence positioning, 3 proof points, buttons) for the researcher
   described here: [PASTE THE "Context about me" PARAGRAPH FROM PROMPT 1]. Give 3 versions: plain, bold, warm.
3. How should preprints, manuscripts in preparation and a B.Sc. thesis be listed so they look honest and strong,
   not inflated? Give exact formatting examples.
4. Which claims or words would make you distrust the candidate (e.g. "first", "state of the art", small-sample
   AUROCs in the headline)? List them.
