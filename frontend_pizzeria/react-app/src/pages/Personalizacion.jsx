import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import { EXTRAS, MASAS, TAMANOS } from '../data/menuData.js'
import { formatearPrecio } from '../utils/formatearPrecio.js'

export default function Personalizacion() {
  const { agregarAlCarrito } = useCarrito()
  const navigate = useNavigate()

  const [tamanoId, setTamanoId] = useState(TAMANOS[0].id)
  const [masaId, setMasaId] = useState(MASAS[0].id)
  const [extrasIds, setExtrasIds] = useState([])
  const [cantidad, setCantidad] = useState(1)

  const tamano = TAMANOS.find((t) => t.id === tamanoId)
  const masa = MASAS.find((m) => m.id === masaId)
  const extrasSeleccionados = EXTRAS.filter((e) => extrasIds.includes(e.id))
  const precioExtras = extrasSeleccionados.reduce((acc, e) => acc + e.precio, 0)

  const totalUnitario = tamano.precio + masa.precio + precioExtras
  const total = useMemo(() => totalUnitario * cantidad, [totalUnitario, cantidad])

  function alternarExtra(id) {
    setExtrasIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  function handleAgregarAlCarrito() {
    const nombreExtras = extrasSeleccionados.map((e) => e.label).join(', ')
    agregarAlCarrito({
      id: `pizza-personalizada-${tamanoId}-${masaId}-${extrasIds.sort().join('-')}-${Date.now()}`,
      nombre: `Pizza Personalizada (${tamano.label})`,
      descripcion: `Masa ${masa.label}${nombreExtras ? ` · Extras: ${nombreExtras}` : ''}`,
      precio: totalUnitario, // usado solo para mostrar el total en el carrito/checkout
      imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80',
      cantidad,
      // El backend recalcula el precio real a partir de esta selección — ver
      // pedidosController.js. El campo `precio` de arriba nunca se usa para cobrar.
      personalizacion: { tamanoId, masaId, extrasIds },
    })
    navigate('/carrito')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/menu" className="hover:text-brand-red">
          Menú
        </Link>{' '}
        /{' '}
        <Link to="/menu" className="hover:text-brand-red">
          Pizzas
        </Link>{' '}
        / <span className="font-semibold text-gray-800">Margarita</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10 relative">
        {/* Configuración */}
        <div className="lg:w-2/3">
          <img
            src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80"
            alt="Margarita"
            className="w-full h-64 md:h-96 object-cover rounded-3xl mb-8 shadow-sm"
          />
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Personaliza tu Pizza Margarita</h1>
          <p className="text-gray-600 mb-10 text-lg">
            La clásica pizza italiana con nuestra salsa de tomate especial, mozzarella fresca y albahaca. Simple,
            pero perfecta.
          </p>

          {/* Paso 1: Tamaño */}
          <h3 className="font-bold text-xl mb-4">Paso 1: Elige el tamaño</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {TAMANOS.map((t) => (
              <OpcionCard
                key={t.id}
                seleccionado={tamanoId === t.id}
                onClick={() => setTamanoId(t.id)}
              >
                <span className="font-bold text-lg block">{t.label}</span>
                <span className="text-sm text-gray-500 block">{t.detalle}</span>
                <span className="text-green-700 font-bold mt-2 block">{formatearPrecio(t.precio)}</span>
              </OpcionCard>
            ))}
          </div>

          {/* Paso 2: Masa */}
          <h3 className="font-bold text-xl mb-4">Paso 2: Elige tu masa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {MASAS.map((m) => (
              <OpcionCard key={m.id} seleccionado={masaId === m.id} onClick={() => setMasaId(m.id)}>
                <span className="font-bold block">{m.label}</span>
                <span className="text-sm text-gray-500 block">
                  {m.precio === 0 ? '+ $0' : `+ ${formatearPrecio(m.precio)}`}
                </span>
              </OpcionCard>
            ))}
          </div>

          {/* Paso 3: Extras */}
          <h3 className="font-bold text-xl mb-4">Paso 3: Añade ingredientes (+ extra)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {EXTRAS.map((e) => (
              <OpcionCard key={e.id} seleccionado={extrasIds.includes(e.id)} onClick={() => alternarExtra(e.id)}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mb-2 flex items-center justify-center text-xl">
                    {e.emoji}
                  </div>
                  <span className="font-bold block text-sm">{e.label}</span>
                  <span className="text-xs text-gray-500 block">+ {formatearPrecio(e.precio)}</span>
                </div>
              </OpcionCard>
            ))}
          </div>
        </div>

        {/* Resumen lateral */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-serif text-2xl font-bold mb-6">Resumen</h3>

            <div className="space-y-3 mb-6 text-sm border-b border-gray-100 pb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Base: Margarita {tamano.label}</span>
                <span className="font-medium">{formatearPrecio(tamano.precio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Masa: {masa.label}</span>
                <span className="font-medium">{formatearPrecio(masa.precio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Extras: {extrasSeleccionados.length ? extrasSeleccionados.map((e) => e.label).join(', ') : 'Ninguno'}
                </span>
                <span className="font-medium">{formatearPrecio(precioExtras)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-800">Cantidad</span>
              <div className="flex items-center bg-gray-100 rounded-full">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  aria-label="Disminuir cantidad"
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-red"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">{cantidad}</span>
                <button
                  onClick={() => setCantidad((c) => c + 1)}
                  aria-label="Aumentar cantidad"
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-red"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-xl uppercase">Total</span>
              <span className="font-bold text-3xl text-brand-red">{formatearPrecio(total)}</span>
            </div>

            <button
              onClick={handleAgregarAlCarrito}
              className="w-full bg-brand-red text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-red-dark transition shadow-md flex justify-center items-center gap-2"
            >
              <i className="fa-solid fa-cart-plus" aria-hidden="true"></i> Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-componente reutilizable para las opciones de tamaño/masa/extras
function OpcionCard({ seleccionado, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={seleccionado}
      className={`text-left border-2 rounded-xl p-4 text-center hover:border-red-300 transition h-full flex flex-col justify-center ${
        seleccionado ? 'border-brand-red bg-red-50/20' : 'border-gray-200'
      }`}
    >
      {children}
    </button>
  )
}
