import { SplitTitle } from './fx.jsx'

// A pinned chapter interlude: the title stays on screen (CSS sticky) while the 3D field morphs to the next act
// behind it, so text and camera move together. MorphField reads [data-chapter] elements to drive the morph.
export default function Chapter({ n, title, sub }) {
  return (
    <section className="chapter" data-chapter={n} aria-label={`Chapter ${n}: ${title}`}>
      <div className="chapter__pin">
        <header className="chapter__inner reveal">
          <p className="chapter__n"><span>Chapter</span> {String(n).padStart(2, '0')}</p>
          <SplitTitle as="h2" className="chapter__title" text={title} />
          <p className="chapter__sub">{sub}</p>
        </header>
      </div>
    </section>
  )
}

export const CHAPTERS = [
  { n: 1, title: 'A heartbeat on paper', sub: 'Thesis · reading 12-lead ECGs from a phone photo' },
  { n: 2, title: 'Genes in microgravity', sub: 'NASA OSD-970 · 37 days on the ISS' },
  { n: 3, title: 'Beyond the planet', sub: 'Memberships, credentials and service' },
  { n: 4, title: 'What comes next', sub: 'Research positions and collaboration' },
]
