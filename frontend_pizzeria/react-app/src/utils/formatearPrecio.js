// Formatea valores en pesos colombianos: sin decimales y con punto como
// separador de miles (Ej: 32000 -> "$32.000")
export function formatearPrecio(valor) {
  return '$' + Math.round(valor).toLocaleString('es-CO')
}
