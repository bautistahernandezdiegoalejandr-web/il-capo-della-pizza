import { useNavigate } from 'react-router-dom'

export default function Inicio() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-3xl overflow-hidden h-[400px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 leading-tight max-w-3xl mx-auto">
            La mejor pizza de la ciudad, directo a tu puerta.
          </h1>
          <p className="text-lg md:text-xl mb-8 font-light text-gray-200">
            Sabor auténtico, ingredientes frescos. Tú eres el capo de tu pedido.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-brand-red text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-red-dark transition shadow-lg transform hover:-translate-y-1"
          >
            PIDE AHORA
          </button>
        </div>
      </div>
    </div>
  )
}
