import './sections.css'
import { credentials } from '../../../content.js'

export default function Credentials() {
  return (
    <section className="wrap sx-sec" id="credentials" aria-labelledby="sx-cred-h">
      <p className="eyebrow">Credentials</p>
      <h2 id="sx-cred-h">Memberships and access</h2>
      <ul className="sx-cred">
        {credentials.map(([name, detail]) => (
          <li key={name}><strong>{name}</strong><span>{detail}</span></li>
        ))}
      </ul>
    </section>
  )
}
