// Real 3D paper for the "Crumpled" form, using paperlab (Apache-2.0, Codrops Oct 2026:
// https://github.com/NourMtir0722/Paperlab). Loaded on demand only; the 2D sheet underneath is the fallback.
import { Paper } from 'paperlab'

export default function Paper3D({ src }) {
  return (
    <Paper
      className="paper3d"
      sheet={{ width: 2.32, height: 1 }}
      stock="printer"
      content={{ type: 'image', src }}
      behavior={{ type: 'crumple', progress: 0.3, coarseness: 0.35, ball: 0 }}
      surface={{ grain: 0.4, aging: 0.1 }}
      autoplay
    />
  )
}
