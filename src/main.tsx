import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { AuthProvider } from './lib/auth/AuthContext'
import { initAnalytics } from './lib/analytics/posthog'
import './index.css'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
