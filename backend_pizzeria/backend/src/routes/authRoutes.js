import { Router } from 'express'
import {
  registrar,
  iniciarSesion,
  cerrarSesion,
  obtenerSesionActual,
  solicitarRecuperacion,
  restablecerPassword,
} from '../controllers/authController.js'
import { requiereSesion } from '../middleware/auth.js'

const router = Router()

router.post('/registro', registrar)
router.post('/login', iniciarSesion)
router.post('/logout', cerrarSesion)
router.get('/me', requiereSesion, obtenerSesionActual)
router.post('/olvide-password', solicitarRecuperacion)
router.post('/restablecer-password', restablecerPassword)

export default router
