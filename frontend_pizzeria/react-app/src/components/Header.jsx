import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useUsuario } from '../context/UsuarioContext.jsx'

export default function Header() {
  const { cantidadTotal } = useCarrito()
  const { usuario, esAdmin } = useUsuario()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const enlaces = [
    { to: '/', label: 'Inicio' },
    { to: '/menu', label: 'Menú' },
    { to: '/contacto', label: 'Contacto' },
  ]

  function irA(ruta) {
    setMenuAbierto(false)
    navigate(ruta)
  }

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer">
            <i className="fa-solid fa-location-dot text-brand-red text-2xl mr-2" aria-hidden="true"></i>
            <span className="font-serif font-bold text-2xl tracking-tight">Il capo della pizza</span>
          </Link>

          {/* Enlaces Centrales */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-500 hover:text-brand-red font-medium transition-colors">
              Inicio
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-brand-red font-medium transition-colors">
              Menú
            </Link>
            <Link to="/contacto" className="text-gray-500 hover:text-brand-red font-medium transition-colors">
              Contacto
            </Link>
          </div>

          {/* Botones Derecha */}
          <div className="flex items-center space-x-4">
            {esAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 text-brand-red text-sm font-semibold hover:underline"
              >
                <i className="fa-solid fa-gauge" aria-hidden="true"></i> Panel Admin
              </Link>
            )}
            {usuario ? (
              <button
                onClick={() => navigate('/cuenta')}
                className="hidden sm:flex items-center gap-2 border border-gray-300 text-gray-700 pl-2 pr-5 py-1.5 rounded-full font-medium hover:bg-gray-50 transition"
              >
                <span className="w-7 h-7 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>
                {usuario.nombre.split(' ')[0]}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:block border border-gray-300 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-gray-50 transition"
              >
                Iniciar Sesión
              </button>
            )}
            <button
              onClick={() => navigate('/carrito')}
              aria-label={`Carrito de compras${cantidadTotal > 0 ? `, ${cantidadTotal} artículos` : ', vacío'}`}
              className="relative p-2 text-gray-700 hover:text-brand-red transition bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
              {cantidadTotal > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-green-700 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cantidadTotal}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate(usuario ? '/cuenta' : '/login')}
              aria-label={usuario ? 'Mi cuenta' : 'Iniciar sesión'}
              className="sm:hidden text-gray-700 relative"
            >
              <i className="fa-regular fa-user text-xl" aria-hidden="true"></i>
              {usuario && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-600 rounded-full border border-white"></span>
              )}
            </button>
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              className="md:hidden text-gray-700 p-2 -mr-2"
            >
              <i className={`fa-solid ${menuAbierto ? 'fa-xmark' : 'fa-bars'} text-xl`} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {/* Menú móvil: se muestra al abrir el botón hamburguesa, solo visible por debajo de md */}
        {menuAbierto && (
          <div id="menu-movil" className="md:hidden pb-4 border-t border-gray-100 pt-2">
            <div className="flex flex-col space-y-1">
              {enlaces.map((enlace) => (
                <button
                  key={enlace.to}
                  onClick={() => irA(enlace.to)}
                  className="text-left px-2 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-brand-red font-medium transition-colors"
                >
                  {enlace.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
