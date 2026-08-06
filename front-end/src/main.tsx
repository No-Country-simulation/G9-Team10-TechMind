import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { bootstrapSettings } from '@/context/SettingsContext'
import { SettingsProvider } from '@/context/SettingsContext'
import './index.css'
import App from './App.tsx'

bootstrapSettings()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
