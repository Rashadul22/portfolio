import { createRoot } from 'react-dom/client';
import '../src/home/home.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import ReportCard from '../src/home/parts/ReportCard/ReportCard.jsx';

if (location.search.includes('dark')) document.documentElement.dataset.theme = 'dark';
createRoot(document.getElementById('root')).render(<main className="wrap section"><ReportCard /></main>);
