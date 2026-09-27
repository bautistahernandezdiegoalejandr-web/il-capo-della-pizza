import { Router } from 'express'
import {
  listarProductos,
  listarProductosAdmin,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/productosController.js'
import { requiereAdmin } from '../middleware/auth.js'

const router = Router()

// Público — usado por el catálogo del sitio (antes menuData.js hardcodeado)
router.get('/', listarProductos)

// Panel de administración
router.get('/admin/todos', requiereAdmin, listarProductosAdmin)
router.post('/admin', requiereAdmin, crearProducto)
router.put('/admin/:id', requiereAdmin, actualizarProducto)
router.delete('/admin/:id', requiereAdmin, eliminarProducto)

export default router
