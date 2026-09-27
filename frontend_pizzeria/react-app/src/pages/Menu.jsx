import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TarjetaProducto from '../components/TarjetaProducto.jsx'
import { CATEGORIAS } from '../data/menuData.js'
import { api } from '../services/api.js'

export default function Menu() {
  const [categoriaActiva, setCategoriaActiva] = useState('clasicas')
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // El menú ahora viene de la API (tabla `productos` en MySQL) en vez de
  // estar escrito directamente en el código del frontend.
  useEffect(() => {
    setCargando(true)
    api
      .get('/productos')
      .then((data) => {
        const mapeados = data.productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          imagen: p.imagen_url,
          categoria: p.categoria,
        }))
        setProductos(mapeados)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar el menú. Verifica que el backend esté corriendo.'))
      .finally(() => setCargando(false))
  }, [])

  const pizzasFiltradas = useMemo(
    () => productos.filter((pizza) => pizza.categoria === categoriaActiva),
    [productos, categoriaActiva],
  )

  const categoriaLabel = CATEGORIAS.find((c) => c.id === categoriaActiva)?.label ?? ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-bold mb-2">Nuestro Menú de Pizzas</h1>
      <p className="text-gray-500 mb-8">
        Auténticas pizzas italianas hechas con los ingredientes más frescos y de calidad.
      </p>

      {/* Categorías */}
      <div className="flex space-x-3 mb-10 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIAS.map((categoria) => (
          <button
            key={categoria.id}
            onClick={() => setCategoriaActiva(categoria.id)}
            aria-pressed={categoriaActiva === categoria.id}
            className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all shadow-sm ${
              categoriaActiva === categoria.id
                ? 'bg-brand-red text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {categoria.label}
          </button>
        ))}
        <Link
          to="/personalizacion"
          className="bg-white text-gray-600 border border-gray-200 px-5 py-2 rounded-full font-medium hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm"
        >
          Crea tu Pizza
        </Link>
      </div>

      <h2 className="font-serif text-2xl font-bold mb-6">{categoriaLabel}</h2>

      {cargando && <p className="text-gray-500">Cargando menú...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!cargando && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pizzasFiltradas.map((pizza) => (
            <TarjetaProducto key={pizza.id} producto={pizza} />
          ))}
        </div>
      )}
    </div>
  )
}
