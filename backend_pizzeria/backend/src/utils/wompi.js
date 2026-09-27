import crypto from 'node:crypto'

// Firma de integridad que exige el Widget de Wompi para abrir el checkout.
// Fórmula oficial: SHA-256( referencia + montoEnCentavos + moneda + llaveSecreta )
// https://docs.wompi.co/en/docs/colombia/widget-checkout-web/ → "Generate an integrity signature"
export function generarFirmaIntegridad({ referencia, montoEnCentavos, moneda = 'COP' }) {
  const cadena = `${referencia}${montoEnCentavos}${moneda}${process.env.WOMPI_INTEGRITY_SECRET}`
  return crypto.createHash('sha256').update(cadena).digest('hex')
}

// Lee una ruta tipo "transaction.status" dentro de un objeto anidado.
function leerPropiedad(objeto, ruta) {
  return ruta.split('.').reduce((valor, clave) => (valor == null ? undefined : valor[clave]), objeto)
}

// Verifica que un webhook realmente venga de Wompi (y no de alguien
// haciéndose pasar por ellos) recalculando el checksum con nuestra llave de
// eventos secreta y comparándolo contra el que mandó Wompi.
// Wompi indica en `signature.properties` qué propiedades de `data` usó para
// calcular el checksum, en qué orden — así que las leemos dinámicamente en
// vez de asumir siempre las mismas 3, por si Wompi cambia el set en el futuro.
export function verificarFirmaWebhook(body) {
  const { data, signature, timestamp } = body || {}
  if (!data || !signature?.properties || !signature?.checksum || !timestamp) {
    return false
  }

  const valores = signature.properties.map((ruta) => leerPropiedad(data, ruta)).join('')
  const cadena = `${valores}${timestamp}${process.env.WOMPI_EVENTS_SECRET}`
  const checksumCalculado = crypto.createHash('sha256').update(cadena).digest('hex').toUpperCase()

  return checksumCalculado === String(signature.checksum).toUpperCase()
}
