import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api.js'

// Autenticación real conectada al backend (Fase 2): las contraseñas se
// validan con bcrypt en el servidor, la sesión vive en una cookie httpOnly
// (JavaScript del navegador nunca la toca), y este Context solo guarda en
// memoria los datos públicos del usuario (nombre, correo, rol) para pintarlos
// en la interfaz.

const UsuarioContext = createContext(null)

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al cargar la app, preguntamos al backend si la cookie de sesión sigue
  // siendo válida (por ejemplo, tras refrescar la página).
  useEffect(() => {
    api
      .get('/auth/me')
      .then((data) => setUsuario(data.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))
  }, [])

  async function registrarUsuario(nombre, correo, password) {
    const data = await api.post('/auth/registro', { nombre, correo, password })
    setUsuario(data.usuario)
    return data.usuario
  }

  async function iniciarSesion(correo, password) {
    const data = await api.post('/auth/login', { correo, password })
    setUsuario(data.usuario)
    return data.usuario
  }

  async function cerrarSesion() {
    await api.post('/auth/logout', {})
    setUsuario(null)
  }

  async function solicitarRecuperacion(correo) {
    await api.post('/auth/olvide-password', { correo })
  }

  async function restablecerPassword(id, token, nuevaPassword) {
    await api.post('/auth/restablecer-password', { id, token, nuevaPassword })
  }

  const value = {
    usuario,
    cargando,
    esAdmin: usuario?.rol === 'admin',
    registrarUsuario,
    iniciarSesion,
    cerrarSesion,
    solicitarRecuperacion,
    restablecerPassword,
  }

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>
}

export function useUsuario() {
  const contexto = useContext(UsuarioContext)
  if (!contexto) throw new Error('useUsuario debe usarse dentro de un UsuarioProvider')
  return contexto
}
