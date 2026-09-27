import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { formatearPrecio } from '../../utils/formatearPrecio.js'

const ESTADOS = [
  { id: 'recibido', label: 'Recibido', color: 'bg-blue-100 text-blue-700' },
  { id: 'en_preparacion', label: 'En preparación', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'en_camino', label: 'En camino', color: 'bg-purple-100 text-purple-700' },
  { id: 'entregado', label: 'Entregado', color: 'bg-green-100 text-green-700' },
  { id: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-700' },
]

const ESTADOS_PAGO = {
  pendiente: { label: 'Pago pendiente', color: 'bg-gray-100 text-gray-600' },
  aprobado: { label: 'Pago aprobado', color: 'bg-green-100 text-green-700' },
  declinado: { label: 'Pago declinado', color: 'bg-red-100 text-red-700' },
  error: { label: 'Error en el pago', color: 'bg-red-100 text-red-700' },
  vencido: { label: 'Pago vencido', color: 'bg-gray-100 text-gray-600' },
}

// NOTA: esto usa "sondeo" (polling) — vuelve a preguntar al backend cada 8
// segundos. Es simple y funciona bien para un negocio de este tamaño. Si más
// adelante quieres pedidos empujados al instante (0 segundos de espera), el
// siguiente paso natural es añadir WebSockets (ej. Socket.io) entre el
// backend y este panel.
const INTERVALO_ACTUALIZACION_MS = 8000

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargarPedidos() {
    try {
      const query = filtro ? `?estado=${filtro}` : ''
      const data = await api.get(`/pedidos/admin/todos${query}`)
      setPedidos(data.pedidos)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    setCargando(true)
    cargarPedidos()
    const intervalo = setInterval(cargarPedidos, INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro])

  async function cambiarEstado(id, nuevoEstado) {
    // Actualización optimista: cambiamos en pantalla de inmediato y luego
    // confirmamos con el servidor, para que el panel se sienta instantáneo.
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)))
    try {
      await api.patch(`/pedidos/admin/${id}/estado`, { estado: nuevoEstado })
    } catch {
      cargarPedidos() // si falló, recargamos el estado real desde el servidor
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltro('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              filtro === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Todos
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e.id}
              onClick={() => setFiltro(e.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                filtro === e.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">Actualiza automáticamente cada 8s</span>
      </div>

      {cargando && <p className="text-gray-500">Cargando pedidos...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!cargando && !error && pedidos.length === 0 && (
        <p className="text-gray-500">No hay pedidos en este estado.</p>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const estadoInfo = ESTADOS.find((e) => e.id === pedido.estado)
          const estadoPagoInfo = ESTADOS_PAGO[pedido.estado_pago]
          const pagoNoConfirmado = pedido.metodo_pago === 'Pago en línea (Wompi)' && pedido.estado_pago !== 'aprobado'
          return (
            <div key={pedido.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="font-bold text-lg">#{pedido.numero_seguimiento}</p>
                  <p className="text-sm text-gray-500">
                    {pedido.direccion_nombre} · {pedido.direccion_telefono}
                  </p>
                  <p className="text-sm text-gray-500">
                    {pedido.direccion_texto}, {pedido.direccion_ciudad}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${estadoInfo?.color}`}>
                  {estadoInfo?.label}
                </span>
              </div>

              {pedido.metodo_pago === 'Pago en línea (Wompi)' && (
                <div className="mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${estadoPagoInfo?.color}`}>
                    <i className="fa-solid fa-circle-dollar-to-slot mr-1" aria-hidden="true"></i>
                    {estadoPagoInfo?.label}
                  </span>
                </div>
              )}

              <div className="border-t border-b border-gray-100 py-3 mb-3 space-y-1">
                {pedido.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.cantidad}x {item.nombre_producto}
                    </span>
                    <span className="font-medium">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Pago: <span className="font-semibold text-gray-700">{pedido.metodo_pago}</span> · Total:{' '}
                  <span className="font-bold text-brand-red">{formatearPrecio(pedido.total)}</span>
                </div>
                <select
                  value={pedido.estado}
                  onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                  disabled={pagoNoConfirmado}
                  title={pagoNoConfirmado ? 'No se puede avanzar: el pago aún no ha sido confirmado por Wompi' : undefined}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-brand-red disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
