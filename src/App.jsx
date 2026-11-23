import { lazy, Suspense, useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import { Research, Publications, About, Credentials, Contact, Footer } from './components/Sections.jsx'
import { usePointerFx, useSmoothScroll } from './components/fx.jsx'

const MorphField = lazy(() => import('./three/MorphField.jsx'))

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    document.documentElement.classList.add('js-reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) }
      })
    }, { rootMargin: '0px 0px -8% 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

// 3D field starts when the browser is idle (text paints first; never during pre-render)
function useIdleMount() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!document.createElement('canvas').getContext('webgl2')) return
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 500))
    const id = idle(() => setOn(true), { timeout: 2000 })
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])
  return on
}

export default function App() {
  useReveal()
  usePointerFx()
  useSmoothScroll()
  const field = useIdleMount()
  return (
    <>
      {field && <Suspense fallback={null}><MorphField /></Suspense>}
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Research />
        <Publications />
        <About />
        <Credentials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
