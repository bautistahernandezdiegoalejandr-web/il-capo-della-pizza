import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUsuario } from '../context/UsuarioContext.jsx'

export default function Login() {
  const { iniciarSesion } = useUsuario()
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await iniciarSesion(correo, password)
      navigate('/cuenta')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
        <h1 className="font-serif text-3xl font-bold mb-2 text-center">Iniciar Sesión</h1>
        <p className="text-gray-500 text-center mb-8">Bienvenido de nuevo al Capo</p>

        {error && (
          <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-5" role="alert">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              id="login-correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-brand-red focus:border-brand-red outline-none transition"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <Link to="/olvide-password" className="text-xs text-brand-red font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-brand-red focus:border-brand-red outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-brand-red-dark transition disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-brand-red font-semibold">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
