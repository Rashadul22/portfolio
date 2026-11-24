# Brief for the portfolio builder: the EnamECG-Photo thesis project

Written 23 Nov 2026 from the project's own records. Copy this file into the portfolio repo (e.g. `content/thesis.md`)
and build the thesis section from it. Every number below is final unless marked otherwise.

---

## 0. Instructions to the builder (read first)

1. **Goal:** one thesis showcase inside the portfolio (its own page `/thesis` plus a teaser card on the home page) that
   lets a visitor *understand and play with* the work: what problem, what data, how it works, what came out, what
   failed, what is next. Audience: PhD admissions, research labs, recruiters. Level: top professional; restrained,
   scientific, not flashy.
2. **Privacy, absolute rules:**
   - NEVER use real ECG photographs from the project, figures that contain them (Grad-CAM/occlusion overlays on photos,
     Fig 1 samples), patient names, hospital numbers, ages linked to records, or any file from `H:\ecg-project\data`,
     `dataset`, raw photo folders. The dataset is not yet released and has no public-release permission yet.
   - All ECG visuals must be **synthetic** (procedurally drawn waveforms, see section 7) or plain charts drawn from the
     numbers in this file.
   - Do not mention: other groups' datasets by name in a critical way (no "dataset X has wrong metadata", no
     "dataset Y is a copy of Z"). Say only "five external image sets from Germany, China and the USA".
3. **Publication status (write exactly this kind of wording):** "Paper 1: manuscript in preparation for IEEE JBHI.
   Paper 2: in progress." Never write "first", "novel", "state of the art". Add a small note: "Numbers are from the
   manuscript draft and may change in peer review."
4. **Stack:** follow the existing repo; if free to choose: Vite + React + @react-three/fiber + drei, GSAP ScrollTrigger
   (or Framer Motion), D3 or plain SVG for charts. Pin versions.
5. **Must pass:** mobile at 375 px, `prefers-reduced-motion` (static image fallback for every 3D scene), keyboard
   navigation, no console errors, Lighthouse performance >= 85 desktop. 3D canvas lazy-loaded; text readable without it.
6. **Colours:** follow the paper palette: greys plus one accent blue `#2F5D8A`; ECG paper pink/red grid
   (`#F4C7C3` minor, `#E08A84` major) and black trace `#1A1A1A`. Charts: one hue per meaning, hover tooltips, legends.
7. **Work method:** sample first (hero scene + one chart), show the user, then build the rest. Commit each step on a
   branch; push only after the user says yes.

---

## 1. One-paragraph story (for the top of the page)

In many hospitals in Bangladesh, 12-lead ECGs are printed on thermal paper and handed to the patient; no digital
signal is kept. A phone photograph is often the only copy. We built a dataset of **1,191 smartphone photographs of
paper ECGs** from Enam Medical College Hospital (1,175 patients), each labelled from the cardiologist's own written
remark, and a strict evaluation protocol around it. A deliberately plain image model (ConvNeXt-Tiny) reads the photo
directly and reaches a macro AUROC of **0.923 (95% CI 0.895-0.946)** on a locked test set opened once. A second
study turns the photo into a structured cardiologist-style report, and shows that pre-training on synthetic rendered
ECGs and reading the image directly beat converting the photo back into a signal first.

Short tagline options: "Reading paper ECGs from a phone photo." / "When the only copy of an ECG is a photograph."

---

## 2. The problem and why it matters
- Paper ECGs: no digital signal; most ECG AI needs the signal. Photos vary: phone, light, tilt, curl, shadows,
  handwriting on the page.
- Existing image datasets are mostly scans or renders of Western data; few phone photos from real South-Asian clinics.
- Contribution is **the dataset and the evaluation protocol**, not a fancy model. The model is plain on purpose, so
  the results measure the data and the protocol.

## 3. The data (paper 1)
- 1,191 records, 1,175 patients after merging 10 duplicate printouts found during the audit; collected Nov 2025.
- Six capture sessions, two phone types (iPhone and Honor 200). GE MAC 2000 printouts (plus a second print layout).
- Five labels (multi-label): **Normal, Ischaemia, Arrhythmia/conduction block, Rate abnormality, Other**.
- Labels: the cardiologist's handwritten remark on each printout, mapped to classes with a published standard
  vocabulary (AHA/ACCF/HRS 2007 statements, PTB-XL codes); rate abnormality from the printed heart rate (<60 or >100).
- Split frozen before training: development 949 records (5-fold cross-validation by patient), test 240 records,
  opened exactly once (21 Nov 2026), enforced by code.
- Data audit (a story worth telling, as "what careful data work found"):
  - 10 pairs of the same printout entered twice -> merged.
  - The clinical spreadsheet had silently filled blanks with imputed values -> restored to missing.
  - ECG values were clipped (exactly 8 records at the minimum and maximum of every field) -> 40 cells corrected by
    reading the printed header from the photos (98-99% agreement with known values).
  - 22% of images carried printed or handwritten text -> masked so the model cannot read it.

