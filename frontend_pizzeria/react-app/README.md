# Il Capo della Pizza — Frontend

SPA (Single Page Application) construida en **React + Vite + Tailwind CSS**.
Es la cara visible del proyecto: catálogo de pizzas, carrito, checkout,
cuenta de usuario y panel de administración.

> 📌 Este frontend ya está desplegado en producción, conectado a un backend
> real con MySQL. Para los enlaces en vivo, credenciales de administrador y
> cómo probar el flujo completo, ver el `README.md` en la raíz del
> repositorio.

## Tecnologías

- **React** (con React Router para las rutas)
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para los estilos
- Consumo de una API REST propia (ver `backend/`) — no hay datos hardcodeados salvo lo indicado más abajo

## Cómo correrlo en tu computador

Requiere Node.js 18 o superior.

```bash
npm install
```

### Variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Y completa la URL del backend:
```
VITE_API_URL=http://localhost:4000/api
```

Necesitas el **backend corriendo en paralelo** (ver `backend/README.md`)
para que el menú, el login y el checkout funcionen. Sin el backend
encendido verás errores como "No pudimos cargar el menú" — es esperado.

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Estructura del proyecto

```
react-app/
├── vercel.json              Reglas de Vercel: redirige cualquier ruta a index.html (SPA)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.jsx              Punto de entrada
    ├── App.jsx                Definición de rutas (React Router)
    ├── index.css              Estilos globales / directivas de Tailwind
    │
    ├── components/
    │   ├── Header.jsx          Barra de navegación, carrito, sesión
    │   ├── Footer.jsx
    │   ├── TarjetaProducto.jsx Tarjeta de cada pizza en el menú
    │   └── RutaAdmin.jsx        Protege las rutas /admin/* (solo rol admin)
    │
    ├── context/
    │   ├── CarritoContext.jsx  Estado del carrito (persistido en localStorage)
    │   └── UsuarioContext.jsx  Sesión real del usuario (login/registro/logout vía API)
    │
    ├── services/
    │   └── api.js              Cliente HTTP centralizado. Usa `credentials: 'include'`
    │                           en cada petición para que la cookie de sesión httpOnly
    │                           viaje correctamente, incluso con el backend en otro dominio
    │
    ├── data/
    │   └── menuData.js         NO es la fuente del catálogo (eso viene de la API).
    │                           Solo guarda las opciones de "Crea tu Pizza" (tamaños,
    │                           tipos de masa, extras) para la pizza personalizada
    │
    ├── utils/
    │   └── formatearPrecio.js  Formatea números como pesos colombianos ($32.000)
    │
    └── pages/
        ├── Inicio.jsx           Portada
        ├── Menu.jsx              Catálogo (clásicas, especiales, vegetarianas, veganas)
        ├── Personalizacion.jsx   "Crea tu Pizza"
        ├── Carrito.jsx
        ├── Pago.jsx              Checkout: dirección + forma de pago
        ├── Confirmacion.jsx      Resumen del pedido ya confirmado
        ├── Contacto.jsx
        ├── Ayuda.jsx
        ├── Terminos.jsx
        ├── Privacidad.jsx
        ├── Login.jsx / Registro.jsx
        ├── Cuenta.jsx            Perfil del usuario + accesos rápidos
        ├── OlvidePassword.jsx / RestablecerPassword.jsx
        └── admin/                Panel de administración (protegido, solo rol admin)
            ├── AdminLayout.jsx
            ├── AdminPedidos.jsx    Pedidos entrantes; se actualiza cada 8s; cambia estado
            └── AdminProductos.jsx  Gestión del menú e inventario (precio, stock, disponibilidad)
```

## Catálogo y checkout

- El menú se trae en vivo desde `GET /api/productos` — agregar, editar o
  deshabilitar una pizza desde el panel admin se refleja de inmediato en la
  tienda, sin tocar código.
- Categorías actuales: **Clásicas**, **Especiales del Capo**, **Vegetarianas**,
  **Veganas**, más la sección **Crea tu Pizza** (personalizada).
- El checkout (`Pago.jsx`) envía el pedido real al backend, que recalcula
  los precios en el servidor antes de confirmar — el total nunca se confía
  desde el navegador.

## Forma de pago

`Pago.jsx` ofrece dos opciones:

- **Efectivo a la Entrega** — funcional de punta a punta: crea el pedido
  real en la base de datos, aparece de inmediato en el panel admin, y su
  estado se puede actualizar (Recibido → En preparación → En camino →
  Entregado).
- **Pago en línea (Wompi)** — la integración con Wompi (tarjeta, PSE, Nequi,
  Bancolombia) está implementada por completo en el código, pero
  **aparece deshabilitada visualmente** en esta pantalla (atenuada, con un
  badge "Próximamente", sin poder seleccionarse). Esto es una decisión
  deliberada para que la demostración del proyecto no dependa de la
  disponibilidad de un servicio de pagos externo. El detalle técnico
  completo de esa integración (firma de integridad, verificación de
  webhook, etc.) está documentado en `backend/README.md`.

## Sesión y panel de administración

- El login, registro y cierre de sesión llaman a la API real
  (`/api/auth/...`). La sesión vive en una cookie `httpOnly` — el frontend
  nunca maneja el token directamente.
- `RutaAdmin.jsx` protege todas las rutas bajo `/admin`; solo un usuario
  con rol `admin` puede entrar (y el backend también lo verifica en cada
  petición, no solo el frontend).
- Desde `/admin` se gestionan dos cosas: los **pedidos** entrantes y el
  **menú/inventario** (crear, editar, eliminar productos, activar o
  desactivar su disponibilidad y ajustar el stock).

## Despliegue

Este frontend está desplegado en **Vercel**:

- **Root Directory** del proyecto en Vercel: esta misma carpeta
  (`frontend_pizzeria/react-app`) dentro del monorepo.
- **`vercel.json`** redirige cualquier ruta hacia `index.html`, para que
  recargar directamente en `/menu`, `/admin`, etc. no produzca un error 404.
- La variable de entorno `VITE_API_URL` apunta al backend real en Render.
  Como Vite incrusta esa variable en el código al momento de compilar,
  cambiarla en el panel de Vercel requiere disparar un nuevo *Redeploy*
  para que surta efecto.

Para los enlaces en vivo y cómo probar el sitio completo, ver el
`README.md` en la raíz del repositorio.

## Pendiente / fuera de alcance

- **Facturación electrónica (DIAN)**: no implementada en esta fase — ver
  `backend/README.md`.
- **Actualizaciones en tiempo real**: el panel admin usa sondeo cada 8
  segundos en vez de WebSockets; funciona bien para el tamaño de este
  proyecto.
