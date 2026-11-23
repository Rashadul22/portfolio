import {
  profile, education, research, publications, skills, credentials, languages, beyond, community,
} from '../content.js'

function Head({ id, kicker, title }) {
  return (
    <header className="sec__head reveal">
      <p className="kicker">{kicker}</p>
      <h2 id={id} className="sec__title">{title}</h2>
    </header>
  )
}

export function Research() {
  return (
    <section className="sec" id="research" aria-labelledby="research-title">
      <Head id="research-title" kicker="01 · Research" title="Selected projects" />
      <div className="projects">
        {research.map((p) => (
          <article className="project reveal" key={p.title}>
            <p className="project__tag">{p.tag}</p>
            <h3 className="project__title">{p.title}</h3>
            <p className="project__summary">{p.summary}</p>
            <dl className="metrics">
              {p.metrics.map(([v, l]) => (
                <div className="metric" key={l}>
                  <dt>{l}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <ul className="project__points">
              {p.points.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <div className="project__foot">
              <ul className="chips" aria-label="Tools">
                {p.tools.map((t) => <li key={t}>{t}</li>)}
              </ul>
              {p.link && (
                <a className="arrow-link" href={p.link[1]} target="_blank" rel="noopener noreferrer">
                  {p.link[0]} <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Pub({ p, status }) {
  const title = p.url
    ? <a href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a>
    : p.title
  return (
    <li className="pub reveal">
      <span className="pub__year">{p.year || status}</span>
      <div>
        <p className="pub__title">{title}</p>
        <p className="pub__meta">
          {p.authors && <><strong>{p.authors}</strong> · </>}
          {p.venue || p.note}
        </p>
      </div>
    </li>
  )
}

export function Publications() {
  const groups = [
    ['Peer-reviewed', publications.peerReviewed],
    ['Preprints', publications.preprints],
    ['In preparation', publications.inPreparation],
  ]
  return (
    <section className="sec" id="publications" aria-labelledby="pub-title">
      <Head id="pub-title" kicker="02 · Publications" title="Papers and preprints" />
      {groups.map(([label, items]) => (
        <div className="pubgroup" key={label}>
          <h3 className="pubgroup__label reveal">{label}</h3>
          <ul className="pubs">
            {items.map((p) => <Pub key={p.title} p={p} status="In prep." />)}
          </ul>
        </div>
      ))}
    </section>
  )
}

export function About() {
  return (
    <section className="sec" id="about" aria-labelledby="about-title">
      <Head id="about-title" kicker="03 · About" title="Research interests" />
      <div className="about">
        <p className="about__lead reveal">{profile.interests}</p>

        <div className="cols">
          <div className="reveal">
            <h3 className="sub">Education</h3>
            <ul className="timeline">
              {education.map((e) => (
                <li key={e.degree}>
                  <p className="timeline__when">{e.period}</p>
                  <p className="timeline__what">{e.degree}</p>
                  <p className="timeline__where">{e.place}</p>
                  {e.details.map((d) => <p className="timeline__note" key={d}>{d}</p>)}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <h3 className="sub">Skills</h3>
            <dl className="kv">
              {skills.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
              <div><dt>Languages</dt><dd>{languages}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Credentials() {
  return (
    <section className="sec" id="credentials" aria-labelledby="cred-title">
      <Head id="cred-title" kicker="04 · Credentials" title="Memberships, awards and service" />
      <ul className="cards">
        {credentials.map(([t, d]) => (
          <li className="card reveal" key={t}>
            <h3 className="card__title">{t}</h3>
            <p className="card__text">{d}</p>
          </li>
        ))}
      </ul>

      <div className="cols cols--tight">
        <div className="reveal">
          <h3 className="sub">Community</h3>
          <dl className="kv">
            {community.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
        <div className="reveal">
          <h3 className="sub">Beyond the lab</h3>
          <dl className="kv">
            {beyond.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  const L = profile.links
  const rows = [
    ['Email', profile.email, `mailto:${profile.email}`],
    ['GitHub', 'github.com/Rashadul22', L.github],
    ['LinkedIn', 'linkedin.com/in/rashadul-islam', L.linkedin],
    ['arXiv', 'Author listing', L.arxiv],
    ['Hugging Face', 'rasu22 · paper-ECG VLM dataset', L.huggingface],
    L.scholar && ['Google Scholar', 'Profile', L.scholar],
  ].filter(Boolean)
  return (
    <section className="sec sec--contact" id="contact" aria-labelledby="contact-title">
      <Head id="contact-title" kicker="05 · Contact" title="Open to research positions and collaboration" />
      <p className="contact__lead reveal">
        Looking for research assistant roles, Master&apos;s / PhD positions and collaborations in machine learning for
        healthcare. Based in {profile.location}.
      </p>
      <a className="btn btn--primary btn--lg reveal" href={`mailto:${profile.email}`}>Email me</a>
      <ul className="links reveal">
        {rows.map(([k, v, href]) => (
          <li key={k}>
            <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <span className="links__k">{k}</span>
              <span className="links__v">{v}</span>
              <span className="links__arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <p>© 2026 {profile.name}</p>
      <p>Built with React and Three.js</p>
    </footer>
  )
}
