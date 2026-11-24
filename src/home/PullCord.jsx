import { lazy, Suspense, useEffect, useState } from 'react'

// Theme switch = FeralUI "pullcord" (MIT, npm pullcord 0.1.0, https://feralui.dev/pullcord): a simulated rope you
// pull to flip light/dark. Client-only and loaded after first paint (it brings `motion`), so text paints first.
const Cord = lazy(() => import('pullcord').then((m) => ({ default: m.PullCord })))

export default function PullCord() {
  const [ready, setReady] = useState(false)
  const [dark, setDark] = useState(false)
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark')
    import('pullcord/pullcord.css')
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300))
    idle(() => setReady(true))
  }, [])
  // The new theme is revealed as a circle growing from the cord (View Transitions API, no library;
  // browsers without it, or with reduced motion, switch instantly).
  const flip = () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    const apply = () => {
      root.dataset.theme = next
      try { localStorage.setItem('theme', next) } catch (e) { /* storage blocked */ }
      setDark(next === 'dark')
    }
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()
    const knob = document.querySelector('.pullcord button')?.getBoundingClientRect()
    const x = knob ? knob.left + knob.width / 2 : innerWidth - 60, y = knob ? knob.top + knob.height / 2 : 40
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(apply).ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' })
    })
  }
  if (!ready) return null
  return (
    <Suspense fallback={null}>
      <Cord onPull={flip} pulled={dark} ariaLabel={dark ? 'Pull for light theme' : 'Pull for dark theme'} />
    </Suspense>
  )
}
