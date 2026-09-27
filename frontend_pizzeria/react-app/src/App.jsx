import { Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import RutaAdmin from './components/RutaAdmin.jsx'
import Inicio from './pages/Inicio.jsx'
import Menu from './pages/Menu.jsx'
import Personalizacion from './pages/Personalizacion.jsx'
import Carrito from './pages/Carrito.jsx'
import Pago from './pages/Pago.jsx'
import Confirmacion from './pages/Confirmacion.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import OlvidePassword from './pages/OlvidePassword.jsx'
import RestablecerPassword from './pages/RestablecerPassword.jsx'
import Cuenta from './pages/Cuenta.jsx'
import Contacto from './pages/Contacto.jsx'
import Ayuda from './pages/Ayuda.jsx'
import Terminos from './pages/Terminos.jsx'
import Privacidad from './pages/Privacidad.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminPedidos from './pages/admin/AdminPedidos.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'

// Cada "sección" del prototipo HTML original ahora es una ruta real con su
// propia URL, en vez de un <section> mostrado/ocultado con JavaScript.
export default function App() {
  return (
    <>
      <Header />
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/personalizacion" element={<Personalizacion />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/olvide-password" element={<OlvidePassword />} />
          <Route path="/restablecer-password" element={<RestablecerPassword />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />

          {/* Panel de administración — protegido, solo rol 'admin' */}
          <Route
            path="/admin"
            element={
              <RutaAdmin>
                <AdminLayout />
              </RutaAdmin>
            }
          >
            <Route index element={<AdminPedidos />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="productos" element={<AdminProductos />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </>
  )
}
