import { Router } from 'express'
import authRoutes from './authRoutes.js'
import productosRoutes from './productosRoutes.js'
import pedidosRoutes from './pedidosRoutes.js'
import direccionesRoutes from './direccionesRoutes.js'
import pagosRoutes from './pagosRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/productos', productosRoutes)
router.use('/pedidos', pedidosRoutes)
router.use('/direcciones', direccionesRoutes)
router.use('/pagos', pagosRoutes)

export default router
