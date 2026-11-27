// Single source of truth for site text. Source: CV (Md_Rashadul_Islam_CV (5).pdf), read 2026-11-23.
// Phone number deliberately NOT included on the public site.

export const profile = {
  name: 'Md Rashadul Islam',
  role: 'AI Researcher',
  location: 'Uttara, Dhaka, Bangladesh',
  email: 'islam15-6062@s.diu.edu.bd',
  domain: 'rashadul.me',
  links: {
    github: 'https://github.com/Rashadul22',
    linkedin: 'https://www.linkedin.com/in/rashadul-islam-73790a241',
    arxiv: 'https://arxiv.org/search/?searchtype=author&query=Rashadul+Islam',
    huggingface: 'https://huggingface.co/datasets/rasu22/paper-ecg-vlm-blindspot',
    scholar: null, // TODO: Google Scholar URL (a link in the CV, not readable from the PDF text)
  },
  interests:
    'Machine learning for medical data: combining images, physiological signals and clinical records to support diagnosis, with a focus on settings where data, equipment and expertise are limited. Also physiological time-series modelling, and making model predictions explainable and reliable enough to be trusted.',
}

export const heroStats = [
  ['0.922', 'AUC', 'NASA OSD-970, first ML re-analysis'],
  ['1,191', 'ECG photos', 'smartphone photos of paper ECGs, 1,175 patients'],
  ['5', 'papers', '2 peer-reviewed · 3 arXiv preprints'],
]

export const education = [
  {
    degree: 'B.Sc. in Computer Science and Engineering',
    place: 'Daffodil International University, Dhaka',
    period: 'Jul 2022 – Jun 2026',
    details: [
      'Final-year project grade A+ (4.00 / 4.00)',
      'Thesis supervisor: Dr. Md. Ali Hossain, Associate Professor and Director, NanoBio Technology Center, DIU',
    ],
  },
  { degree: 'Higher Secondary Certificate', place: 'Milestone College, Dhaka', period: '2020', details: ['GPA 5.00 / 5.00'] },
  { degree: 'Secondary School Certificate', place: 'Milestone College, Dhaka', period: '2018', details: ['GPA 5.00 / 5.00'] },
]

export const research = [
  {
    // Thesis numbers from notes/thesis-brief.md (supersedes the CV text; manuscript draft)
    tag: 'B.Sc. thesis · 2025 – 2026 · Interactive page',
    title: 'Reading paper ECGs from a phone photo',
    summary:
      'A dataset of 1,191 smartphone photographs of paper ECGs from Enam Medical College Hospital (1,175 patients), each labelled from the cardiologist’s own written remark, and a strict evaluation protocol around it. A deliberately plain image model (ConvNeXt-Tiny) reads the photo directly.',
    metrics: [['0.923', 'Test macro AUROC'], ['1,191', 'ECG photos'], ['0.83–0.89', 'External AUROC'], ['240', 'Locked test records']],
    points: [
      'Locked test set opened once; 95% CI 0.895–0.946. Checks show the model reads the waveform, not shortcuts.',
      'Robust to crumpling, stains and scanning: nine physical forms of the same ECGs score 0.826–0.844.',
      'Paper 1: manuscript in preparation for IEEE JBHI. Paper 2 (photo to written report): in progress.',
    ],
    tools: ['PyTorch', 'timm', 'ConvNeXt', 'Vision-language models', 'Vertex AI'],
    link: ['Explore the interactive thesis', 'thesis/'],
  },
  {
    tag: 'Independent research · Oct 2026',
    title: 'Can vision-language models read paper ECGs? A blind-spot evaluation',
    summary:
      'Paired evaluation set from PTB-XL: 40 records rendered as clean 12-lead printouts and re-photographed by hand after laser printing, balanced across five diagnostic superclasses. Qwen2-VL-2B evaluated over 400 question–answer pairs.',
    metrics: [['100→72.5%', 'Label reading'], ['12.5%', 'QRS counting'], ['80/80', 'Same rhythm answer'], ['400', 'QA pairs']],
    points: [
      'Printed-label reading degraded under phone capture; waveform-level competence was absent in both conditions.',
      'Dataset, raw model outputs and analysis released publicly on Hugging Face.',
    ],
    tools: ['PTB-XL', 'Qwen2-VL', 'Hugging Face'],
    link: ['Dataset on Hugging Face', 'https://huggingface.co/datasets/rasu22/paper-ecg-vlm-blindspot'],
  },
  {
    tag: 'Independent research · Mar – Apr 2026',
    title: 'First machine-learning re-analysis of NASA OSD-970 (ISS microgravity)',
    summary:
      'RT-qPCR data for 89 thermogenesis genes from 16 female C57BL/6J mice flown on the RR-1 ISS mission (37 days microgravity). Quantified a 12.21-fold Ucp1 upregulation in gonadal white adipose tissue (ΔΔCt = −3.61, p = 0.0167).',
    metrics: [['12.21×', 'Ucp1 fold change'], ['0.922', 'AUC (LOO-CV)'], ['0.812', 'Accuracy'], ['0.824', 'F1']],
    points: [
      'Seven classifiers and a custom PyTorch network under leave-one-out cross-validation.',
      'SHAP identified the Angpt2–Jun–Irs2–Klf2 axis as a co-regulated microgravity-response module.',
    ],
    tools: ['scikit-learn', 'XGBoost', 'PyTorch', 'SHAP', 'NASA OSDR'],
    link: ['arXiv:2604.02942', 'https://arxiv.org/abs/2604.02942'],
  },
]

