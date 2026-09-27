// Fuente de verdad de las opciones de "Crea tu Pizza". Deben mantenerse
// sincronizadas con src/data/menuData.js del frontend (TAMANOS/MASAS/EXTRAS),
// ya que el frontend las usa para mostrar la interfaz, pero es ESTE archivo
// el que decide el precio real que se cobra — nunca se confía en el precio
// que manda el navegador (ver pedidosController.js).

export const TAMANOS = {
  pequena: { label: 'Pequeña', precio: 18000 },
  mediana: { label: 'Mediana', precio: 26000 },
  familiar: { label: 'Familiar', precio: 34000 },
}

export const MASAS = {
  fina: { label: 'Fina', precio: 0 },
  clasica: { label: 'Clásica', precio: 3000 },
  'borde-queso': { label: 'Borde de Queso', precio: 5000 },
}

export const EXTRAS = {
  pepperoni: { label: 'Pepperoni', precio: 3000 },
  champinones: { label: 'Champiñones', precio: 2000 },
  pimientos: { label: 'Pimientos', precio: 2000 },
  aceitunas: { label: 'Aceitunas', precio: 1500 },
}

// Calcula el precio real de una pizza personalizada a partir de las
// opciones elegidas, ignorando cualquier precio que haya mandado el cliente.
export function calcularPrecioPersonalizada({ tamanoId, masaId, extrasIds = [] }) {
  const tamano = TAMANOS[tamanoId]
  const masa = MASAS[masaId]
  if (!tamano || !masa) {
    throw Object.assign(new Error('Tamaño o masa inválidos en la pizza personalizada'), { status: 400 })
  }

  let precioExtras = 0
  const nombresExtras = []
  for (const id of extrasIds) {
    const extra = EXTRAS[id]
    if (!extra) {
      throw Object.assign(new Error(`Extra inválido: ${id}`), { status: 400 })
    }
    precioExtras += extra.precio
    nombresExtras.push(extra.label)
  }

  const precio = tamano.precio + masa.precio + precioExtras
  const nombre = `Pizza Personalizada (${tamano.label})`
  const descripcion = `Masa ${masa.label}${nombresExtras.length ? ` · Extras: ${nombresExtras.join(', ')}` : ''}`

  return { precio, nombre, descripcion }
}
