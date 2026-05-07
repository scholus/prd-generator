import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PaydiaMockup from './PaydiaMockup.jsx'

const isMockup = window.location.pathname === '/mockup'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isMockup ? <PaydiaMockup /> : <App />}
  </StrictMode>,
)
