import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { HomePage } from './HomePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  </StrictMode>,
)
