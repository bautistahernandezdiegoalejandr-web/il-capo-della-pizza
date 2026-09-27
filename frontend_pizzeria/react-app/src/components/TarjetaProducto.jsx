import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import { formatearPrecio } from '../utils/formatearPrecio.js'

// Componente reutilizable: antes cada pizza era un bloque de HTML copiado y
// pegado manualmente (con su propio onclick inline). Ahora es un solo
// componente que recibe los datos del producto como props.
export default function TarjetaProducto({ producto }) {
  const { agregarAlCarrito } = useCarrito()
  const navigate = useNavigate()

  function handleAgregar() {
    agregarAlCarrito(producto)
    navigate('/carrito')
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-full h-48 object-cover rounded-xl mb-4"
      />
      <h3 className="font-bold text-lg">{producto.nombre}</h3>
      <p className="text-gray-500 text-xs my-2 leading-relaxed h-10">{producto.descripcion}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="font-bold text-lg">{formatearPrecio(producto.precio)}</span>
        <button
          onClick={handleAgregar}
          className="bg-brand-red text-white px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-brand-red-dark transition"
        >
          Añadir
        </button>
      </div>
    </div>
  )
}
