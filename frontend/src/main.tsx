import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './i18n'
import './index.css'
import App from './App.tsx'

console.log(
  `%c[Petition App] v1.0.3 | Last modified: ${new Date('2026-03-16T11:20:00-04:00').toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'medium' })}`,
  'color: #3b82f6; font-weight: bold'
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
