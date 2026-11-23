// Blueprint intro (first visit only): an ECG line draws itself, the R-peak flashes, then the site appears.
// Pure CSS animation, so it plays before JavaScript loads and never blocks the page; index.html adds
// `intro-seen` to <html> on repeat visits, and reduced motion hides it.
export default function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <svg viewBox="0 0 600 120" className="intro__ecg">
        <path d="M0 70 H150 l14 -6 l14 6 H230 l8 10 l14 -70 l14 78 l10 -18 H330 q22 -22 44 0 H600" pathLength="1" />
      </svg>
      <p className="intro__name">Md Rashadul Islam</p>
      <p className="intro__sub">From a heartbeat to the stars</p>
    </div>
  )
}
