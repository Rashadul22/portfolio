import { useEffect, useRef, useState } from 'react';
import './ReportCard.css';

// Synthetic example report (not a patient).
const LINES = [
  ['Rate', '112/min (sinus tachycardia)'],
  ['Findings', 'Right bundle-branch block; ST depression V4-V6'],
  ['Impression', 'Abnormal ECG - Arrhythmia/block, Ischaemia, Rate abnormality'],
  ['Advice', 'Clinical correlation; consider echocardiography'],
  ['Confidence', 'high (no referral)'],
];
const TOTAL = LINES.reduce((n, [k, v]) => n + k.length + 2 + v.length, 0);

// Paired differences (report minus template), internal test set, n = 240.
const LO = -0.04, HI = 0.12;
const pos = (x) => ((x - LO) / (HI - LO)) * 100 + '%';
const DIFFS = [
  { name: 'Impression macro-F1', a: '0.738', b: '0.734', d: 0.005, lo: -0.015, hi: 0.027, txt: '+0.005 (-0.015 to +0.027)', note: 'non-inferior (pre-specified)' },
  { name: 'Statement F1', a: '0.551', b: '0.497', d: 0.054, lo: 0.006, hi: 0.103, txt: '+0.054 (+0.006 to +0.103)', note: 'more correct findings' },
];

function Slip({ typed }) {
  // typed = number of characters shown; null = all
  let left = typed == null ? Infinity : typed;
  const active = typed != null && typed < TOTAL;
  return (
    <div className="rc-slip" role="img" aria-label={'Synthetic example report. ' + LINES.map(([k, v]) => k + ': ' + v).join('. ')}>
      <div className="rc-slip-head" aria-hidden="true">Synthetic example, not a patient</div>
      <div className="rc-slip-body" aria-hidden="true">
        {LINES.map(([k, v], i) => {
          const full = k + ': ' + v;
          const n = Math.max(0, Math.min(full.length, left));
          left -= full.length + 2 - 2; // line length (newline costs nothing)
          const shown = full.slice(0, n), rest = full.slice(n);
          const cur = active && n < full.length && (n > 0 || i === 0 || left + full.length > 0) && n > 0 || (active && n === 0 && i > 0 && Math.max(0, Math.min(LINES[i - 1].join(': ').length, 1e9)) >= 0 && false);
          const kl = Math.min(k.length + 1, shown.length);
          return (
            <div className="rc-line" key={k}>
              <b>{shown.slice(0, kl)}</b>{shown.slice(kl)}
              {cur && <span className="rc-caret" />}
              <span className="rc-rest">{rest}</span>
            </div>
          );
        })}
      </div>
      <div className="rc-tear" aria-hidden="true" />
    </div>
  );
}

function Gate() {
  const steps = ['Photo', 'Classifier', 'Gate', 'Report'];
  return (
    <figure className="rc-gate">
      <ol className="rc-flow" aria-label="Pipeline: photo, classifier, gate, report">
        {steps.map((s) => <li key={s} className={s === "Gate" ? "rc-gatebox" : ""}>{s}</li>)}
      </ol>
      <figcaption>The report can never contradict the classifier: statements are only written when the classifier agrees.</figcaption>
    </figure>
  );
}

export default function ReportCard() {
  const ref = useRef(null);
  const [typed, setTyped] = useState(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    let timer;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect(); // once only
      let n = 0;
      setTyped(0);
      timer = setInterval(() => {
        n += 1;
        setTyped(n);
        if (n >= TOTAL) { clearInterval(timer); setTyped(null); }
      }, 25);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); };
  }, []);

  return (
    <article className="rc-card" aria-labelledby="rc-title">
      <p className="rc-status">Manuscript in preparation &middot; target IEEE JBHI</p>
      <h3 id="rc-title" className="rc-title">Classifier-Gated Structured Reports From Smartphone Photographs of Printed 12-Lead Electrocardiograms</h3>
      <p className="rc-authors">M. R. Islam, M. A. Hossain, M. A. Moni (author order to be confirmed)</p>
      <p className="rc-finding">A frozen system writes four-line cardiologist-style reports from the photo without losing diagnostic accuracy, and adds more correct findings than a template.</p>

      <div className="rc-grid">
        <div ref={ref}><Slip typed={typed} /></div>
        <Gate />
      </div>

      <h4 className="rc-h">Internal test set, 240 photographs (opened once for this paper)</h4>
      <ul className="rc-rows">
        {DIFFS.map((r) => (
          <li key={r.name} className="rc-row">
            <div className="rc-rl"><strong>{r.name}</strong>: report {r.a} vs template {r.b}</div>
            <div className="rc-plot" aria-hidden="true">
              <span className="rc-zero" style={{ left: pos(0) }} />
              <span className="rc-ci" style={{ left: pos(r.lo), width: `calc(${pos(r.hi)} - ${pos(r.lo)})` }} />
              <span className="rc-dot" style={{ left: pos(r.d) }} />
            </div>
            <div className="rc-rv">Difference {r.txt}: {r.note}</div>
          </li>
        ))}
        <li className="rc-row"><div className="rc-rl"><strong>Heart-rate error</strong>: 1.9 beats/min (mean absolute)</div></li>
        <li className="rc-row"><div className="rc-rl"><strong>PULSE-7B</strong> (7-billion-parameter ECG vision-language model, zero-shot): impression macro-F1 0.443</div></li>
        <li className="rc-row"><div className="rc-rl"><strong>Referral</strong>: about 20% of photographs are referred to a human by an uncertainty rule fixed on development data</div></li>
      </ul>
      <p className="rc-axis">Interval plots: difference from template, 95% CI; the vertical line marks zero.</p>
    </article>
  );
}
