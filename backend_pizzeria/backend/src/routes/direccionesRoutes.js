import { Router } from 'express'
import { listarDirecciones, crearDireccion, eliminarDireccion } from '../controllers/direccionesController.js'
import { requiereSesion } from '../middleware/auth.js'

const router = Router()

router.get('/', requiereSesion, listarDirecciones)
router.post('/', requiereSesion, crearDireccion)
router.delete('/:id', requiereSesion, eliminarDireccion)

export default router
