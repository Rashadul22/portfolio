import { createRoot, hydrateRoot } from 'react-dom/client'
import ThesisApp from './ThesisApp.jsx'
import '@fontsource/fraunces/latin-400.css'
import '@fontsource/fraunces/latin-400-italic.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import './thesis.css'

const root = document.getElementById('root')
if (root.firstElementChild) hydrateRoot(root, <ThesisApp />)
else createRoot(root).render(<ThesisApp />)
