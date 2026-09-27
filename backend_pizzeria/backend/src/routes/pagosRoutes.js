import { Router } from 'express'
import { manejarWebhookWompi, consultarEstadoPago } from '../controllers/pagosController.js'

const router = Router()

// Wompi llama a esta URL directamente desde sus servidores (no desde el
// navegador del cliente) — por eso no lleva ningún middleware de sesión.
// La seguridad viene de verificar la firma del payload (ver wompi.js).
router.post('/webhook/wompi', manejarWebhookWompi)

// El frontend consulta esto tras volver del Widget de Wompi, para saber si
// el pago ya fue confirmado (público: funciona también para invitados).
router.get('/estado/:referencia', consultarEstadoPago)

export default router
