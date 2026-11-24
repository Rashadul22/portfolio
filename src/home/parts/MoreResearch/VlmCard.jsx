import './MoreResearch.css';

// Render vs phone photo, Qwen2-VL-2B, 40 PTB-XL records, 400 QA pairs.
const ROWS = [
  { q: 'Lead label, top-left panel', a: 100, b: 72.5 },
  { q: 'Lead label, rhythm strip', a: 100, b: 90 },
  { q: 'QRS count, exact', a: 12.5, b: 10 },
  { q: 'Rhythm: regular or irregular', a: 50, b: 50, note: 'Answered "regular" 80 of 80 times: chance level.' },
];
const TICKS = [0, 25, 50, 75, 100];
const fmt = (x) => (Number.isInteger(x) ? x : x.toFixed(1)) + '%';
const clamp = (x) => Math.min(Math.max(x, 6), 94);

export default function VlmCard() {
  return (
    <section className="mr-card" aria-labelledby="mr-vlm-t">
      <p className="mr-tag">Independent study</p>
      <h3 className="mr-title" id="mr-vlm-t">Can vision-language models read paper ECGs?</h3>
      <p className="mr-finding">
        A small model read lead labels well on a clean render, a hand-held phone photo cost it some of that, and
        it did not read rhythm at all: it answered <b>"regular" 80 of 80 times</b>.
      </p>
      <figure className="mr-fig">
        <div className="mr-legend" aria-hidden="true">
          <span><i style={{ background: 'var(--surface)', boxShadow: '0 0 0 2px var(--muted)' }} />Clean render</span>
          <span><i style={{ background: 'var(--trace)' }} />Phone photo</span>
        </div>
        <div className="mr-chart" role="group" aria-label="Accuracy on the clean render and on the phone photo, per question">
          {ROWS.map((r) => {
            const lo = Math.min(r.a, r.b), hi = Math.max(r.a, r.b);
            return (
              <div className="mr-row" key={r.q} tabIndex={0}
                aria-label={`${r.q}: render ${fmt(r.a)}, phone photo ${fmt(r.b)}`}>
                <div className="mr-lab"><span>{r.q}</span></div>
                <div className="mr-track">
                  <div className="mr-axisline" />
                  {hi > lo && <div className="mr-join" style={{ left: lo + '%', width: hi - lo + '%' }} />}
                  <div className="mr-dot mr-photo" style={{ left: r.b + '%' }} />
                  <div className="mr-dot mr-render" style={{ left: r.a + '%' }} />
                  <span className="mr-val" style={{ left: clamp(r.a) + '%', top: 0 }}>{fmt(r.a)}</span>
                  {r.b !== r.a && (
                    <span className="mr-val" style={{ left: clamp(r.b) + '%', bottom: 0, color: 'var(--trace)' }}>{fmt(r.b)}</span>
                  )}
                </div>
                {r.note && <div className="mr-detail">{r.note}</div>}
              </div>
            );
          })}
          <div className="mr-axis" aria-hidden="true">
            <span />
            <div className="mr-ticks">
              {TICKS.map((t) => <span className="mr-tick" key={t} style={{ left: t + '%' }}>{t}%</span>)}
            </div>
          </div>
        </div>
        <table className="mr-sr">
          <caption>Accuracy by question, render vs phone photo</caption>
          <thead><tr><th>Question</th><th>Render</th><th>Phone photo</th></tr></thead>
          <tbody>{ROWS.map((r) => <tr key={r.q}><td>{r.q}</td><td>{fmt(r.a)}</td><td>{fmt(r.b)}</td></tr>)}</tbody>
        </table>
        <figcaption className="mr-figcap">
          40 PTB-XL records, each shown as a clean render and as a phone photograph of the printout; Qwen2-VL-2B,
          400 question-answer pairs.
        </figcaption>
      </figure>
      <div className="mr-foot">
        <span className="mr-status">Status: independent study, dataset public</span>
        <a className="mr-link" href="https://huggingface.co/datasets/rasu22/paper-ecg-vlm-blindspot" target="_blank" rel="noopener noreferrer">Dataset on Hugging Face</a>
      </div>
    </section>
  );
}
