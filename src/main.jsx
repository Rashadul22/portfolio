import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/newsreader/latin-400.css'
import '@fontsource/newsreader/latin-400-italic.css'
import '@fontsource/newsreader/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/caveat/latin-500.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import './home/home.css'

// The production build pre-renders the page into #root (scripts/prerender.mjs); hydrate it if present.
const root = document.getElementById('root')
if (root.firstElementChild) hydrateRoot(root, <App />)
else createRoot(root).render(<App />)
