// Thesis numbers. Source: notes/thesis-brief.md (23 Nov 2026, manuscript draft; may change in peer review).

export const testSet = [
  { label: 'Primary (macro)', auroc: 0.923, lo: 0.895, hi: 0.946, primary: true, note: 'Macro of Normal, Ischaemia, Arrhythmia/block, Rate' },
  { label: 'Normal', auroc: 0.907, lo: 0.869, hi: 0.941, sens: 0.94, spec: 0.67, pos: 114 },
  { label: 'Ischaemia', auroc: 0.923, lo: 0.863, hi: 0.967, sens: 0.83, spec: 0.87, pos: 36 },
  { label: 'Arrhythmia/block', auroc: 0.868, lo: 0.791, hi: 0.935, sens: 0.42, spec: 0.94, pos: 26 },
  { label: 'Rate abnormality', auroc: 0.993, lo: 0.985, hi: 0.998, sens: 0.86, spec: 0.99, pos: 74 },
  { label: 'Other', auroc: 0.703, lo: 0.607, hi: 0.79, sens: 0.57, spec: 0.71, pos: 42 },
]
