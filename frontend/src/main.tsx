import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.js'
import App from './App.js'
import './index.css'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)