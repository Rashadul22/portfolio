import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import ThesisApp from './thesis/ThesisApp.jsx'

const pages = { main: App, thesis: ThesisApp }

export function render(page = 'main') {
  const Page = pages[page]
  return renderToString(<Page />)
}
