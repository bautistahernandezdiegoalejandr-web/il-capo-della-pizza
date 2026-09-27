import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#faf8f5] border-t border-gray-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <p>&copy; 2026 Il capo della pizza. Todos los derechos reservados.</p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
          <Link to="/contacto" className="cursor-pointer hover:text-brand-red transition">
            Contacto
          </Link>
          <Link to="/ayuda" className="cursor-pointer hover:text-brand-red transition">
            Ayuda
          </Link>
          <Link to="/terminos" className="cursor-pointer hover:text-brand-red transition">
            Términos y Condiciones
          </Link>
          <Link to="/privacidad" className="cursor-pointer hover:text-brand-red transition">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  )
}
