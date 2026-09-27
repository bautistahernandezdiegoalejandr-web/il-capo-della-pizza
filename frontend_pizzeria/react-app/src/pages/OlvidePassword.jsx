import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUsuario } from '../context/UsuarioContext.jsx'

export default function OlvidePassword() {
  const { solicitarRecuperacion } = useUsuario()
  const [correo, setCorreo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    try {
      await solicitarRecuperacion(correo)
    } finally {
      // Mostramos el mismo mensaje exista o no la cuenta, para no revelar
      // qué correos están registrados (esto ya lo hace también el backend).
      setEnviado(true)
      setCargando(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-10 text-center">
        {enviado ? (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              <i className="fa-solid fa-envelope" aria-hidden="true"></i>
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">Revisa tu correo</h1>
            <p className="text-gray-500 mb-6">
              Si <strong>{correo}</strong> está registrado, te enviamos un enlace para restablecer tu contraseña.
              Vence en 30 minutos.
            </p>
            <Link to="/login" className="text-brand-red font-semibold">
              Volver a Iniciar Sesión
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold mb-2 text-center">¿Olvidaste tu contraseña?</h1>
            <p className="text-gray-500 text-center mb-8">
              Escribe tu correo y te enviaremos un enlace para crear una nueva.
            </p>
            <form className="space-y-5 text-left" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="olvide-correo" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  id="olvide-correo"
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-brand-red focus:border-brand-red outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-brand-red-dark transition disabled:opacity-50"
              >
                {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