export const publications = {
  peerReviewed: [
    { authors: 'M. R. Islam et al.', title: 'Tomato Maturity Detection and Quality Grading System Using Deep Learning', venue: 'IEEE ICCCNT 2025, IIT Indore, India', year: '2025' },
    { authors: 'M. R. Islam et al.', title: 'Pneumonia Detection from Chest X-Ray Using Deep Learning Techniques: A Comparative Study', venue: 'Book chapter, Taylor & Francis (Advances in Medical Imaging); presented at IDAA 2025', year: '2025' },
  ],
  preprints: [
    { authors: 'M. R. Islam', title: 'ExoNet: Calibrated Multimodal Deep Learning for TESS Exoplanet Candidate Vetting using Phase-Folded Light Curves, Stellar Parameters, and Multi-Head Attention', venue: 'arXiv:2604.15560 [astro-ph.EP]', year: '2026', url: 'https://arxiv.org/abs/2604.15560' },
    { authors: 'M. R. Islam', title: 'Explainable Machine Learning Reveals 12-Fold Ucp1 Upregulation and Thermogenic Reprogramming in Female Mouse White Adipose Tissue After 37 Days of Microgravity', venue: 'arXiv:2604.02942 [cs.LG]', year: 'Apr 2026', url: 'https://arxiv.org/abs/2604.02942' },
    { authors: 'M. R. Islam', title: 'An Explainable Agentic AI Framework for Uncertainty-Aware and Abstention-Enabled Acute Ischemic Stroke Imaging Decisions', venue: 'arXiv:2601.01008 [eess.IV]', year: 'Jan 2026', url: 'https://arxiv.org/abs/2601.01008' },
  ],
  inPreparation: [
    { title: 'Paper ECG photographs dataset and evaluation protocol (thesis, paper 1)', note: 'Manuscript in preparation for IEEE JBHI · working description, not the final title' },
    { title: 'From a phone photo of a paper ECG to a written report (thesis, paper 2)', note: 'In progress · working description' },
    { title: 'Bridging the Generalization Gap in Sepsis Mortality Prediction: A Feature-Audited CatBoost Framework with Cross-Database Validation', note: 'Data access approved; external validation on MIMIC-IV and eICU in progress' },
  ],
}

export const skills = [
  ['Programming', 'Python (primary), SQL, C++, LaTeX; Git, Jupyter, Google Colab'],
  ['Libraries', 'PyTorch, scikit-learn, XGBoost, CatBoost, Hugging Face Transformers, OpenCV, SHAP'],
  ['Methods', 'Multimodal late fusion, multi-label classification, class-imbalance handling, cross-dataset validation, explainability (SHAP, Grad-CAM)'],
  ['Data', 'PhysioNet credentialed (MIMIC-IV, eICU), PTB-XL, NASA OSDR; primary clinical data collection, de-identification, preparation for a future public release'],
]

export const credentials = [
  ['NASA Open Science Data Repository', 'Member, AI/ML Analysis Working Group'],
  ['PhysioNet Credentialed Researcher', 'Approved access to restricted clinical databases, including MIMIC-IV and eICU'],
  ['IEEE Student Member · ID 102042258', 'Computer Society, EMBS, Computational Intelligence Society, ComSoc, Information Theory Society; IEEE SIGHT'],
  ['University Merit Scholarship', 'Daffodil International University'],
  ['Seminar organising volunteer', 'Smart Nanomaterials: Medicine, Energy, Material Science and AI — NanoBio Technology Center, DIU (Jan 2026); volunteer research assistance 2025–2026'],
]

export const languages = 'Bengali (native); English (fluent in academic reading, writing and research communication)'

// Kept from the old site (not in the CV) — confirm with user before final.
export const beyond = [
  ['Marathon running', 'Long-distance runner; local and regional marathons.'],
  ['Football', 'Team play and reading patterns quickly.'],
  ['Three cats', 'Choto, Jaba and Chiku.'],
  ['Cinema', 'Sci-fi, drama, thrillers.'],
]
export const community = [
  ['SCARS · Rajuk Uttara Model College', 'Winter clothing collection and distribution for underprivileged communities in Dhaka.'],
  ['Smile More Initiative', 'Clothing and food distribution for disadvantaged children across Dhaka.'],
]