## 4. How the system works (pipeline, for a 3D/scroll diagram)
1. Paper ECG printout -> 2. phone photo -> 3. crop + text-band mask (raw colour kept; no grayscale, no contrast
   tricks, no flips: a mirrored ECG is a different ECG) -> 4. resize to 448 x 1024 -> 5. ConvNeXt-Tiny (ImageNet
   start) -> 6. five probabilities -> 7. thresholds fixed on development data only.
- Ensemble: 3 seeds x 5 folds = 15 models averaged.
- Optional fusion with the machine's printed values (heart rate, PR, QRS, QT...) adds little (+0.005).

## 5. Results, paper 1 (final labels)

### 5a. Locked test set (n = 240, opened once)
| Label | AUROC (95% CI) | Sensitivity | Specificity | Positives |
|---|---|---|---|---|
| **Primary (macro of Normal, Ischaemia, Arrhythmia/block, Rate)** | **0.923 (0.895-0.946)** | | | |
| Normal | 0.907 (0.869-0.941) | 0.94 | 0.67 | 114 |
| Ischaemia | 0.923 (0.863-0.967) | 0.83 | 0.87 | 36 |
| Arrhythmia/block | 0.868 (0.791-0.935) | 0.42 | 0.94 | 26 |
| Rate abnormality | 0.993 (0.985-0.998) | 0.86 | 0.99 | 74 |
| Other | 0.703 (0.607-0.790) | 0.57 | 0.71 | 42 |
Development cross-validation of the same model: 0.892 (0.875-0.909). Honest weak spots: Arrhythmia/block
sensitivity 0.42; "Other" is hard.

### 5b. Checks that the model reads the ECG, not shortcuts (great for interactive "toggle" demo)
- Erase the trace, keep the paper: 0.507 (chance) -> the model needs the waveform.
- Keep only the trace: 0.847 -> the trace carries the signal.
- Leave one capture session out entirely: 0.851 -> works on unseen sessions.
- But phones/sessions are 98% identifiable from the image, and Honor photos score lower than iPhone (0.877 vs 0.931
  in a later model): a real robustness caveat.
- Machine's printed interpretation vs our model on 200 records: macro-F1 0.645 vs 0.643 (level). Caveat: the
  cardiologist saw the machine statement, which favours the machine.

### 5c. Robustness on outside images (model never retrained)
External sets from Germany, China and the USA: macro AUROC 0.83-0.89. On one set the same 977 ECGs appear in nine
physical forms (digital render, colour/B&W scans, phone photos of clean, crumpled and stained paper, photo of a
monitor): **0.826-0.844 (final labels; the earlier 0.834-0.846 was the draft-label model), every change vs render within -0.007 to +0.011** -> crumpling, stains and scanning barely matter.
Chart idea: nine bars nearly level, with paper-condition icons.

### 5d. What did NOT work (show these proudly; they are pre-registered negative results)
- Higher image resolution: no measurable gain.
- Grid rectification (flattening the paper geometrically): no gain (+0.011, interval includes 0).
- Measured photo quality (blur, light) does not predict errors.
- Lab values predicted from the ECG photo (anaemia, kidney function): not better than age + sex.

## 6. Paper 2 (in progress): from photo to a written report
Idea of the co-supervisor (Dr Mohammad Ali Moni, Charles Sturt University). All numbers are development
cross-validation (n = 949); the internal test is not run yet.

### 6a. The report
Four lines, cardiologist style: **Rate / Findings / Impression / Advice** (+ Measurements, + a Confidence line).
Example layout only (synthetic, not a patient):
```
Rate: 112/min (sinus tachycardia)
Findings: Right bundle-branch block; ST depression V4-V6
Impression: Abnormal ECG - Arrhythmia/block, Ischaemia, Rate abnormality
Advice: Clinical correlation; consider echocardiography
Measurements: PR 160 ms, QRS 128 ms, QTc 452 ms, axis +75
Confidence: high (no referral)
```
The chosen system ("R3") is classifier-gated: the report can never contradict the classifier, by construction.

### 6b. Key experiments and results (macro AUROC, primary classes)
| Question | Result |
|---|---|
| Pre-train on 19,601 synthetic rendered ECG images (public PTB-XL signals drawn as paper ECGs) instead of ImageNet? | **Yes: 0.919 vs 0.892 (+0.027, CI +0.011 to +0.042)**; Arrhythmia/block +0.086; every pre-trained seed beats every ImageNet seed |
| Must the renders copy our exact print layout? | **No.** Leads shuffled to wrong positions: 0.917 vs 0.913 (difference -0.004, CI -0.015 to +0.007). What transfers is "ECG-like paper", not the layout (pre-registered control; seeds 1-2 running) |
| Renders using measured photo properties vs generic? | No difference (0.916 vs 0.919) |
| Read the photo directly, or digitise it back to a signal first (open digitiser + signal model)? | **Direct reading wins: 0.919 vs 0.856 (+0.062, CI +0.044 to +0.082)**; digitising loses arrhythmia (-0.128) and ischaemia (-0.080) detail |
| Lead-aware model (looks at each of the 12 lead boxes) | Small gain 0.922 vs 0.916 (+0.006, CI includes 0): kept as an ablation |
| Does a large public ECG vision-language model (PULSE-7B) write good reports with no training? | **No:** impression macro-F1 0.458 vs our template 0.734 and R3 0.717; it calls almost everything abnormal (11% normal vs 49% true) |
| Small fine-tuned vision-language model (Qwen2-VL-2B) | 0.309: worse than the classifier-based design |
| Heart-rate reading | mean error 2.5 beats/min |
| Measurements read from the photo | PR 9 ms, QRS 5.8 ms, QTc 14.2 ms, axis 13.5 deg mean error |
| Know when to refer (abstain on uncertain 20%) | disagreement with the cardiologist 0.330 -> 0.240 among accepted reports (-27%) |
| Is the model unsure where the cardiologist was unsure? | Yes: higher uncertainty where remarks were hedged (0.279 vs 0.157 bits) |

