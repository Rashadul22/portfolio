// Point-cloud targets for the scroll morph. Every shape has the same N points so the GPU can blend between them.
// 0 ECG traces (12 leads) -> 1 heart -> 2 DNA helix -> 3 planet + orbit ring -> 4 star field

function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s))
const POL = [1, 1, 0.6, -0.8, 0.7, 0.9, -0.4, 0.5, 1.1, 1.3, 1.2, 1]
function beat(p, lead) {
  const pol = POL[lead]
  return 0.12 * g(p, 0.2, 0.025) - 0.1 * pol * g(p, 0.37, 0.008) + 0.95 * pol * g(p, 0.4, 0.011) - 0.28 * g(p, 0.435, 0.01) + 0.26 * g(p, 0.66, 0.045)
}

export function makeShapes(N) {
  const r = rng(42)
  const P = Array.from({ length: 5 }, () => new Float32Array(N * 3))
  const rand = new Float32Array(N)
  const lead = new Float32Array(N)
  const LEADS = 12, W = 14, GAP = 0.62

  for (let i = 0; i < N; i++) {
    rand[i] = r()
    const k = i * 3

    // 0: ECG traces - points ordered along each lead so they read as lines
    const L = i % LEADS
    const u = Math.floor(i / LEADS) / Math.ceil(N / LEADS)
    const beats = 3.2 + (L % 3) * 0.15
    lead[i] = L / LEADS
    P[0][k] = (u - 0.5) * W
    P[0][k + 1] = beat((u * beats + L * 0.07) % 1, L) * 0.42 + (LEADS / 2 - L - 0.5) * GAP
    P[0][k + 2] = (r() - 0.5) * 0.05

    // 1: heart - filled volume, denser near the surface
    const t = r() * Math.PI * 2
    const s = Math.sqrt(0.15 + 0.85 * r())
    const hx = 16 * Math.sin(t) ** 3
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    P[1][k] = hx * s * 0.17
    P[1][k + 1] = hy * s * 0.17 + 0.4
    P[1][k + 2] = (r() - 0.5) * 2.0 * Math.sqrt(Math.max(0, 1 - s * s)) + (r() - 0.5) * 0.15

    // 2: DNA double helix (70% strands, 30% base-pair rungs)
    const y = (r() - 0.5) * 9
    const a = y * 1.15
    if (r() < 0.7) {
      const off = r() < 0.5 ? 0 : Math.PI
      P[2][k] = Math.cos(a + off) * 1.2 + (r() - 0.5) * 0.08
      P[2][k + 1] = y
      P[2][k + 2] = Math.sin(a + off) * 1.2 + (r() - 0.5) * 0.08
    } else {
      const yy = Math.round(y / 0.42) * 0.42
      const aa = yy * 1.15
      const m = r() * 2 - 1
      P[2][k] = Math.cos(aa) * 1.2 * m
      P[2][k + 1] = yy
      P[2][k + 2] = Math.sin(aa) * 1.2 * m
    }

    // 3: planet (fibonacci sphere) + tilted orbit ring
    if (r() < 0.62) {
      const n = i / N
      const phi = Math.acos(1 - 2 * n)
      const th = Math.PI * (1 + Math.sqrt(5)) * i
      const R = 1.7 + (r() - 0.5) * 0.04
      P[3][k] = Math.sin(phi) * Math.cos(th) * R
      P[3][k + 1] = Math.cos(phi) * R
      P[3][k + 2] = Math.sin(phi) * Math.sin(th) * R
    } else {
      const ang = r() * Math.PI * 2
      const R = 2.5 + r() * 0.7
      const x = Math.cos(ang) * R, z = Math.sin(ang) * R
      const tilt = 0.42
      P[3][k] = x
      P[3][k + 1] = z * Math.sin(tilt) + (r() - 0.5) * 0.05
      P[3][k + 2] = z * Math.cos(tilt)
    }

    // 4: star field
    P[4][k] = (r() - 0.5) * 26
    P[4][k + 1] = (r() - 0.5) * 15
    P[4][k + 2] = -2 - r() * 8
  }
  return { P, rand, lead }
}
