# Il Capo della Pizza — Frontend en React

Frontend de la aplicación, migrado del prototipo original en un solo HTML
(Fase 1) y ahora conectado a un backend real con MySQL (Fase 2).

## Cómo correrlo en tu computador

Necesitas Node.js 18+ instalado. Este proyecto se generó sin conexión a
internet, así que no incluye `node_modules` — instálalo tú mismo:

```bash
npm install
```

### Conéctalo al backend

Crea un archivo `.env` en esta carpeta (junto a `package.json`) con:

```
VITE_API_URL=http://localhost:4000/api
```

Necesitas el **backend corriendo en paralelo** (ver la carpeta `backend/` y
su propio README) para que el menú, el login y el checkout funcionen — sin
el backend encendido, verás errores de "No pudimos cargar el menú" o
similares, lo cual es esperado.

### Inicia el frontend

```bash
npm run dev
```

Esto abre la app en `http://localhost:5173`.

## Estructura del proyecto

```
src/
├── components/       Header, Footer, TarjetaProducto, RutaAdmin (protege /admin)
├── context/          CarritoContext (carrito, en localStorage) y UsuarioContext (sesión real vía API)
├── services/
│   └── api.js         Cliente HTTP centralizado hacia el backend
├── data/
│   └── menuData.js    Ya NO es la fuente del menú (eso ahora viene de la API) — se
│                       conserva solo para los datos de "Crea tu Pizza" (tamaños/masas/extras)
├── pages/              Una página = una ruta real
│   ├── ... (Inicio, Menu, Carrito, Pago, Cuenta, Contacto, etc.)
│   ├── OlvidePassword.jsx / RestablecerPassword.jsx   Recuperación de contraseña
│   └── admin/           Panel de administración (protegido, solo rol admin)
│       ├── AdminLayout.jsx
│       ├── AdminPedidos.jsx     Pedidos entrantes, actualiza cada 8s, cambia estado
│       └── AdminProductos.jsx   Gestión del menú e inventario
├── App.jsx             Rutas (React Router)
└── main.jsx             Punto de entrada
```

## Qué cambió en la Fase 2

- **`UsuarioContext`**: el login/registro/logout ahora llaman a la API real (`/api/auth/...`). La sesión vive en una cookie `httpOnly` que el navegador maneja solo — ya no hay contraseñas ni sesión simuladas en `localStorage`.
- **`Menu.jsx`**: el catálogo se trae de `/api/productos` en vez de estar escrito en `menuData.js`.
- **`Pago.jsx`**: el checkout envía el pedido real al backend, que recalcula los precios en el servidor antes de confirmar (por seguridad) y devuelve un número de seguimiento real.
- **Panel de administración** (`/admin`): gestión de menú/inventario y pedidos entrantes, solo visible para el usuario con rol `admin` (verificado tanto en el frontend como, más importante, en el backend).

## Qué cambió en la Fase 3 (pagos reales)

- **`index.html`**: se agregó el script del Widget de Wompi (`checkout.wompi.co/widget.js`).
- **`Pago.jsx`**: las opciones de pago pasaron de 3 (Tarjeta/PSE/Efectivo, con campos falsos) a 2 reales: **"Pago en línea"** (abre el Widget de Wompi — tarjeta, PSE, Nequi o Bancolombia, todo gestionado por Wompi) y **"Efectivo a la Entrega"**. Ya no existen campos de número de tarjeta en este proyecto — ese dato nunca debe tocar nuestro código.
- **`Confirmacion.jsx`**: cuando el pago fue en línea, esta pantalla ahora **consulta el backend** (`GET /api/pagos/estado/:referencia`) cada pocos segundos hasta confirmar si el pago fue aprobado o rechazado — no asume éxito solo porque el navegador volvió a esta URL.
- **`AdminPedidos.jsx`** y **`Cuenta.jsx`**: ahora muestran también el estado del pago (pendiente/aprobado/declinado), no solo el estado de preparación del pedido.

## Qué sigue siendo una simulación o queda pendiente

- **Facturación electrónica (DIAN)**: no implementada — requiere un proveedor certificado (ver el README del backend, sección "Facturación electrónica").
- **WebSockets**: el panel de administración usa sondeo cada 8 segundos en vez de actualizaciones instantáneas — funciona bien para el tamaño de este negocio, pero es una mejora futura posible.
