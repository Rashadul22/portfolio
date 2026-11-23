// Thesis numbers. Source: notes/thesis-brief.md (23 Nov 2026, manuscript draft; may change in peer review).
// Nothing here is invented: where the brief gives only a range or a statement, the page shows only that.

export const testSet = [
  { label: 'Primary (macro)', value: 0.923, lo: 0.895, hi: 0.946, primary: true, note: 'Macro of Normal, Ischaemia, Arrhythmia/block, Rate' },
  { label: 'Normal', value: 0.907, lo: 0.869, hi: 0.941, extra: 'Sensitivity 0.94 · Specificity 0.67 · 114 positives' },
  { label: 'Ischaemia', value: 0.923, lo: 0.863, hi: 0.967, extra: 'Sensitivity 0.83 · Specificity 0.87 · 36 positives' },
  { label: 'Arrhythmia/block', value: 0.868, lo: 0.791, hi: 0.935, extra: 'Sensitivity 0.42 · Specificity 0.94 · 26 positives' },
  { label: 'Rate abnormality', value: 0.993, lo: 0.985, hi: 0.998, extra: 'Sensitivity 0.86 · Specificity 0.99 · 74 positives' },
  { label: 'Other', value: 0.703, lo: 0.607, hi: 0.79, extra: 'Sensitivity 0.57 · Specificity 0.71 · 42 positives' },
]

export const dataFacts = [
  ['1,191', 'smartphone photos of paper ECGs'],
  ['1,175', 'patients, after merging 10 duplicate printouts'],
  ['6', 'capture sessions, 2 phone types'],
  ['240', 'test records, opened exactly once (21 Nov 2026)'],
]

export const labels = ['Normal', 'Ischaemia', 'Arrhythmia/conduction block', 'Rate abnormality', 'Other']

export const audit = [
  ['Duplicates', '10 pairs of the same printout had been entered twice — merged.'],
  ['Silent imputation', 'The clinical spreadsheet had quietly filled blanks with imputed values — restored to missing.'],
  ['Clipped values', 'ECG values were clipped (exactly 8 records at the minimum and maximum of every field) — 40 cells corrected by reading the printed header from the photos (98–99% agreement with known values).'],
  ['Readable text', '22% of images carried printed or handwritten text — masked so the model cannot read it.'],
]

export const pipeline = [
  { k: 'Paper', t: 'A 12-lead ECG printed on thermal paper', d: 'Often the only record: no digital signal is kept.' },
  { k: 'Photo', t: 'A phone photograph', d: 'Phones, light, tilt, curl, shadows and handwriting all vary.' },
  { k: 'Crop + mask', t: 'Crop the sheet, mask the text band', d: 'Raw colour kept: no grayscale, no contrast tricks, no flips — a mirrored ECG is a different ECG.' },
  { k: '448 × 1024', t: 'Resize to 448 × 1024', d: 'Enough detail for the waveform; higher resolution gave no measurable gain.' },
  { k: 'ConvNeXt-Tiny', t: 'A deliberately plain model', d: 'ConvNeXt-Tiny from an ImageNet start; 3 seeds × 5 folds = 15 models averaged.' },
  { k: '5 outputs', t: 'Five probabilities', d: 'Normal, Ischaemia, Arrhythmia/block, Rate abnormality, Other (multi-label).' },
  { k: 'Thresholds', t: 'Thresholds fixed on development data only', d: 'The locked test set never touches a decision.' },
]

// Illustrative output for the synthetic example (NOT a patient, NOT a measured result)
export const exampleOutputs = [
  ['Normal', 0.06], ['Ischaemia', 0.71], ['Arrhythmia/block', 0.83], ['Rate', 0.95], ['Other', 0.14],
]

export const shortcut = {
  full: { label: 'Full photo', value: 0.892, text: 'The normal input: paper, grid and trace.' },
  erased: { label: 'Trace erased', value: 0.507, text: 'Paper and grid kept, waveform removed: chance level. The model needs the waveform.' },
  trace: { label: 'Trace only', value: 0.847, text: 'Only the waveform on white: most of the signal survives.' },
}

export const robustForms = [
  'Digital render', 'Colour scan', 'B&W scan', 'Phone photo, clean', 'Phone photo, crumpled', 'Phone photo, stained', 'Photo of a monitor',
]

