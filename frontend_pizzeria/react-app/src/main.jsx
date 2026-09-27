import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { UsuarioProvider } from './context/UsuarioContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UsuarioProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </UsuarioProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
