import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'

const CATEGORIAS = ['clasicas', 'especiales', 'vegetarianas', 'veganas']

const PRODUCTO_VACIO = {
  slug: '',
  nombre: '',
  descripcion: '',
  precio: '',
  imagen_url: '',
  categoria: 'clasicas',
  stock: 100,
}

export default function AdminProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [formulario, setFormulario] = useState(PRODUCTO_VACIO)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  async function cargarProductos() {
    setCargando(true)
    try {
      const data = await api.get('/productos/admin/todos')
      setProductos(data.productos)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    try {
      await api.post('/productos/admin', { ...formulario, precio: Number(formulario.precio) })
      setFormulario(PRODUCTO_VACIO)
      setMostrarFormulario(false)
      cargarProductos()
    } catch (err) {
      setError(err.message)
    }
  }

  async function actualizarCampo(producto, campo, valor) {
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, [campo]: valor } : p)))
    try {
      await api.put(`/productos/admin/${producto.id}`, { [campo]: valor })
    } catch {
      cargarProductos()
    }
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto del menú? Esta acción no se puede deshacer.')) return
    await api.delete(`/productos/admin/${id}`)
    cargarProductos()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl">Menú actual ({productos.length} productos)</h2>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="bg-brand-red text-white px-5 py-2 rounded-full font-semibold hover:bg-brand-red-dark transition"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleCrear} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Campo label="Slug (identificador único)" value={formulario.slug} onChange={(v) => setFormulario({ ...formulario, slug: v })} placeholder="ej: pizza-hawaiana" />
          <Campo label="Nombre" value={formulario.nombre} onChange={(v) => setFormulario({ ...formulario, nombre: v })} />
          <Campo label="Descripción" value={formulario.descripcion} onChange={(v) => setFormulario({ ...formulario, descripcion: v })} className="md:col-span-2" />
          <Campo label="Precio (COP)" type="number" value={formulario.precio} onChange={(v) => setFormulario({ ...formulario, precio: v })} />
          <Campo label="URL de imagen" value={formulario.imagen_url} onChange={(v) => setFormulario({ ...formulario, imagen_url: v })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formulario.categoria}
              onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-brand-red"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Campo label="Stock inicial" type="number" value={formulario.stock} onChange={(v) => setFormulario({ ...formulario, stock: v })} />
          <button type="submit" className="md:col-span-2 bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-brand-red-dark transition">
            Guardar producto
          </button>
        </form>
      )}

      {cargando && <p className="text-gray-500">Cargando menú...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!cargando && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Disponible</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productos.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{p.categoria}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={p.precio}
                      onBlur={(e) => actualizarCampo(p, 'precio', Number(e.target.value))}
                      className="w-24 border border-gray-200 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={p.stock}
                      onBlur={(e) => actualizarCampo(p, 'stock', Number(e.target.value))}
                      className="w-20 border border-gray-200 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!p.disponible}
                      onChange={(e) => actualizarCampo(p, 'disponible', e.target.checked)}
                      className="w-4 h-4 text-brand-red"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => eliminarProducto(p.id)}
                      aria-label={`Eliminar ${p.nombre}`}
                      className="text-gray-500 hover:text-brand-red"
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && productos.some((p) => p.stock <= 5 && p.disponible) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-5 py-4 text-sm">
          <i className="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true"></i>
          Stock bajo en: {productos.filter((p) => p.stock <= 5 && p.disponible).map((p) => p.nombre).join(', ')}
        </div>
      )}
    </div>
  )
}

function Campo({ label, value, onChange, type = 'text', placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-red"
      />
    </div>
  )
}