export const leadFindings = {
  RBBB: { label: 'Right bundle-branch block', strong: ['V1'], medium: ['V2'], note: 'Blanking V1 changes the logit most (+2.12), then V2 (+0.88).', rbbb: true },
  MI: { label: 'Myocardial infarction', strong: ['V1', 'V2', 'V3'], medium: ['aVF', 'III'], note: 'Infarction statements rely on V1–V3 and the inferior leads aVF and III.' },
  Ischaemia: { label: 'Ischaemia', strong: ['V1', 'V2', 'V3'], medium: ['aVF', 'III'], note: 'Ischaemia relies on V1–V3, aVF and III.' },
  Rate: { label: 'Rate', strong: ['II rhythm'], medium: [], note: 'Rate is read from the long lead II rhythm strip at the bottom.' },
}

export const pretraining = [
  { label: 'ImageNet start', value: 0.892 },
  { label: 'Synthetic renders', value: 0.919, primary: true, extra: '+0.027 vs ImageNet (CI +0.011 to +0.042); Arrhythmia/block +0.086' },
  { label: 'Shuffled-lead renders', value: 0.917, extra: 'Leads in wrong positions: −0.004 vs layout-matched (CI −0.015 to +0.007)' },
  { label: 'Measured-photo renders', value: 0.916, extra: 'Renders using measured photo properties: no difference' },
]

export const directVsDigitise = [
  { label: 'Read the photo directly', value: 0.919, primary: true },
  { label: 'Digitise to signal first', value: 0.856, extra: '−0.062 (CI −0.082 to −0.044); loses Arrhythmia/block (−0.128) and Ischaemia (−0.080)' },
]

export const reportSystems = [
  { label: 'Template (ours)', value: 0.734 },
  { label: 'R3, classifier-gated (ours)', value: 0.717, primary: true, extra: 'Chosen: the report can never contradict the classifier' },
  { label: 'PULSE-7B, no training', value: 0.458, extra: 'Calls almost everything abnormal (11% normal vs 49% true)' },
  { label: 'Qwen2-VL-2B, fine-tuned', value: 0.309 },
]

export const reportFacts = [
  ['2.5 /min', 'mean heart-rate error'],
  ['9 · 5.8 · 14.2 ms', 'PR · QRS · QTc mean error'],
  ['−27%', 'disagreement with the cardiologist when the uncertain 20% are referred (0.330 → 0.240)'],
  ['0.279 vs 0.157', 'bits of model uncertainty where the cardiologist hedged vs did not'],
]

export const exampleReport = [
  ['Rate', '112/min (sinus tachycardia)'],
  ['Findings', 'Right bundle-branch block; ST depression V4–V6'],
  ['Impression', 'Abnormal ECG — Arrhythmia/block, Ischaemia, Rate abnormality'],
  ['Advice', 'Clinical correlation; consider echocardiography'],
  ['Measurements', 'PR 160 ms, QRS 128 ms, QTc 452 ms, axis +75'],
]

export const negatives = [
  ['Higher image resolution', 'No measurable gain.'],
  ['Grid rectification', 'Flattening the paper geometrically: +0.011, interval includes 0.'],
  ['Photo-quality scores', 'Measured blur and lighting do not predict errors.'],
  ['Lab values from the ECG photo', 'Anaemia and kidney function: not better than age + sex.'],
]

export const next = [
  ['Blinded reader study', 'Two cardiologists rate reports from four systems (protocol drafted).'],
  ['Prospective test set', '150–300 new photos for paper 2.'],
  ['Controlled-access release', 'Public release of the dataset once permissions are final.'],
  ['Offline phone app', 'Photo in, report and a “refer” flag out — for clinics without digital ECG.'],
  ['Bigger models, more sites', 'Fine-tuning a large ECG vision-language model; better digitisers; more hospitals and phone types.'],
  ['ECG age (exploratory)', 'An “ECG age” from the photo: +5.6 years in patients with reduced kidney function. Early; not in the papers.'],
]

export const skills = [
  'Hospital data collection and data auditing', 'Label standardisation with published vocabularies',
  'Pre-registered hypotheses, locked test sets', 'PyTorch, timm, ConvNeXt', 'Vision-language models, LoRA',
  'Synthetic data rendering', 'Cloud GPU training on a fixed budget (Vertex AI)',
  'Bootstrap intervals, paired comparisons, calibration, selective prediction', 'OCR of printed values', 'LaTeX, IEEE JBHI',
]
