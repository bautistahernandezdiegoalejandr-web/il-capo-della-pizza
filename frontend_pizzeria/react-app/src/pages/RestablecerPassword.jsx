import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useUsuario } from '../context/UsuarioContext.jsx'

export default function RestablecerPassword() {
  const { restablecerPassword } = useUsuario()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const id = searchParams.get('id')

  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await restablecerPassword(id, token, password)
      setExito(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (!token || !id) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <p className="text-gray-600 mb-6">Este enlace no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión.</p>
          <Link to="/olvide-password" className="text-brand-red font-semibold">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
        {exito ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              <i className="fa-solid fa-check" aria-hidden="true"></i>
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">¡Contraseña actualizada!</h1>
            <p className="text-gray-500">Te estamos redirigiendo a Iniciar Sesión...</p>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold mb-2 text-center">Crea una nueva contraseña</h1>
            <p className="text-gray-500 text-center mb-8">Elige una contraseña segura para tu cuenta.</p>

            {error && (
              <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-5" role="alert">
                {error}
              </p>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="nueva-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  id="nueva-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-brand-red focus:border-brand-red outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-brand-red-dark transition disabled:opacity-50"
              >
                {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
