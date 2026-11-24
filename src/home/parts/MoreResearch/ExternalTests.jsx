import './MoreResearch.css';

// Macro AUROC, frozen classifier, phone photographs of public ECGs.
const MIN = 0.75, MAX = 0.95;
const pct = (v) => ((v - MIN) / (MAX - MIN)) * 100;
const ROWS = [
  { code: 'DE', name: 'Germany', src: 'PTB-XL', n: 118, v: 0.848, lo: 0.793, hi: 0.900 },
  { code: 'PK', name: 'Pakistan', src: 'CPEIC', n: 491, v: 0.804, lo: 0.780, hi: 0.827, note: 'distinct ECGs' },
  { code: 'US', name: 'USA', src: 'Emory', n: 969, v: 0.907, lo: 0.895, hi: 0.918 },
  { code: 'BD', name: 'Bangladesh (home)', src: 'locked test set', n: 240, v: 0.923, lo: 0.895, hi: 0.946, home: true },
];
const TICKS = [0.75, 0.8, 0.85, 0.9, 0.95];
const f = (x) => x.toFixed(3);

export default function ExternalTests() {
  return (
    <section className="mr-card" aria-labelledby="mr-ext-t">
      <p className="mr-tag">External validation</p>
      <h3 className="mr-title" id="mr-ext-t">Tested beyond one hospital</h3>
      <p className="mr-finding">
        A classifier trained only on phone photographs from Dhaka, <b>frozen with no retraining</b>, was scored on
        phone photographs of public ECGs from three other countries. Macro AUROC ranged from 0.804 to 0.907.
      </p>
      <figure className="mr-fig">
        <figcaption className="mr-legend">Macro AUROC. Dot = estimate, line = 95% confidence interval.</figcaption>
        <div className="mr-chart" role="group" aria-label="Macro AUROC with 95% confidence interval for each dataset">
          {ROWS.map((r) => (
            <div className="mr-row" key={r.code} tabIndex={0}
              aria-label={`${r.name}, ${r.src}, ${r.n} ECGs: macro AUROC ${f(r.v)}, 95% CI ${f(r.lo)} to ${f(r.hi)}`}>
              <div className="mr-lab">
                <span className={'mr-badge' + (r.home ? ' mr-home' : '')} aria-hidden="true">{r.code}</span>
                <span>{r.name}<small>{r.src}</small></span>
              </div>
              <div className="mr-track">
                <div className="mr-axisline" />
                <div className="mr-ci" style={{ left: pct(r.lo) + '%', width: pct(r.hi) - pct(r.lo) + '%' }} />
                <div className={'mr-dot' + (r.home ? ' mr-open' : '')} style={{ left: pct(r.v) + '%' }} />
                <span className="mr-val" style={{ left: pct(r.v) + '%', top: 0 }}>{f(r.v)}</span>
              </div>
              <div className="mr-detail mr-hov">n = {r.n} {r.note || 'ECGs'} · CI {f(r.lo)} to {f(r.hi)}</div>
            </div>
          ))}
          <div className="mr-axis" aria-hidden="true">
            <span />
            <div className="mr-ticks">
              {TICKS.map((t) => <span className="mr-tick" key={t} style={{ left: pct(t) + '%' }}>{t.toFixed(2)}</span>)}
            </div>
          </div>
        </div>
        <table className="mr-sr">
          <caption>Macro AUROC by dataset</caption>
          <thead><tr><th>Dataset</th><th>n</th><th>Macro AUROC</th><th>95% CI</th></tr></thead>
          <tbody>
            {ROWS.map((r) => <tr key={r.code}><td>{r.name} ({r.src})</td><td>{r.n}</td><td>{f(r.v)}</td><td>{f(r.lo)} to {f(r.hi)}</td></tr>)}
          </tbody>
        </table>
        <figcaption className="mr-figcap">
          Open dot and dashed badge = home reference (Bangladesh locked test set, 240 ECGs). Hover or focus a row to see n.
        </figcaption>
      </figure>
      <p className="mr-callout">Referral to a human rose from 20% at home to 41-45% abroad.</p>
      <p className="mr-note">Label sets differ between datasets, so this is not a head-to-head comparison.</p>
      <div className="mr-foot"><span className="mr-status">Status: internal result, paper in preparation</span></div>
    </section>
  );
}
