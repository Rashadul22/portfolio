const links = [
  ['Research', '#research'],
  ['Publications', '#publications'],
  ['About', '#about'],
  ['Credentials', '#credentials'],
  ['Contact', '#contact'],
]

export default function Nav() {
  return (
    <header className="nav">
      <a className="nav__brand" href="#main">
        <span className="nav__mark" aria-hidden="true">RI</span>
        <span className="nav__name">Rashadul Islam</span>
      </a>
      <nav aria-label="Primary">
        <ul className="nav__links">
          {links.map(([label, href]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
