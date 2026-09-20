import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './styles/reset.css'
import './styles/global.css'
import App from './App.jsx'
import { ExhibitionProvider } from './context/ExhibitionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ExhibitionProvider>
      <App />
    </ExhibitionProvider>
  </StrictMode>,
)
