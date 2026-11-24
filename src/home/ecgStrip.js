// Synthetic 12-lead strip drawn on a 2D canvas (no patient data). Shared by the hero poster and the 3D paper.
const LEADS = [['I', 1, .6, .25], ['II', 1.3, .8, .35], ['III', .6, .35, .15], ['aVR', -1, -.5, -.2], ['aVL', .5, .2, .12],
  ['aVF', .95, .5, .25], ['V1', .35, -.3, .15], ['V2', .7, -.6, .35], ['V3', 1.1, -.1, .4], ['V4', 1.4, .3, .45],
  ['V5', 1.5, .4, .4], ['V6', 1.2, .35, .3]]

// Portrait strip 1 x 2.6 -> canvas 700 x 1820. 1 mm = 7 px.
export function drawStrip() {
  const W = 700, H = 1820, mm = 7
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')
  g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, W, H)
  for (let x = 0; x <= W; x += mm) { g.strokeStyle = x % (mm * 5) ? 'rgba(226,150,150,.35)' : 'rgba(214,110,110,.6)'; g.lineWidth = x % (mm * 5) ? .6 : 1.1; g.beginPath(); g.moveTo(x, 150); g.lineTo(x, H); g.stroke() }
  for (let y = 150; y <= H; y += mm) { g.strokeStyle = (y - 150) % (mm * 5) ? 'rgba(226,150,150,.35)' : 'rgba(214,110,110,.6)'; g.lineWidth = (y - 150) % (mm * 5) ? .6 : 1.1; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke() }
  g.fillStyle = '#1d1d1f'; g.font = '600 30px "JetBrains Mono", monospace'; g.fillText('12-LEAD ECG', 34, 60)
  g.font = '22px "JetBrains Mono", monospace'; g.fillText('25 mm/s · 10 mm/mV · synthetic, not a patient', 34, 100)
  const row = (H - 190) / 12
  LEADS.forEach(([lab, r, t, p], i) => {
    const base = 150 + row * (i + .62)
    g.strokeStyle = '#18181a'; g.lineWidth = 2.4; g.lineJoin = 'round'; g.beginPath()
    const beat = [[0, 0], [.06, p * .15], [.1, p * .18], [.14, 0], [.18, 0], [.2, -.08 * Math.sign(r)], [.23, r], [.26, r > 0 ? -.25 : .15], [.29, 0], [.4, .02], [.48, t], [.56, 0], [.8, 0]]
    let first = true
    for (let k = 0; k * .8 < 4; k++) for (const [tt, v] of beat) {
      const x = 20 + (k * .8 + tt) * 25 * mm * .9
      if (x > W - 16) continue
      const y = base - v * 10 * mm * .55
      first ? g.moveTo(x, y) : g.lineTo(x, y); first = false
    }
    g.stroke(); g.fillStyle = '#18181a'; g.font = '600 24px Inter, sans-serif'; g.fillText(lab, 24, base - row * .42)
  })
  return c.toDataURL('image/png')
}

