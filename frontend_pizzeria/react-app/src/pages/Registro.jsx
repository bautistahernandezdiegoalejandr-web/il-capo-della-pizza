import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUsuario } from '../context/UsuarioContext.jsx'

export default function Registro() {
  const { registrarUsuario } = useUsuario()
  const [exito, setExito] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await registrarUsuario(nombre, correo, password)
      setExito(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (exito) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            <i className="fa-solid fa-check" aria-hidden="true"></i>
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">¡Cuenta creada!</h1>
          <p className="text-gray-500 mb-6">Ya puedes iniciar sesión con tu correo.</p>
          <Link
            to="/login"
            className="bg-brand-red text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-red-dark transition inline-block"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
        <h1 className="font-serif text-3xl font-bold mb-2 text-center">Crear Cuenta</h1>
        <p className="text-gray-500 text-center mb-8">Únete a Il Capo della Pizza</p>

        {error && (
          <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-5" role="alert">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="registro-nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              id="registro-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Mario Rossi"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-brand-red focus:border-brand-red outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="registro-correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              id="registro-correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-brand-red focus:border-brand-red outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="registro-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              id="registro-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-brand-red focus:border-brand-red outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-brand-red-dark transition disabled:opacity-50"
          >
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-red font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
