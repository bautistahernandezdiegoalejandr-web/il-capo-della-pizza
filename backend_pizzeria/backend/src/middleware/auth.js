import { verificarToken } from '../utils/token.js'

// Exige que la petición traiga una sesión válida (cookie httpOnly con el JWT).
export function requiereSesion(req, res, next) {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'No has iniciado sesión' })
  }
  try {
    req.usuario = verificarToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Tu sesión expiró, inicia sesión de nuevo' })
  }
}

// Igual que requiereSesion, pero no falla si no hay token — solo adjunta el
// usuario si existe. Útil para endpoints públicos que se comportan distinto
// si el visitante está logueado (ej. checkout como invitado vs. registrado).
export function sesionOpcional(req, res, next) {
  const token = req.cookies?.token
  if (token) {
    try {
      req.usuario = verificarToken(token)
    } catch {
      // token inválido/expirado: seguimos como invitado, sin lanzar error
    }
  }
  next()
}

// Exige, además de sesión válida, que el usuario tenga rol 'admin'.
// Se usa en todas las rutas del panel de administración.
export function requiereAdmin(req, res, next) {
  requiereSesion(req, res, () => {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' })
    }
    next()
  })
}
