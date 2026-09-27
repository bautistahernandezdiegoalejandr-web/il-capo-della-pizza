import { createContext, useContext, useEffect, useState } from 'react'

const CARRITO_STORAGE_KEY = 'ilCapoPizza_carrito'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem(CARRITO_STORAGE_KEY)
      return guardado ? JSON.parse(guardado) : []
    } catch {
      return []
    }
  })

  // Persistir el carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito))
  }, [carrito])

  function agregarAlCarrito(producto) {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + (producto.cantidad || 1) } : item,
        )
      }
      return [...prev, { ...producto, cantidad: producto.cantidad || 1 }]
    })
  }

  function cambiarCantidad(id, delta) {
    setCarrito((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + delta } : item))
        .filter((item) => item.cantidad > 0),
    )
  }

  function eliminarDelCarrito(id) {
    setCarrito((prev) => prev.filter((item) => item.id !== id))
  }

  function vaciarCarrito() {
    setCarrito([])
  }

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  const value = {
    carrito,
    agregarAlCarrito,
    cambiarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    subtotal,
    cantidadTotal,
  }

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
}

export function useCarrito() {
  const contexto = useContext(CarritoContext)
  if (!contexto) throw new Error('useCarrito debe usarse dentro de un CarritoProvider')
  return contexto
}
