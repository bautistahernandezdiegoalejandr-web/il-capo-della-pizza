import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import { formatearPrecio } from '../utils/formatearPrecio.js'

export default function Carrito() {
  const { carrito, cambiarCantidad, eliminarDelCarrito, vaciarCarrito, subtotal } = useCarrito()
  const navigate = useNavigate()
  const carritoVacio = carrito.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-bold mb-2">Tu Carrito</h1>
      <p className="text-gray-500 mb-8">Revisa tus artículos y procede al pago.</p>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {carritoVacio ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
              <i className="fa-solid fa-cart-shopping text-4xl text-gray-300 mb-4" aria-hidden="true"></i>
              <h3 className="font-bold text-lg mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500 mb-6">Añade alguna de nuestras deliciosas pizzas para empezar.</p>
              <Link
                to="/menu"
                className="bg-brand-red text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-red-dark transition inline-block"
              >
                Ver el Menú
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {carrito.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <img src={item.imagen} alt={item.nombre} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-grow">
                    <h4 className="font-bold">{item.nombre}</h4>
                    <p className="text-xs text-gray-500">{item.descripcion}</p>
                    <span className="text-sm font-semibold text-brand-red">{formatearPrecio(item.precio)}</span>
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-full">
                    <button
                      onClick={() => cambiarCantidad(item.id, -1)}
                      aria-label={`Disminuir cantidad de ${item.nombre}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-red"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.id, 1)}
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-red"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="text-gray-500 hover:text-brand-red p-2"
                    aria-label="Eliminar"
                  >
                    <i className="fa-solid fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-6 px-2">
            <Link to="/menu" className="text-gray-600 hover:text-brand-red font-medium flex items-center gap-2">
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Seguir Comprando
            </Link>
            {!carritoVacio && (
              <button
                onClick={vaciarCarrito}
                className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2"
              >
                <i className="fa-solid fa-cart-arrow-down" aria-hidden="true"></i> Vaciar Carrito
              </button>
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:w-1/3">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-serif text-2xl font-bold mb-6">Resumen del Pedido</h3>
            <div className="space-y-4 mb-6 text-gray-600 border-b border-gray-100 pb-6 border-dashed">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatearPrecio(subtotal)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-xl">Total</span>
              <span className="font-bold text-2xl">{formatearPrecio(subtotal)}</span>
            </div>
            <button
              disabled={carritoVacio}
              onClick={() => navigate('/pago')}
              className="w-full bg-brand-red text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-red-dark transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
