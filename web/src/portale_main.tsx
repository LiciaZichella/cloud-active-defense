import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Portale from './Portale.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Portale />
  </StrictMode>,
)
