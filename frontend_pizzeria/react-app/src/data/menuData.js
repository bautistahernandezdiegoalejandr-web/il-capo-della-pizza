// El catálogo de pizzas del menú ahora viene de la API (Fase 2) — ver
// src/services/api.js y src/pages/Menu.jsx. Este archivo conserva solo las
// categorías (para las pestañas del menú) y las opciones de "Crea tu Pizza".

export const CATEGORIAS = [
  { id: 'clasicas', label: 'Clásicas' },
  { id: 'especiales', label: 'Especiales del Capo' },
  { id: 'vegetarianas', label: 'Vegetarianas' },
  { id: 'veganas', label: 'Veganas' },
]

// Opciones para "Crea tu Pizza" (personalización)
export const TAMANOS = [
  { id: 'pequena', label: 'Pequeña', detalle: '25 cm', precio: 18000 },
  { id: 'mediana', label: 'Mediana', detalle: '30 cm', precio: 26000 },
  { id: 'familiar', label: 'Familiar', detalle: '40 cm', precio: 34000 },
]

export const MASAS = [
  { id: 'fina', label: 'Fina', precio: 0 },
  { id: 'clasica', label: 'Clásica', precio: 3000 },
  { id: 'borde-queso', label: 'Borde de Queso', precio: 5000 },
]

export const EXTRAS = [
  { id: 'pepperoni', label: 'Pepperoni', precio: 3000, emoji: '🍕' },
  { id: 'champinones', label: 'Champiñones', precio: 2000, emoji: '🍄' },
  { id: 'pimientos', label: 'Pimientos', precio: 2000, emoji: '🫑' },
  { id: 'aceitunas', label: 'Aceitunas', precio: 1500, emoji: '⚫' },
]

export const COSTO_ENVIO = 6000 // COP
export const IVA_PORCENTAJE = 0.19 // IVA general en Colombia
