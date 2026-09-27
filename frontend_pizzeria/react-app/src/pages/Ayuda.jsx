import { Link } from 'react-router-dom'

const PREGUNTAS = [
  {
    icono: 'fa-solid fa-motorcycle',
    pregunta: '¿Cuánto tarda en llegar mi pedido?',
    respuesta:
      'Nuestro tiempo de entrega estándar es de 30 a 45 minutos, dependiendo de tu ubicación exacta y del volumen de pedidos actual. Te mantendremos informado sobre el estado de tu pedido en la sección de confirmación.',
  },
  {
    icono: 'fa-solid fa-leaf',
    pregunta: '¿Tienen opciones veganas o sin gluten?',
    respuesta:
      '¡Por supuesto! En nuestro menú encontrarás deliciosas pizzas 100% veganas. Además, en la sección de "Crea tu Pizza", podrás seleccionar una base de masa sin gluten y agregar los ingredientes que prefieras.',
  },
  {
    icono: 'fa-solid fa-credit-card',
    pregunta: '¿Cuáles son los métodos de pago aceptados?',
    respuesta:
      'Aceptamos pago en línea a través de nuestra pasarela segura (tarjetas de crédito/débito, PSE, Nequi y Bancolombia), además del pago en efectivo al momento de la entrega.',
  },
  {
    icono: 'fa-solid fa-rotate-left',
    pregunta: '¿Puedo cancelar o modificar mi pedido?',
    respuesta:
      'Puedes cancelar o modificar tu pedido únicamente dentro de los primeros 5 minutos después de haberlo realizado, ya que nuestras pizzas comienzan a prepararse casi de inmediato para garantizar la frescura. Para cancelaciones, por favor comunícate a nuestro teléfono de atención.',
  },
]

export default function Ayuda() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          <i className="fa-regular fa-circle-question" aria-hidden="true"></i>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Centro de Ayuda</h1>
        <p className="text-lg text-gray-500">Encuentra respuestas rápidas a las preguntas más comunes de nuestros clientes.</p>
      </div>

      <div className="space-y-6">
        {PREGUNTAS.map((item) => (
          <div key={item.pregunta} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-2 flex items-center text-gray-800">
              <i className={`${item.icono} text-brand-red mr-3`}></i> {item.pregunta}
            </h3>
            <p className="text-gray-600 ml-8 leading-relaxed">{item.respuesta}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-gray-50 p-8 rounded-3xl border border-gray-200">
        <h3 className="font-bold text-xl mb-2">¿Aún necesitas ayuda?</h3>
        <p className="text-gray-600 mb-6">Si no encontraste la respuesta que buscabas, nuestro equipo de soporte está listo para asistirte.</p>
        <Link
          to="/contacto"
          className="bg-white border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-8 py-3 rounded-full font-bold transition inline-block"
        >
          Ir a Contacto
        </Link>
      </div>
    </div>
  )
}
