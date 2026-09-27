import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useUsuario } from '../context/UsuarioContext.jsx'
import { COSTO_ENVIO, IVA_PORCENTAJE } from '../data/menuData.js'
import { formatearPrecio } from '../utils/formatearPrecio.js'
import { api } from '../services/api.js'

export default function Pago() {
  const { carrito, subtotal, vaciarCarrito } = useCarrito()
  const { usuario } = useUsuario()
  const navigate = useNavigate()

  const [paso, setPaso] = useState(1)
  const [envio, setEnvio] = useState({
    nombre: 'Mario Rossi',
    direccion: 'Calle 93 #15-32',
    ciudad: 'Bogotá',
    codigoPostal: '110221',
    telefono: '+57 300 456 7890',
  })
  const [metodoPago, setMetodoPago] = useState('Efectivo a la Entrega')
  const [enviando, setEnviando] = useState(false)
  const [errorPedido, setErrorPedido] = useState(null)
  const [erroresEnvio, setErroresEnvio] = useState({})

  // Direcciones guardadas del usuario (solo si inició sesión)
  const [direccionesGuardadas, setDireccionesGuardadas] = useState([])
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState('nueva')
  const [guardarDireccion, setGuardarDireccion] = useState(false)

  useEffect(() => {
    if (!usuario) return
    api
      .get('/direcciones')
      .then((data) => {
        setDireccionesGuardadas(data.direcciones)
        const predeterminada = data.direcciones.find((d) => d.predeterminada) || data.direcciones[0]
        if (predeterminada) {
          seleccionarDireccionGuardada(predeterminada)
        }
      })
      .catch(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  function seleccionarDireccionGuardada(direccion) {
    setDireccionSeleccionadaId(direccion.id)
    setEnvio({
      nombre: direccion.nombre,
      direccion: direccion.direccion,
      ciudad: direccion.ciudad,
      codigoPostal: direccion.codigo_postal || '',
      telefono: direccion.telefono,
    })
    setErroresEnvio({})
  }

  function usarDireccionNueva() {
    setDireccionSeleccionadaId('nueva')
    setEnvio({ nombre: '', direccion: '', ciudad: '', codigoPostal: '', telefono: '' })
  }

  const iva = subtotal * IVA_PORCENTAJE
  const total = subtotal + COSTO_ENVIO + iva

  function validarEnvioYContinuar() {
    const errores = {}
    if (!envio.nombre.trim()) errores.nombre = 'Ingresa el nombre de quien recibe'
    if (!envio.direccion.trim()) errores.direccion = 'Ingresa la dirección de entrega'
    if (!envio.ciudad.trim()) errores.ciudad = 'Ingresa la ciudad'
    if (!envio.telefono.trim()) errores.telefono = 'Ingresa un teléfono de contacto'

    setErroresEnvio(errores)
    if (Object.keys(errores).length > 0) return

    if (usuario && guardarDireccion && direccionSeleccionadaId === 'nueva') {
      api
        .post('/direcciones', {
          nombre: envio.nombre,
          direccion: envio.direccion,
          ciudad: envio.ciudad,
          codigoPostal: envio.codigoPostal,
          telefono: envio.telefono,
          predeterminada: direccionesGuardadas.length === 0,
        })
        .catch(() => { })
    }

    setPaso(2)
  }

  async function handleRealizarPedido() {
    setEnviando(true)
    setErrorPedido(null)
    try {
      const items = carrito.map((item) => ({
        productoId: typeof item.id === 'number' ? item.id : null,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio, // ignorado por el backend cuando hay productoId o personalizacion
        cantidad: item.cantidad,
        personalizacion: item.personalizacion || null,
      }))

      const { pedido, pago } = await api.post('/pedidos', { items, direccion: envio, metodoPago })

      localStorage.setItem(
        'ilCapoPizza_ultimoPedido',
        JSON.stringify({ ...pedido, items: carrito, envio, metodoPago, numero: pedido.numeroSeguimiento }),
      )

      if (metodoPago === 'Efectivo a la Entrega') {
        // No hay pasarela de por medio: el pedido ya queda confirmado tal
        // como antes (el pago se hace en persona al recibirlo).
        vaciarCarrito()
        navigate('/confirmacion')
        return
      }

      // Pago en línea: abrimos el Widget de Wompi con los datos que generó
      // el backend (incluida la firma de integridad calculada con la llave
      // secreta — nunca la generamos en el navegador). El pedido queda
      // creado con estado_pago = "pendiente"; se confirma solo, en el
      // servidor, cuando llegue el webhook real de Wompi (no cuando el
      // navegador "cree" que terminó).
      if (!window.WidgetCheckout) {
        throw new Error('No se pudo cargar la pasarela de pago. Recarga la página e inténtalo de nuevo.')
      }

      const checkout = new window.WidgetCheckout({
        currency: pago.moneda,
        amountInCents: pago.montoEnCentavos,
        reference: pago.referencia,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY, 
        redirectUrl: pago.redirectUrl,
        signature: { integrity: pago.firmaIntegridad },
      })

      vaciarCarrito()
      checkout.open(() => {
        // Este callback se dispara al cerrar el widget (haya pagado o no).
        // La confirmación real la resuelve la pantalla de Confirmación
        // consultando el estado del pedido en el backend.
        navigate(`/confirmacion?referencia=${pago.referencia}`)
      })
    } catch (err) {
      setErrorPedido(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/menu" className="hover:text-brand-red">
          Menú
        </Link>{' '}
        /{' '}
        <Link to="/carrito" className="hover:text-brand-red">
          Carrito
        </Link>{' '}
        / <span className="font-semibold text-gray-800">Pago</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          {/* Paso 1: Envío */}
          <PasoAcordeon numero={1} titulo="Dirección de Entrega" activo={paso === 1} completado={paso > 1}>
            {usuario && direccionesGuardadas.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Tus direcciones guardadas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {direccionesGuardadas.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => seleccionarDireccionGuardada(d)}
                      className={`text-left border-2 rounded-xl p-3 text-sm transition ${direccionSeleccionadaId === d.id ? 'border-brand-red bg-red-50/20' : 'border-gray-200 hover:border-red-300'
                        }`}
                    >
                      <span className="font-bold block">{d.nombre}</span>
                      <span className="text-gray-500 block">
                        {d.direccion}, {d.ciudad}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={usarDireccionNueva}
                    className={`text-left border-2 border-dashed rounded-xl p-3 text-sm transition flex items-center gap-2 ${direccionSeleccionadaId === 'nueva' ? 'border-brand-red text-brand-red' : 'border-gray-300 text-gray-500 hover:border-red-300'
                      }`}
                  >
                    <i className="fa-solid fa-plus" aria-hidden="true"></i> Usar una dirección nueva
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo
                label="Nombre completo"
                value={envio.nombre}
                onChange={(v) => setEnvio({ ...envio, nombre: v })}
                error={erroresEnvio.nombre}
              />
              <Campo
                label="Teléfono"
                value={envio.telefono}
                onChange={(v) => setEnvio({ ...envio, telefono: v })}
                error={erroresEnvio.telefono}
              />
              <Campo
                label="Dirección"
                value={envio.direccion}
                onChange={(v) => setEnvio({ ...envio, direccion: v })}
                className="md:col-span-2"
                error={erroresEnvio.direccion}
              />
              <Campo
                label="Ciudad"
                value={envio.ciudad}
                onChange={(v) => setEnvio({ ...envio, ciudad: v })}
                error={erroresEnvio.ciudad}
              />
              <Campo
                label="Código Postal"
                value={envio.codigoPostal}
                onChange={(v) => setEnvio({ ...envio, codigoPostal: v })}
              />
            </div>

            {usuario && direccionSeleccionadaId === 'nueva' && (
              <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardarDireccion}
                  onChange={(e) => setGuardarDireccion(e.target.checked)}
                  className="w-4 h-4 text-brand-red"
                />
                Guardar esta dirección en mi cuenta para la próxima vez
              </label>
            )}

            <button
              onClick={validarEnvioYContinuar}
              className="mt-6 bg-brand-red text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-red-dark transition"
            >
              Continuar a Método de Pago
            </button>
          </PasoAcordeon>

          {/* Paso 2: Método de Pago */}
          <PasoAcordeon numero={2} titulo="Forma de Pago" activo={paso === 2} completado={paso > 2}>
            <div className="space-y-4">
              <OpcionPago
                seleccionado={metodoPago === 'Pago en línea (Wompi)'}
                onClick={() => setMetodoPago('Pago en línea (Wompi)')}
                titulo="Pago en línea"
                icono={
                  <div className="flex gap-2 text-lg text-gray-600">
                    <i className="fa-brands fa-cc-visa text-blue-600" aria-hidden="true"></i>
                    <i className="fa-brands fa-cc-mastercard text-red-500" aria-hidden="true"></i>
                    <i className="fa-solid fa-building-columns text-blue-700" aria-hidden="true"></i>
                  </div>
                }
                descripcion="Tarjeta, PSE, Nequi o Bancolombia — se abre un checkout seguro de Wompi. Nosotros nunca vemos ni guardamos los datos de tu tarjeta."
                deshabilitado
                etiquetaDeshabilitado="Próximamente"
              />

              <OpcionPago
                seleccionado={metodoPago === 'Efectivo a la Entrega'}
                onClick={() => setMetodoPago('Efectivo a la Entrega')}
                titulo="Efectivo a la Entrega"
                icono={<i className="fa-solid fa-money-bill-wave text-green-600 text-xl" aria-hidden="true"></i>}
                descripcion="Pagas directamente al repartidor cuando recibas tu pedido caliente."
              />
            </div>
            <button
              onClick={() => setPaso(3)}
              className="mt-6 bg-brand-red text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-red-dark transition"
            >
              Continuar a Revisar Pedido
            </button>
          </PasoAcordeon>

          {/* Paso 3: Revisar */}
          <PasoAcordeon numero={3} titulo="Revisar Pedido" activo={paso === 3} completado={false}>
            <p className="text-gray-500 mb-4">Revisa que toda la información de tu pedido sea correcta antes de confirmar.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-brand-red" aria-hidden="true"></i> Dirección de Entrega
                  </h4>
                  <button onClick={() => setPaso(1)} className="text-brand-red text-sm font-semibold">
                    Editar
                  </button>
                </div>
                <p className="text-xs text-gray-600">{envio.nombre}</p>
                <p className="text-xs text-gray-500">
                  {envio.direccion}, {envio.ciudad}
                </p>
                <p className="text-xs text-gray-500">{envio.telefono}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold flex items-center gap-2">
                    <i className="fa-solid fa-credit-card text-brand-red" aria-hidden="true"></i> Forma de Pago
                  </h4>
                  <button onClick={() => setPaso(2)} className="text-brand-red text-sm font-semibold">
                    Editar
                  </button>
                </div>
                <p className="text-xs text-gray-700 font-bold">{metodoPago}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metodoPago === 'Efectivo a la Entrega'
                    ? 'Pagas en efectivo al recibir tu pedido'
                    : 'Se abrirá un checkout seguro para completar el pago'}
                </p>
              </div>
            </div>

            <h4 className="font-bold mb-3">Detalle de Productos</h4>
            <div className="space-y-2 mb-6">
              {carrito.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.cantidad}x {item.nombre}
                  </span>
                  <span className="font-bold">{formatearPrecio(item.precio * item.cantidad)}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setPaso(2)} className="text-gray-500 hover:text-gray-800 text-sm font-semibold flex items-center gap-1">
              <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true"></i> Volver a Método de Pago
            </button>
          </PasoAcordeon>
        </div>

        {/* Resumen lateral */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-serif text-2xl font-bold mb-6">Resumen del Pedido</h3>
            <div className="space-y-2 mb-6 pb-6 border-b border-gray-100">
              {carrito.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-bold">{item.nombre}</p>
                    <p className="text-gray-500">Cantidad: {item.cantidad}</p>
                  </div>
                  <span>{formatearPrecio(item.precio * item.cantidad)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-6 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatearPrecio(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Coste de Envío</span>
                <span>{formatearPrecio(COSTO_ENVIO)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (19%)</span>
                <span>{formatearPrecio(iva)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-xl">Total</span>
              <span className="font-bold text-3xl text-brand-red">{formatearPrecio(total)}</span>
            </div>
            {errorPedido && (
              <p className="text-red-600 text-sm mb-3" role="alert">
                {errorPedido}
              </p>
            )}
            <button
              disabled={paso < 3 || carrito.length === 0 || enviando}
              onClick={handleRealizarPedido}
              className="w-full bg-brand-red text-white py-4 rounded-xl font-bold hover:bg-brand-red-dark transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enviando
                ? 'Procesando...'
                : metodoPago === 'Efectivo a la Entrega'
                  ? 'Realizar Pedido'
                  : 'Ir a Pagar'}
              {!enviando && <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PasoAcordeon({ numero, titulo, activo, completado, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${completado ? 'bg-green-600 text-white' : activo ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-500'
            }`}
        >
          {completado ? <i className="fa-solid fa-check" aria-hidden="true"></i> : numero}
        </span>
        <h2 className="font-bold text-lg">{titulo}</h2>
      </div>
      {activo && <div className="p-6">{children}</div>}
    </div>
  )
}

function Campo({ label, value, onChange, className = '', error }) {
  const id = 'campo-' + label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-brand-red outline-none transition ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-brand-red'
          }`}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}

function OpcionPago({ seleccionado, onClick, titulo, icono, descripcion, deshabilitado = false, etiquetaDeshabilitado }) {
  return (
    <label
      title={deshabilitado ? etiquetaDeshabilitado : undefined}
      className={`border-2 rounded-xl p-4 flex items-start transition ${deshabilitado
          ? 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50'
          : `cursor-pointer hover:border-brand-red ${seleccionado ? 'border-brand-red bg-red-50/20' : 'border-gray-200'}`
        }`}
    >
      <input
        type="radio"
        name="metodoPago"
        checked={seleccionado}
        onChange={onClick}
        disabled={deshabilitado}
        className="mt-1 text-brand-red focus:ring-brand-red disabled:cursor-not-allowed"
      />
      <div className="ml-3 flex-grow">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-gray-800">{titulo}</span>
          <div className="flex items-center gap-2">
            {deshabilitado && etiquetaDeshabilitado && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {etiquetaDeshabilitado}
              </span>
            )}
            {icono}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{descripcion}</p>
      </div>
    </label>
  )
}