### 6c. Which leads does the model look at? (perfect 3D interaction, see 7.4)
Blank out one lead box and measure the change. Clinically expected territories:
- Right bundle-branch block -> V1 (strongest, +2.12 logit), V2 (+0.88).
- Myocardial infarction statements -> V1-V3 and inferior leads aVF, III.
- Ischaemia -> V1-V3, aVF, III.
- Rate -> the long rhythm strip (lead II at the bottom).
Caveat to show in small text: aVR sits next to V1 on the print, so part of its effect may be alignment.

## 7. Interactive 3D ideas (build 3-4 of these, not all)
1. **Hero: the paper ECG.** A slightly curled sheet of pink-grid ECG paper floating in 3D with a synthetic 12-lead
   trace (3 x 4 layout + rhythm strip). A phone outline (camera frustum) moves in and "takes the photo" (flash, shutter);
   the sheet flattens into the model input. Mouse/touch tilts the paper. Reduced motion: still image.
2. **Pipeline scroll story.** On scroll: paper -> photo -> mask -> network blocks (stacked translucent boxes) -> five
   glowing output bars (Normal, Ischaemia, Arrhythmia/block, Rate, Other). Each step has one sentence from section 4.
3. **Paper-condition slider.** A slider/toggles crumple, stain, scan, monitor-photo on the 3D paper (vertex
   displacement + texture), while a chart beside it shows the AUROC staying near 0.84 (section 5c). Message:
   robustness.
4. **Lead explorer.** The 12 lead boxes on the 3D paper; click a finding chip (RBBB, MI, Ischaemia, Rate) and the
   boxes glow by importance (section 6c). Tooltip on each lead.
5. **Shortcut test toggle.** Buttons "full photo / trace erased / trace only" change the paper texture and show
   development scores about 0.89 -> 0.507 -> 0.847 (section 5b; these are development cross-validation numbers,
   not the test set).
6. **Report typewriter.** The synthetic example report types itself line by line next to the paper; a confidence
   meter decides "report" or "refer to cardiologist".

Synthetic ECG waveform: generate each beat as a sum of Gaussians (P, Q, R, S, T) at 75/min, small lead-specific
amplitude changes, 10 mm/mV and 25 mm/s scale on a 1 mm / 5 mm grid. For RBBB demo widen QRS and add an rsR' in V1.
Never trace a real patient ECG.

## 8. Charts to build (2D, interactive, from the numbers above)
- Test-set AUROC per label with 95% CI (dot + interval, sorted).
- "Pre-training" bars: ImageNet 0.892, generic renders 0.919, shuffled-lead 0.917, measured renders 0.916.
- "Read directly vs digitise" paired bars per class.
- Report systems: template 0.734, R3 0.717, PULSE-7B 0.458, Qwen2-VL 0.309 (impression macro-F1).
- Robustness strip: nine physical forms, 0.826-0.844.

## 9. What is next / possibilities (section "Where this goes")
- Blinded reader study: two cardiologists rate reports from four systems (protocol drafted).
- A new prospective test set (150-300 new photos) for paper 2.
- Public release of the dataset under controlled access once permissions are final.
- An offline phone app: photo in, report + "refer" flag out, for clinics without digital ECG.
- Fine-tuning a large ECG vision-language model on this data; better digitisers; more hospitals and phone types.
- Exploratory: an "ECG age" from the photo (age gap +5.6 years in patients with reduced kidney function) - early,
  not in the papers.

## 10. Skills this project shows (for the "what I did" list)
Data collection in a hospital and data auditing; label standardisation with published vocabularies; pre-registered
hypotheses and locked test sets; deep learning (PyTorch, timm, ConvNeXt, vision-language models, LoRA); synthetic data
rendering; cloud GPU training (Google Cloud Vertex AI) on a fixed budget; statistics (bootstrap intervals, paired
comparisons, calibration, selective prediction); OCR of printed values; scientific writing in LaTeX (IEEE JBHI).

## 11. Credits (fill in with the user)
Student: <user's name>. Supervisor: <name>. Co-supervisor/collaborator: Dr Mohammad Ali Moni (Charles Sturt
University). Hospital: Enam Medical College Hospital, Bangladesh. Ask the user before adding any photo of people.
