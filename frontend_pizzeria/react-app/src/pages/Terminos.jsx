export default function Terminos() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Términos y Condiciones</h1>
      <p className="text-gray-500 mb-10 pb-6 border-b border-gray-200">Última actualización: Octubre de 2026</p>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar el sitio web de "Il Capo della Pizza", así como al realizar pedidos a través de
            nuestra plataforma, aceptas estar sujeto a estos términos y condiciones en su totalidad. Si no estás de
            acuerdo con alguna parte de estos términos, te solicitamos no utilizar nuestros servicios.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Uso de la Plataforma</h2>
          <p>
            El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que ofrecemos. Está
            estrictamente prohibido utilizar el sitio para incurrir en actividades ilícitas, ilegales o contrarias a
            la buena fe y al orden público.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Política de Pedidos y Entregas</h2>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              El radio de entrega está limitado a las zonas especificadas durante el proceso de pago. Si tu
              dirección se encuentra fuera de nuestra zona, el pedido no podrá ser procesado.
            </li>
            <li>
              Los tiempos de entrega proporcionados son estimaciones y pueden variar debido a factores externos como
              tráfico, clima o volumen de pedidos.
            </li>
            <li>Es responsabilidad del cliente proveer información exacta sobre la dirección de entrega y un número de contacto válido.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Precios y Pagos</h2>
          <p>
            Todos los precios mostrados en el menú incluyen los impuestos aplicables. "Il Capo della Pizza" se
            reserva el derecho de modificar los precios en cualquier momento sin previo aviso. Los pedidos ya
            confirmados mantendrán el precio al momento de la compra.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Devoluciones y Reembolsos</h2>
          <p>
            Dado que nuestros productos son perecederos, no se aceptan devoluciones. Sin embargo, si tu pedido llega
            en mal estado, incorrecto o incompleto, por favor contáctanos el mismo día de la entrega para ofrecerte
            una solución (reemplazo del producto o reembolso parcial/total, a nuestra discreción).
          </p>
        </div>
      </div>
    </div>
  )
}
