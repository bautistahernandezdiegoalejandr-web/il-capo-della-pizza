import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUsuario } from '../context/UsuarioContext.jsx'
import { api } from '../services/api.js'
import { formatearPrecio } from '../utils/formatearPrecio.js'

const ESTADOS_LABEL = {
  recibido: 'Recibido',
  en_preparacion: 'En preparación',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const ESTADOS_PAGO_LABEL = {
  pendiente: { texto: 'Pago pendiente', color: 'bg-gray-100 text-gray-600' },
  aprobado: { texto: 'Pago aprobado', color: 'bg-green-100 text-green-700' },
  declinado: { texto: 'Pago declinado', color: 'bg-red-100 text-red-700' },
  error: { texto: 'Error en el pago', color: 'bg-red-100 text-red-700' },
  vencido: { texto: 'Pago vencido', color: 'bg-gray-100 text-gray-600' },
}

export default function Cuenta() {
  const { usuario, cerrarSesion, esAdmin } = useUsuario()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargandoPedidos, setCargandoPedidos] = useState(true)

  useEffect(() => {
    if (!usuario) return
    api
      .get('/pedidos/mios')
      .then((data) => setPedidos(data.pedidos))
      .catch(() => setPedidos([]))
      .finally(() => setCargandoPedidos(false))
  }, [usuario])

  async function handleSalir() {
    await cerrarSesion()
    navigate('/')
  }

  if (!usuario) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-6">No has iniciado sesión.</p>
        <Link to="/login" className="bg-brand-red text-white px-6 py-3 rounded-full font-semibold">
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">
        <i className="fa-regular fa-face-smile-wink" aria-hidden="true"></i>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2 text-gray-900">¡Hola, {usuario.nombre}!</h1>
      <p className="text-sm text-gray-500 mb-6">{usuario.correo}</p>
      <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
        Bienvenido a tu panel. Desde aquí puedes explorar nuestras deliciosas opciones y gestionar tus pedidos.
      </p>

      <div className="flex justify-center gap-4 flex-wrap">
        {esAdmin && (
          <Link
            to="/admin"
            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-gauge" aria-hidden="true"></i> Panel de Administración
          </Link>
        )}
        <Link
          to="/menu"
          className="bg-brand-red text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-red-dark transition shadow-md flex items-center gap-2"
        >
          <i className="fa-solid fa-pizza-slice" aria-hidden="true"></i> Ver el Menú
        </Link>
        <button
          onClick={handleSalir}
          className="bg-white border border-gray-200 text-gray-800 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Salir
        </button>
      </div>

      <div className="w-full max-w-2xl mt-16 mx-auto text-left">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-brand-red text-2xl mb-3">
            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
          </div>
          <h3 className="font-bold text-lg mb-4">Pedidos Recientes</h3>

          {cargandoPedidos && <p className="text-sm text-gray-500">Cargando tus pedidos...</p>}

          {!cargandoPedidos && pedidos.length === 0 && (
            <p className="text-sm text-gray-500">
              Aún no tienes pedidos recientes. ¡Anímate a probar nuestra Pizza Margherita!
            </p>
          )}

          {!cargandoPedidos && pedidos.length > 0 && (
            <div className="divide-y divide-gray-100">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">#{pedido.numero_seguimiento}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      {ESTADOS_LABEL[pedido.estado] || pedido.estado}
                    </span>
                  </div>
                  {pedido.metodo_pago === 'Pago en línea (Wompi)' && (
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-1 ${
                        ESTADOS_PAGO_LABEL[pedido.estado_pago]?.color || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ESTADOS_PAGO_LABEL[pedido.estado_pago]?.texto || pedido.estado_pago}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(pedido.creado_en).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' · '}
                    {pedido.items?.length || 0} producto(s)
                  </p>
                  <p className="text-sm font-semibold text-brand-red">{formatearPrecio(pedido.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
