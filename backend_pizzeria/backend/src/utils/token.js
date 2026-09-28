import jwt from 'jsonwebtoken'

export function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

export function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

// Opciones de la cookie httpOnly donde guardamos el token de sesión.
// httpOnly: JavaScript del navegador NO puede leerla (protege contra XSS).
// secure: solo se envía por HTTPS en producción.
// sameSite: 'none' en producción porque el frontend (Vercel) y el backend (Render)
// están en dominios distintos; 'none' exige secure: true.
export function opcionesCookieSesion() {
  const esProduccion = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: esProduccion,
    sameSite: esProduccion ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  }
}
