import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { POSProvider } from './context/POSContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <POSProvider>
          <App />
        </POSProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
