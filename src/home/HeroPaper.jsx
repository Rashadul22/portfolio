// Hero centrepiece: a synthetic 12-lead ECG printing out of the machine's paper roll, as real 3D paper (paperlab,
// Apache-2.0). Scroll pays the strip out; the pointer tilts the scene; the sheet can be grabbed (interactive).
// Loaded lazily, client-only. No patient data: the trace is drawn below.
import { useEffect, useMemo, useState } from 'react'
import { Paper } from 'paperlab'

import { drawStrip } from './ecgStrip.js'

export default function HeroPaper({ progress = 0.55 }) {
  const [src, setSrc] = useState(null)
  useEffect(() => { document.fonts?.ready.then(() => setSrc(drawStrip())) ?? setSrc(drawStrip()) }, [])
  const behavior = useMemo(() => ({ type: 'unroll', progress, tightness: 0.55, sway: 0.35 }), [progress])
  if (!src) return null
  return (
    <Paper
      className="hero-paper"
      preset="receipt-unroll"
      stock="thermal"
      content={{ type: 'image', src }}
      behavior={behavior}
      interactive
    />
  )
}
