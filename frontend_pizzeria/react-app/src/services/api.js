// Cliente centralizado para hablar con el backend real (Fase 2).
// `credentials: 'include'` es indispensable: es lo que hace que el navegador
// envíe/reciba la cookie httpOnly de sesión en cada petición.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function peticion(path, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  })

  const data = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new Error(data.error || 'Ocurrió un error al comunicarse con el servidor')
  }
  return data
}

export const api = {
  get: (path) => peticion(path),
  post: (path, body) => peticion(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => peticion(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => peticion(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => peticion(path, { method: 'DELETE' }),
}
