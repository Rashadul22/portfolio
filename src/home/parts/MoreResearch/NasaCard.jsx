import './MoreResearch.css';

// Log-scale bar: Ucp1 fold change vs 1 (no change). Axis 1 to 20.
const MAXV = 20;
const pos = (v) => (Math.log(v) / Math.log(MAXV)) * 100;
const TICKS = [1, 2, 5, 10, 20];

export default function NasaCard() {
  return (
    <section className="mr-card" aria-labelledby="mr-nasa-t">
      <p className="mr-tag">Independent secondary analysis of public NASA OSDR data</p>
      <h3 className="mr-title" id="mr-nasa-t">Fat-tissue thermogenesis genes in mice after spaceflight</h3>
      <p className="mr-finding">
        In RT-qPCR of 89 thermogenesis genes from gonadal white adipose tissue (OSD-970; 16 female C57BL/6J mice,
        37 days on the ISS, RR-1), <b>Ucp1 was up 12.21-fold</b> (&Delta;&Delta;Ct -3.61, p = 0.0167). Small
        sample: 16 mice; exploratory.
      </p>
      <figure className="mr-fig">
        <div className="mr-chart" role="group" aria-label="Ucp1 fold change on a log scale, compared with 1, no change">
          <div className="mr-row" tabIndex={0} aria-label="Ucp1 fold change 12.21 against 1, no change" style={{ '--mr-col': '150px' }}>
            <div className="mr-lab"><span>Ucp1<small>fold change</small></span></div>
            <div className="mr-track">
              <div className="mr-bar" style={{ width: pos(12.21) + '%' }} />
              <div className="mr-ref1" />
              <span className="mr-val" style={{ left: pos(12.21) + '%', top: 21, transform: 'translateX(8px)', lineHeight: '22px' }}>12.21x</span>
            </div>
          </div>
          <div className="mr-axis" aria-hidden="true">
            <span />
            <div className="mr-ticks">
              {TICKS.map((t) => <span className="mr-tick" key={t} style={{ left: pos(t) + '%' }}>{t}x</span>)}
            </div>
          </div>
        </div>
        <figcaption className="mr-figcap">
          Log scale. Dashed line = 1, no change. Exploratory result from 16 mice; no confidence interval shown.
        </figcaption>
      </figure>
      <div className="mr-foot">
        <span className="mr-status">Status: arXiv preprint, not peer reviewed. Not a NASA affiliation.</span>
        <a className="mr-link" href="https://arxiv.org/abs/2604.02942" target="_blank" rel="noopener noreferrer">arXiv:2604.02942</a>
      </div>
    </section>
  );
}
