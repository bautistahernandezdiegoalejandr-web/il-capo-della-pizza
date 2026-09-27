import { Router } from 'express'
import {
  crearPedido,
  listarMisPedidos,
  listarPedidosAdmin,
  actualizarEstadoPedido,
} from '../controllers/pedidosController.js'
import { requiereSesion, requiereAdmin, sesionOpcional } from '../middleware/auth.js'

const router = Router()

// Checkout: funciona con sesión (queda asociado al usuario) o como invitado
router.post('/', sesionOpcional, crearPedido)

// Pedidos del propio usuario logueado
router.get('/mios', requiereSesion, listarMisPedidos)

// Panel de administración
router.get('/admin/todos', requiereAdmin, listarPedidosAdmin)
router.patch('/admin/:id/estado', requiereAdmin, actualizarEstadoPedido)

export default router
