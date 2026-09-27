import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const linkClase = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition ${
      isActive ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold mb-1">Panel de Administración</h1>
      <p className="text-gray-500 mb-6">Gestiona el menú y los pedidos entrantes de Il Capo della Pizza.</p>

      <nav className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
        <NavLink to="/admin/pedidos" className={linkClase}>
          <i className="fa-solid fa-receipt mr-2" aria-hidden="true"></i> Pedidos
        </NavLink>
        <NavLink to="/admin/productos" className={linkClase}>
          <i className="fa-solid fa-pizza-slice mr-2" aria-hidden="true"></i> Menú e Inventario
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
