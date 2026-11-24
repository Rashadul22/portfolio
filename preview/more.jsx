import React from 'react';
import { createRoot } from 'react-dom/client';
import '../src/home/home.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import ExternalTests from '../src/home/parts/MoreResearch/ExternalTests.jsx';
import VlmCard from '../src/home/parts/MoreResearch/VlmCard.jsx';
import NasaCard from '../src/home/parts/MoreResearch/NasaCard.jsx';

if (location.search.includes('dark')) document.documentElement.dataset.theme = 'dark';
createRoot(document.getElementById('root')).render(
  <main className="wrap section"><ExternalTests /><VlmCard /><NasaCard /></main>
);
