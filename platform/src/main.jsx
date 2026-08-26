import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ToastContainer } from './components/ui/Toast.jsx'
import './index.css'

// Vite BASE_URL is "/" in local dev and "/mbointegratedPlatform/" in production builds.
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || undefined

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <ToastProvider>
        <App />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>,
)
