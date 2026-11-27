// Injects server-rendered HTML into each built page so text paints before JavaScript runs.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd() // npm scripts run from the project root
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href)

const pages = [
  ['main', 'dist/index.html'],
  ['thesis', 'dist/thesis/index.html'],
]
for (const [name, file] of pages) {
  const p = path.join(root, file)
  const html = fs.readFileSync(p, 'utf8')
  if (!html.includes('<!--app-html-->')) throw new Error(`placeholder <!--app-html--> missing in ${file}`)
  // preload the two fonts the first screen needs (heading serif, body sans) so text does not wait on CSS
  const assets = fs.readdirSync(path.join(root, 'dist', 'assets'))
  const base = html.match(/src="([^"]*?)assets\//)?.[1] ?? '/'
  const pre = name === 'main'
    ? ['newsreader-latin-400-normal', 'ibm-plex-sans-latin-400-normal']
        .map((k) => assets.find((f) => f.startsWith(k) && f.endsWith('.woff2')))
        .filter(Boolean)
        .map((f) => `<link rel="preload" href="${base}assets/${f}" as="font" type="font/woff2" crossorigin>`).join('')
    : ''
  fs.writeFileSync(p, html.replace('<!--app-html-->', render(name)).replace('</head>', pre + '</head>'))
  console.log(`prerendered ${file}`)
}
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
