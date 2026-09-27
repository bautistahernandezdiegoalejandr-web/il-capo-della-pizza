export default function Privacidad() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Política de Privacidad</h1>
      <p className="text-gray-500 mb-10 pb-6 border-b border-gray-200">En vigor desde: Enero de 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <p className="text-blue-900 font-medium">
            En "Il Capo della Pizza", nos tomamos tu privacidad tan en serio como nuestras recetas. Esta política
            explica cómo recopilamos, usamos y protegemos tu información personal.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Recopilación de Información</h2>
          <p>Recopilamos información personal que nos proporcionas directamente, tales como:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Nombre y apellidos.</li>
            <li>Dirección de entrega y facturación.</li>
            <li>Dirección de correo electrónico y número de teléfono.</li>
            <li>Información de pago (procesada de forma segura por nuestras pasarelas).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Uso de tus Datos</h2>
          <p>Utilizamos la información recopilada exclusivamente para los siguientes fines:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Procesar, preparar y entregar tus pedidos de manera eficiente.</li>
            <li>Comunicarnos contigo acerca del estado de tu pedido o responder a tus consultas de soporte.</li>
            <li>Mejorar nuestros servicios y personalizar tu experiencia de usuario.</li>
            <li>Enviarte ofertas especiales y boletines (solo si has dado tu consentimiento previo).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Protección de la Información</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra
            el acceso no autorizado, la alteración, divulgación o destrucción. Tus contraseñas son encriptadas y no
            almacenamos los datos completos de tus tarjetas de crédito en nuestros servidores.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Compartir Información con Terceros</h2>
          <p>
            No vendemos, intercambiamos ni transferimos a terceros tu información personal identificable. Esto no
            incluye a los terceros de confianza que nos asisten en operar nuestro sitio web o realizar nuestro
            negocio (como servicios de mensajería o procesadores de pago), siempre que esas partes acuerden mantener
            esta información confidencial.
          </p>
        </div>
      </div>
    </div>
  )
}
