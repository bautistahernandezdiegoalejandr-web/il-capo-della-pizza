import { pool } from '../config/db.js'
import { verificarFirmaWebhook } from '../utils/wompi.js'

// POST /api/pagos/webhook/wompi
// Wompi llama a esta URL automáticamente cada vez que el estado de una
// transacción cambia (aprobada, rechazada, etc.) — es la única fuente de
// verdad real sobre si un pago se completó. Nunca confiamos en que el
// cliente simplemente "llegó" a la pantalla de confirmación.
export async function manejarWebhookWompi(req, res) {
  // Respondemos 200 rápido incluso ante datos inválidos (evita que Wompi
  // reintente indefinidamente por errores que no se van a arreglar solos),
  // pero solo procesamos el evento si la firma es válida.
  if (!verificarFirmaWebhook(req.body)) {
    console.warn('Webhook de Wompi con firma inválida — ignorado')
    return res.status(400).json({ error: 'Firma inválida' })
  }

  const transaccion = req.body?.data?.transaction
  if (!transaccion?.reference || !transaccion?.status) {
    return res.status(400).json({ error: 'Payload de transacción incompleto' })
  }

  const conn = await pool.getConnection()
  try {
    const [filas] = await conn.query('SELECT * FROM pedidos WHERE referencia_pago = ?', [transaccion.reference])
    const pedido = filas[0]
    if (!pedido) {
      console.warn(`Webhook de Wompi para una referencia desconocida: ${transaccion.reference}`)
      return res.status(200).json({ ok: true }) // 200 igual: no es culpa de Wompi, no queremos reintentos
    }

    // Idempotencia: si este pedido YA estaba marcado como aprobado, no
    // repetimos el descuento de inventario aunque Wompi reenvíe el mismo evento.
    if (pedido.estado_pago === 'aprobado') {
      return res.status(200).json({ ok: true })
    }

    const nuevoEstadoPago =
      transaccion.status === 'APPROVED'
        ? 'aprobado'
        : transaccion.status === 'DECLINED' || transaccion.status === 'VOIDED'
          ? 'declinado'
          : transaccion.status === 'ERROR'
            ? 'error'
            : 'pendiente'

    await conn.beginTransaction()

    await conn.query(
      'UPDATE pedidos SET estado_pago = ?, wompi_transaccion_id = ? WHERE id = ?',
      [nuevoEstadoPago, transaccion.id, pedido.id],
    )

    // Solo al aprobarse el pago descontamos inventario — antes de eso el
    // producto seguía disponible para otros clientes (ver pedidosController.js).
    if (nuevoEstadoPago === 'aprobado') {
      const [items] = await conn.query('SELECT * FROM pedido_items WHERE pedido_id = ?', [pedido.id])
      for (const item of items) {
        if (item.producto_id) {
          await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.producto_id])
        }
      }
    }

    // Si el pago fue rechazado, cancelamos el pedido automáticamente.
    if (nuevoEstadoPago === 'declinado' || nuevoEstadoPago === 'error') {
      await conn.query('UPDATE pedidos SET estado = ? WHERE id = ?', ['cancelado', pedido.id])
    }

    await conn.commit()
    res.status(200).json({ ok: true })
  } catch (err) {
    await conn.rollback()
    console.error('Error procesando webhook de Wompi:', err)
    res.status(500).json({ error: 'Error interno procesando el webhook' })
  } finally {
    conn.release()
  }
}

// GET /api/pagos/estado/:referencia  (público — el frontend lo consulta tras
// volver del Widget de Wompi, para saber si ya se confirmó el pago)
export async function consultarEstadoPago(req, res, next) {
  try {
    const [filas] = await pool.query(
      'SELECT numero_seguimiento, estado, estado_pago, total FROM pedidos WHERE referencia_pago = ?',
      [req.params.referencia],
    )
    const pedido = filas[0]
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

    res.json({
      numeroSeguimiento: pedido.numero_seguimiento,
      estado: pedido.estado,
      estadoPago: pedido.estado_pago,
      total: pedido.total,
    })
  } catch (err) {
    next(err)
  }
}
