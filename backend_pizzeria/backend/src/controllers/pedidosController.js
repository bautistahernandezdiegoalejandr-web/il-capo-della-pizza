import { pool } from '../config/db.js'
import { calcularPrecioPersonalizada } from '../data/personalizacionData.js'
import { generarFirmaIntegridad } from '../utils/wompi.js'

const COSTO_ENVIO = 6000
const IVA_PORCENTAJE = 0.19
const METODOS_VALIDOS = ['Pago en línea (Wompi)', 'Efectivo a la Entrega']

function generarNumeroSeguimiento() {
  const aleatorio = Math.floor(10000 + Math.random() * 90000)
  return `ILCAPO-${aleatorio}`
}

// POST /api/pedidos  (checkout — funciona con o sin sesión iniciada)
export async function crearPedido(req, res, next) {
  const conn = await pool.getConnection()
  try {
    const { items, direccion, metodoPago } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El pedido no tiene productos' })
    }
    if (!direccion?.nombre || !direccion?.direccion || !direccion?.ciudad || !direccion?.telefono) {
      return res.status(400).json({ error: 'Falta información de la dirección de entrega' })
    }
    if (!METODOS_VALIDOS.includes(metodoPago)) {
      return res.status(400).json({ error: 'Método de pago inválido' })
    }

    // IMPORTANTE: nunca confiamos en los precios que manda el navegador.
    // Para productos del catálogo, recalculamos el precio real desde la
    // base de datos — así nadie puede manipular el total editando el
    // JavaScript del navegador antes de pagar.
    const idsProductos = items.filter((i) => i.productoId).map((i) => i.productoId)
    let preciosDb = {}
    if (idsProductos.length > 0) {
      const [filas] = await conn.query(
        `SELECT id, nombre, precio, stock FROM productos WHERE id IN (?)`,
        [idsProductos],
      )
      preciosDb = Object.fromEntries(filas.map((f) => [f.id, f]))
    }

    const itemsValidados = items.map((item) => {
      if (item.productoId) {
        const producto = preciosDb[item.productoId]
        if (!producto) throw Object.assign(new Error(`Producto ${item.productoId} no existe`), { status: 400 })
        if (producto.stock < item.cantidad) {
          throw Object.assign(new Error(`No hay suficiente stock de "${producto.nombre}"`), { status: 409 })
        }
        return {
          productoId: item.productoId,
          nombre: producto.nombre,
          descripcion: item.descripcion || null,
          precio: producto.precio,
          cantidad: item.cantidad,
        }
      }
      // Pizza personalizada ("Crea tu Pizza"): recalculamos el precio real a
      // partir de las opciones elegidas — nunca confiamos en item.precio.
      if (!item.personalizacion) {
        throw Object.assign(new Error('Falta la información de personalización de la pizza'), { status: 400 })
      }
      const { precio, nombre, descripcion } = calcularPrecioPersonalizada(item.personalizacion)
      return {
        productoId: null,
        nombre,
        descripcion,
        precio,
        cantidad: item.cantidad,
      }
    })

    const subtotal = itemsValidados.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    const iva = Math.round(subtotal * IVA_PORCENTAJE)
    const total = subtotal + COSTO_ENVIO + iva
    const numeroSeguimiento = generarNumeroSeguimiento()
    const referenciaPago = numeroSeguimiento // reutilizamos el mismo valor como referencia única para Wompi
    const usuarioId = req.usuario?.id || null
    const esPagoEnLinea = metodoPago === 'Pago en línea (Wompi)'

    await conn.beginTransaction()

    const [resultadoPedido] = await conn.query(
      `INSERT INTO pedidos
         (numero_seguimiento, referencia_pago, usuario_id, direccion_nombre, direccion_texto, direccion_ciudad,
          direccion_telefono, metodo_pago, estado_pago, subtotal, costo_envio, iva, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numeroSeguimiento, referenciaPago, usuarioId, direccion.nombre, direccion.direccion, direccion.ciudad,
        direccion.telefono, metodoPago, esPagoEnLinea ? 'pendiente' : 'pendiente', subtotal, COSTO_ENVIO, iva, total,
      ],
    )
    const pedidoId = resultadoPedido.insertId

    for (const item of itemsValidados) {
      await conn.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, descripcion, precio_unitario, cantidad)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, item.productoId, item.nombre, item.descripcion, item.precio, item.cantidad],
      )
      // El inventario solo se descuenta de inmediato para pedidos en efectivo
      // (ya están confirmados). Para pagos en línea, el descuento ocurre
      // recién cuando Wompi confirma el pago vía webhook — ver pagosController.js.
      // Así evitamos "reservar" stock de pagos que nunca se completan.
      if (item.productoId && !esPagoEnLinea) {
        await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.productoId])
      }
    }

    await conn.commit()

    const respuesta = {
      pedido: {
        id: pedidoId,
        numeroSeguimiento,
        referenciaPago,
        subtotal,
        costoEnvio: COSTO_ENVIO,
        iva,
        total,
        estado: 'recibido',
        estadoPago: 'pendiente',
      },
    }

    // Si es pago en línea, el frontend necesita estos datos para abrir el
    // Widget de Wompi. La firma de integridad se genera aquí, en el
    // servidor, con la llave secreta — nunca debe calcularse en el navegador.
    if (esPagoEnLinea) {
      const montoEnCentavos = total * 100 // Wompi siempre trabaja en centavos
      respuesta.pago = {
        publicKey: process.env.WOMPI_PUBLIC_KEY,
        referencia: referenciaPago,
        montoEnCentavos,
        moneda: 'COP',
        firmaIntegridad: generarFirmaIntegridad({ referencia: referenciaPago, montoEnCentavos, moneda: 'COP' }),
        redirectUrl: `${process.env.FRONTEND_URL}/confirmacion?referencia=${referenciaPago}`,
      }
    }

    res.status(201).json(respuesta)
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

// GET /api/pedidos/mios  (requiere sesión)
export async function listarMisPedidos(req, res, next) {
  try {
    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY creado_en DESC',
      [req.usuario.id],
    )
    for (const pedido of pedidos) {
      const [items] = await pool.query('SELECT * FROM pedido_items WHERE pedido_id = ?', [pedido.id])
      pedido.items = items
    }
    res.json({ pedidos })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/pedidos  (panel de administración — con filtro opcional por estado)
export async function listarPedidosAdmin(req, res, next) {
  try {
    const { estado } = req.query
    let sql = 'SELECT * FROM pedidos'
    const params = []
    if (estado) {
      sql += ' WHERE estado = ?'
      params.push(estado)
    }
    sql += ' ORDER BY creado_en DESC LIMIT 200'
    const [pedidos] = await pool.query(sql, params)

    for (const pedido of pedidos) {
      const [items] = await pool.query('SELECT * FROM pedido_items WHERE pedido_id = ?', [pedido.id])
      pedido.items = items
    }
    res.json({ pedidos })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/admin/pedidos/:id/estado
export async function actualizarEstadoPedido(req, res, next) {
  try {
    const { estado } = req.body
    const estadosValidos = ['recibido', 'en_preparacion', 'en_camino', 'entregado', 'cancelado']
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' })
    }

    // No dejamos que la cocina avance un pedido de pago en línea que todavía
    // no fue confirmado por Wompi — evita preparar pizzas que nadie pagó.
    const [filas] = await pool.query('SELECT metodo_pago, estado_pago FROM pedidos WHERE id = ?', [req.params.id])
    const pedido = filas[0]
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    if (pedido.metodo_pago === 'Pago en línea (Wompi)' && pedido.estado_pago !== 'aprobado' && estado !== 'cancelado') {
      return res.status(409).json({ error: 'Este pedido todavía no tiene el pago confirmado por Wompi' })
    }

    await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
