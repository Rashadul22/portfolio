import React from 'react'
import { createRoot } from 'react-dom/client'
import '../src/home/home.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/fraunces/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import Outputs from '../src/home/parts/Sections/Outputs.jsx'
import About from '../src/home/parts/Sections/About.jsx'
import Credentials from '../src/home/parts/Sections/Credentials.jsx'
import Contact from '../src/home/parts/Sections/Contact.jsx'
import Footer from '../src/home/parts/Sections/Footer.jsx'

if (location.search.includes('dark')) document.documentElement.dataset.theme = 'dark'
createRoot(document.getElementById('root')).render(
  <main><Outputs /><About /><Credentials /><Contact /><Footer /></main>
)
