import { Navigate } from 'react-router-dom'
import { useUsuario } from '../context/UsuarioContext.jsx'

// Envuelve cualquier ruta que solo el rol 'admin' debe poder ver. Aunque el
// backend también valida el rol en cada endpoint (la seguridad real nunca
// debe depender solo del frontend), esto evita que un cliente normal
// siquiera vea la interfaz del panel.
export default function RutaAdmin({ children }) {
  const { usuario, cargando, esAdmin } = useUsuario()

  if (cargando) {
    return <div className="text-center py-24 text-gray-500">Verificando sesión...</div>
  }
  if (!usuario) {
    return <Navigate to="/login" replace />
  }
  if (!esAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}
