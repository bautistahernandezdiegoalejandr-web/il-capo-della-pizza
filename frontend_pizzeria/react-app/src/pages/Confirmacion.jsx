import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatearPrecio } from '../utils/formatearPrecio.js'

const INTERVALO_CONSULTA_MS = 2500
const INTENTOS_MAXIMOS = 24 // ~1 minuto en total

export default function Confirmacion() {
  const [pedido, setPedido] = useState(null)
  const [searchParams] = useSearchParams()
  const referencia = searchParams.get('referencia')

  // Solo aplica a pagos en línea (Wompi): mientras el backend no reciba el
  // webhook real de Wompi, el pago sigue "pendiente" — no lo damos por
  // exitoso solo porque el navegador volvió a esta pantalla.
  const [estadoPago, setEstadoPago] = useState(referencia ? 'pendiente' : null)
  const intentos = useRef(0)

  useEffect(() => {
    const guardado = localStorage.getItem('ilCapoPizza_ultimoPedido')
    if (guardado) setPedido(JSON.parse(guardado))
  }, [])

  useEffect(() => {
    if (!referencia) return

    const intervalo = setInterval(async () => {
      intentos.current += 1
      try {
        const data = await api.get(`/pagos/estado/${referencia}`)
        if (data.estadoPago !== 'pendiente') {
          setEstadoPago(data.estadoPago)
          clearInterval(intervalo)
        } else if (intentos.current >= INTENTOS_MAXIMOS) {
          // No es un error: solo significa que Wompi está tardando más de lo
          // usual en confirmarnos. El pedido sigue existiendo y se
          // actualizará solo apenas llegue el webhook.
          setEstadoPago('demorado')
          clearInterval(intervalo)
        }
      } catch {
        // Un fallo de red puntual no debe detener los reintentos.
      }
    }, INTERVALO_CONSULTA_MS)

    return () => clearInterval(intervalo)
  }, [referencia])

  const consultandoPago = referencia && estadoPago === 'pendiente'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      {estadoPago === 'declinado' || estadoPago === 'error' ? (
        <EstadoRechazado pedido={pedido} />
      ) : estadoPago === 'demorado' ? (
        <EstadoDemorado pedido={pedido} />
      ) : consultandoPago ? (
        <EstadoProcesando pedido={pedido} />
      ) : (
        <EstadoAprobado pedido={pedido} />
      )}
    </div>
  )
}

function EstadoProcesando({ pedido }) {
  return (
    <>
      <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 animate-pulse">
        <i className="fa-solid fa-clock" aria-hidden="true"></i>
      </div>
      <h1 className="font-serif text-4xl font-bold mb-4">Confirmando tu pago...</h1>
      <p className="text-gray-500 mb-10">
        Estamos esperando la confirmación de tu entidad de pago. Esto normalmente toma solo unos segundos, no
        cierres esta pantalla.
      </p>
      {pedido?.numero && (
        <p className="text-sm text-gray-500">
          Nº de seguimiento: <span className="font-bold text-brand-red">#{pedido.numero}</span>
        </p>
      )}
    </>
  )
}

function EstadoRechazado({ pedido }) {
  return (
    <>
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
      </div>
      <h1 className="font-serif text-4xl font-bold mb-4">El pago no se pudo completar</h1>
      <p className="text-gray-500 mb-10">
        Tu entidad de pago rechazó o canceló la transacción, así que no se realizó ningún cobro. El pedido quedó
        cancelado — puedes intentarlo de nuevo cuando quieras.
      </p>
      {pedido?.numero && (
        <p className="text-sm text-gray-500 mb-6">
          Nº de referencia: <span className="font-semibold text-gray-700">#{pedido.numero}</span>
        </p>
      )}
      <Link
        to="/carrito"
        className="bg-brand-red text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-red-dark transition inline-block"
      >
        Volver al Carrito
      </Link>
    </>
  )
}

function EstadoDemorado({ pedido }) {
  return (
    <>
      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
        <i className="fa-solid fa-hourglass-half" aria-hidden="true"></i>
      </div>
      <h1 className="font-serif text-4xl font-bold mb-4">Tu pago sigue en proceso</h1>
      <p className="text-gray-500 mb-10">
        Tu entidad de pago está tardando más de lo usual en confirmarnos. Tu pedido no se perdió — apenas se
        confirme, quedará reflejado automáticamente en "Mis Pedidos". Puedes cerrar esta pantalla con tranquilidad.
      </p>
      {pedido?.numero && (
        <p className="text-sm text-gray-500 mb-6">
          Nº de referencia: <span className="font-semibold text-gray-700">#{pedido.numero}</span>
        </p>
      )}
      <Link
        to="/cuenta"
        className="bg-brand-red text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-red-dark transition inline-block"
      >
        Ver Mis Pedidos
      </Link>
    </>
  )
}

function EstadoAprobado({ pedido }) {
  return (
    <>
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
        <i className="fa-solid fa-check" aria-hidden="true"></i>
      </div>
      <h1 className="font-serif text-4xl font-bold mb-4">¡Pedido Confirmado!</h1>
      <p className="text-gray-500 mb-2">
        Gracias por tu compra. Tu pizza ya está en camino a la cocina — te avisaremos apenas salga hacia tu dirección.
      </p>
      {pedido?.numero && (
        <p className="text-sm text-gray-500 mb-10">
          Nº de seguimiento: <span className="font-bold text-brand-red">#{pedido.numero}</span>
        </p>
      )}

      {pedido && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-left mb-10">
          {pedido.envio && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-brand-red" aria-hidden="true"></i> Dirección de Entrega
              </h3>
              <p className="text-sm text-gray-600">{pedido.envio.nombre}</p>
              <p className="text-sm text-gray-600">
                {pedido.envio.direccion}, {pedido.envio.ciudad}
                {pedido.envio.codigoPostal ? ` (${pedido.envio.codigoPostal})` : ''}
              </p>
              <p className="text-sm text-gray-600">{pedido.envio.telefono}</p>
            </div>
          )}

          <h3 className="font-bold text-lg mb-4">Resumen de tu pedido</h3>
          <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
            {pedido.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-bold">{formatearPrecio(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>
          {pedido.metodoPago && (
            <p className="text-xs text-gray-500 mb-4">
              Pagado con: <span className="font-semibold text-gray-700">{pedido.metodoPago}</span>
            </p>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-red">{formatearPrecio(pedido.total)}</span>
          </div>
        </div>
      )}

      <Link
        to="/menu"
        className="bg-brand-red text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-red-dark transition inline-block"
      >
        Volver al Menú
      </Link>
    </>
  )
}
