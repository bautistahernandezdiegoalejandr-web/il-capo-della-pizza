export default function Contacto() {
  function handleSubmit(e) {
    e.preventDefault()
    alert('Gracias por tu mensaje. Te responderemos lo antes posible.')
    e.target.reset()
  }

  return (
    <div className="w-full">
      <div className="bg-brand-bg py-16 px-4 text-center">
        <h1 className="font-serif text-5xl font-bold mb-4">Ponte en Contacto</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          ¿Tienes alguna duda, sugerencia o un pedido especial? Escríbenos y el equipo del Capo te responderá lo
          antes posible.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="font-bold text-xl mb-6 pb-4 border-b border-gray-100">Información</h3>

          <InfoItem icon="fa-solid fa-location-dot" color="red" titulo="Dirección Principal">
            Calle 93 #15-32,
            <br />
            Chicó, Bogotá, Colombia
          </InfoItem>

          <InfoItem icon="fa-solid fa-phone" color="red" titulo="Teléfono">
            +57 601 234 5678
          </InfoItem>

          <InfoItem icon="fa-brands fa-whatsapp" color="green" titulo="WhatsApp">
            +57 300 456 7890
          </InfoItem>

          <InfoItem icon="fa-solid fa-envelope" color="red" titulo="Correo Electrónico" ultimo>
            hola@ilcapodellapizza.com.co
          </InfoItem>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:col-span-2">
          <h3 className="font-serif text-2xl font-bold mb-6">Envíanos un mensaje</h3>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contacto-nombre" className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                <input
                  id="contacto-nombre"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-brand-red focus:border-brand-red outline-none transition bg-gray-50"
                  placeholder="Ej: Luigi Bros"
                />
              </div>
              <div>
                <label htmlFor="contacto-correo" className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  id="contacto-correo"
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-brand-red focus:border-brand-red outline-none transition bg-gray-50"
                  placeholder="luigi@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contacto-asunto" className="block text-sm font-semibold text-gray-700 mb-2">Asunto</label>
              <select
                id="contacto-asunto"
                required
                defaultValue=""
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-brand-red focus:border-brand-red outline-none transition bg-gray-50"
              >
                <option value="" disabled>
                  ¿En qué podemos ayudarte?
                </option>
                <option value="pedido">Consulta sobre un pedido</option>
                <option value="reclamo">Reclamo o novedad con la entrega</option>
                <option value="sugerencia">Sugerencia</option>
                <option value="alianzas">Alianzas o domicilios corporativos</option>
                <option value="trabajo">Trabaja con nosotros</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="contacto-mensaje" className="block text-sm font-semibold text-gray-700 mb-2">Mensaje</label>
              <textarea
                id="contacto-mensaje"
                required
                rows={5}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-brand-red focus:border-brand-red outline-none transition bg-gray-50"
                placeholder="Cuéntanos en qué podemos ayudarte..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-brand-red text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-red-dark transition shadow-md"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, color, titulo, children, ultimo = false }) {
  const bg = color === 'green' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-brand-red'
  return (
    <div className={`flex items-start ${ultimo ? '' : 'mb-6'}`}>
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-lg mr-4 flex-shrink-0`}>
        <i className={icon} aria-hidden="true"></i>
      </div>
      <div>
        <h4 className="font-bold text-sm">{titulo}</h4>
        <p className="text-sm text-gray-500 mt-1">{children}</p>
      </div>
    </div>
  )
}
