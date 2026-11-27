// Site text for the academic home page (redesign, 24 Nov 2026).
// Thesis numbers: notes/thesis-brief.md and the ECG project's reports/test_results_final.md (locked test, opened once).
// Rules: no "first/novel" claims; no patient images; static numbers only.

export const person = {
  name: 'Md Rashadul Islam',
  role: 'Research portfolio · Medical AI',
  tagline: 'Medical AI beyond clean digital data.',
  seeking: 'Open to MSc and PhD positions, and to research collaborations on medical data.',
  position: 'Research Assistant, NanoBio Technology Center, Daffodil International University (since May 2026)',
  affiliation: 'B.Sc. Computer Science and Engineering, Daffodil International University, Dhaka (2026)',
  intro:
    'I study how machine learning can extract reliable clinical information from imperfect medical records: smartphone photographs of paper 12-lead ECGs, with a locked test set, robustness tests and external evaluation.',
  email: 'islam15-6062@s.diu.edu.bd',
  links: [
    ['Email', 'mailto:islam15-6062@s.diu.edu.bd'],
    ['Google Scholar', 'https://scholar.google.com/citations?user=w472eK4AAAAJ&hl=en'],
    ['arXiv', 'https://arxiv.org/search/?searchtype=author&query=Rashadul+Islam'],
    ['GitHub', 'https://github.com/Rashadul22'],
    ['LinkedIn', 'https://www.linkedin.com/in/rashadul-islam-73790a241'],
  ],
  cv: null, // TODO: CV PDF -> public/cv.pdf, then set to 'cv.pdf'
}

export const facts = [
  ['1,191', 'smartphone photographs of paper ECGs, 1,175 patients'],
  ['0.923', 'test macro AUROC (95% CI 0.895–0.946), locked test set opened once'],
  ['9', 'physical forms of the same 977 public ECGs (scanned, crumpled, stained, on a monitor): macro AUROC 0.826–0.844'],
]

// Locked test set, n = 240 (paper 1, final labels)
export const testAuroc = [
  ['Rate abnormality', 0.993, 0.985, 0.998],
  ['Ischaemia', 0.923, 0.863, 0.967],
  ['Normal', 0.907, 0.869, 0.941],
  ['Arrhythmia / block', 0.868, 0.791, 0.935],
  ['Other', 0.703, 0.607, 0.79],
]

export const research = [
  {
    id: 'ecg',
    tag: 'B.Sc. thesis · 2025–2026 · Enam Medical College Hospital',
    title: 'Reading paper ECGs from a smartphone photograph',
    finding:
      'On 240 held-out records, opened once after the labels were fixed, a plain ConvNeXt-Tiny reached a macro AUROC of 0.923 (95% CI 0.895–0.946); arrhythmia and conduction block remain the weak spot (sensitivity 0.42).',
    detail:
      'Paper 1 describes the dataset (1,191 photographs, cardiologist labels; not yet public, to be released with the paper) and a pre-specified evaluation protocol with external tests in Germany, Pakistan and the USA. Paper 2 generates a structured written report from the same photograph.',
    status: 'Two manuscripts in preparation for IEEE JBHI',
    links: [['Interactive thesis page', 'thesis/']],
  },
]

// "The same signal": ECG-Image-Database, set D0 = 977 public PTB-XL ECGs in nine physical forms.
// Final-label model, no retraining. Source: ECG project reports/external/v1/eidb_metrics.csv + eidb_paired.csv
// (macro = mean AUROC of Normal, Ischaemia, Arrhythmia/block, Rate; diff = paired change vs the clean render,
// mean of the four per-class paired differences). Paper 1 results.tex: 0.826-0.844 across all nine forms.
export const forms = [
  { id: 'render', label: 'Clean render', macro: 0.833, diff: null, note: 'The digital ECG drawn as a printout: the reference.' },
  { id: 'scan', label: 'Colour scan', macro: 0.829, diff: -0.004, note: 'Printed, then scanned in colour.' },
  { id: 'bw', label: 'B&W scan', macro: 0.832, diff: -0.001, note: 'Printed, then scanned in black and white.' },
  { id: 'photo', label: 'Phone photo', macro: 0.838, diff: 0.006, note: 'A phone photograph of the clean paper.' },
  { id: 'monitor', label: 'Monitor photo', macro: 0.844, diff: 0.011, note: 'A phone photograph of the ECG shown on a screen.' },
  { id: 'crumpled', label: 'Crumpled', macro: 0.842, diff: 0.009, note: 'A phone photograph of crumpled paper.' },
  { id: 'stained', label: 'Stained', macro: 0.841, diff: 0.008, note: 'A phone photograph of stained paper.' },
  { id: 'stainscan', label: 'Stained, colour scan', macro: 0.826, diff: -0.007, note: 'Stained paper, scanned in colour.' },
  { id: 'stainbw', label: 'Stained, B&W scan', macro: 0.827, diff: -0.006, note: 'Stained paper, scanned in black and white.' },
]

// Manuscripts (titles from the user's JBHI drafts, 25 Nov 2026). Not submitted: never link the PDFs.
export const manuscripts = [
  { title: 'Smartphone Photographs of Paper 12-Lead Electrocardiograms: A Dataset and Pre-Specified Evaluation With External Testing',
    authors: 'M. R. Islam, M. A. Hossain, M. A. Moni', status: 'Manuscript in preparation (target: IEEE JBHI)' },
  { title: 'Classifier-Gated Structured Reports From Smartphone Photographs of Printed 12-Lead Electrocardiograms',
    authors: 'M. R. Islam, M. A. Hossain, M. A. Moni (author order to be confirmed)', status: 'Manuscript in preparation (target: IEEE JBHI)' },
]
