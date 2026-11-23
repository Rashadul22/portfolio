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
  fs.writeFileSync(p, html.replace('<!--app-html-->', render(name)))
  console.log(`prerendered ${file}`)
}
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
