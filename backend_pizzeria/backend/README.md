# Il Capo della Pizza — Backend

API REST construida en **Node.js + Express**, con **MySQL** como base de
datos. Reemplaza por completo la simulación en `localStorage` del
prototipo original: autenticación real, inventario real, y pedidos que se
guardan de verdad.

> 📌 Este backend ya está desplegado en producción (Render + MySQL en
> Aiven). Para los enlaces en vivo, credenciales de administrador y cómo
> probar el flujo completo, ver el `README.md` en la raíz del repositorio.

## Tecnologías

- **Express** — servidor y ruteo
- **MySQL** (vía `mysql2/promise`, con pool de conexiones)
- **JWT** guardado en cookie `httpOnly` — autenticación de sesión
- **bcryptjs** — hash de contraseñas
- **Wompi** — pasarela de pagos (tarjeta, PSE, Nequi, Bancolombia)
- **Nodemailer** — correo de recuperación de contraseña

## Cómo correrlo en tu computador

Requiere Node.js 18+ y acceso a un servidor MySQL 8+ (local o en la nube).

```bash
cd backend
npm install
```

### 1. Variables de entorno

```bash
cp .env.example .env
```

Completa como mínimo:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Genera un `JWT_SECRET` seguro con:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Si tu proveedor de MySQL exige conexión SSL** (como Aiven, o la mayoría
de opciones gratuitas en la nube): descarga el certificado CA desde el
panel de tu proveedor y guárdalo como `ca.pem` en esta misma carpeta
(junto a `server.js`). `src/config/db.js` lo detecta automáticamente si
existe; si no existe, se conecta sin SSL (para MySQL local, por ejemplo).

### 2. Crea la base de datos

```bash
mysql -u root -p < src/db/schema.sql
```

(Con SSL, agrega `--host`, `--port`, `--user`, `--password`, `--ssl-ca` y
`--ssl-mode=REQUIRED` según tu proveedor.)

Esto crea la base de datos y sus 6 tablas: `usuarios`, `productos`,
`pedidos`, `pedido_items`, `direcciones`, `metodos_pago`. El nombre de la
base la define el propio `schema.sql` (`CREATE DATABASE IF NOT EXISTS ...`)
— usa ese mismo nombre en tu variable `DB_NAME`.

Las migraciones en `src/db/migrations/` (`002_pagos.sql`,
`003_facturacion.sql`) **no son necesarias en una instalación nueva** —
`schema.sql` ya incluye todo. Solo sirven para actualizar una base de
datos creada antes de que existieran esas columnas.

### 3. Carga datos de ejemplo (menú + usuario admin)

```bash
npm run seed
```

Imprime en la consola el correo y la contraseña del administrador de
ejemplo. **Cámbiala después del primer inicio de sesión** — es
especialmente importante si tu repositorio es público, ya que la
contraseña por defecto queda visible en `src/db/seed.js`.

### 4. Inicia el servidor

```bash
npm run dev
```

Verás: `API corriendo en http://localhost:4000` (o el puerto que Render u
otra plataforma asigne automáticamente vía `PORT`).

Pruébalo abriendo `http://localhost:4000/api/salud` — debe responder
`{"ok":true,"mensaje":"..."}`.

### 5. Conecta el frontend

En `frontend_pizzeria/react-app/.env`:
```
VITE_API_URL=http://localhost:4000/api
```
Corre el frontend en paralelo (ver su propio README).

## Estructura del proyecto

```
backend/
├── server.js                Punto de entrada: Express, CORS, cookies, rutas
├── ca.pem                    Certificado SSL del proveedor de MySQL (si aplica)
├── package.json
└── src/
    ├── config/
    │   └── db.js              Pool de conexión a MySQL, con SSL condicional
    ├── data/
    │   └── personalizacionData.js  Precios/opciones de "Crea tu Pizza" (tamaños, extras)
    ├── db/
    │   ├── schema.sql          Las 6 tablas de la base de datos
    │   ├── seed.js              Carga el menú inicial + usuario admin
    │   └── migrations/         002_pagos.sql, 003_facturacion.sql (solo para bases existentes)
    ├── middleware/
    │   ├── auth.js              Verifica sesión (JWT) y rol de administrador
    │   └── errorHandler.js      Manejo centralizado de errores
    ├── controllers/
    │   ├── authController.js
    │   ├── productosController.js
    │   ├── pedidosController.js
    │   ├── direccionesController.js
    │   └── pagosController.js
    ├── routes/
    │   ├── index.js              Une todas las rutas bajo /api
    │   ├── authRoutes.js
    │   ├── productosRoutes.js
    │   ├── pedidosRoutes.js
    │   ├── direccionesRoutes.js
    │   └── pagosRoutes.js
    └── utils/
        ├── token.js             Generar/verificar JWT, opciones de la cookie de sesión
        ├── email.js             Envío del correo de recuperación de contraseña
        └── wompi.js             Firma de integridad y verificación de webhook de Wompi
```

## Endpoints principales

| Método | Ruta | Descripción | Requiere |
|---|---|---|---|
| GET | `/api/salud` | Verifica que la API esté viva | — |
| POST | `/api/auth/registro` | Crear cuenta | — |
| POST | `/api/auth/login` | Iniciar sesión | — |
| POST | `/api/auth/logout` | Cerrar sesión | — |
| GET | `/api/auth/me` | Sesión actual | Sesión |
| POST | `/api/auth/olvide-password` | Solicitar recuperación | — |
| POST | `/api/auth/restablecer-password` | Fijar nueva contraseña | — |
| GET | `/api/productos` | Ver el menú (catálogo público) | — |
| GET | `/api/productos/admin/todos` | Ver todo el menú (incl. no disponibles) | Admin |
| POST/PUT/DELETE | `/api/productos/admin/...` | Crear, editar o eliminar productos | Admin |
| POST | `/api/pedidos` | Realizar un pedido (checkout) | — (opcional) |
| GET | `/api/pedidos/mios` | Ver mis pedidos | Sesión |
| GET | `/api/pedidos/admin/todos` | Ver todos los pedidos | Admin |
| PATCH | `/api/pedidos/admin/:id/estado` | Cambiar estado de un pedido | Admin |
| POST | `/api/pagos/webhook/wompi` | Recibe confirmaciones de pago de Wompi | — (verificado por firma) |
| GET | `/api/pagos/estado/:referencia` | Consultar si un pago ya fue confirmado | — |

## Flujo de pedidos

El backend soporta dos formas de pago, definidas en la columna
`metodo_pago` de la tabla `pedidos`: `'Efectivo a la Entrega'` y
`'Pago en línea (Wompi)'`.

### Efectivo a la Entrega — flujo activo en la demostración

1. El frontend envía `POST /api/pedidos` con el carrito y la dirección.
2. El backend **recalcula los precios en el servidor** a partir de la
   base de datos — nunca confía en los precios que envía el navegador.
3. Como no hay pasarela externa que confirmar, el pedido se crea de
   inmediato con estado `recibido` y el inventario se descuenta al
   instante.
4. El pedido aparece enseguida en el panel de administración, donde se
   puede avanzar su estado: Recibido → En preparación → En camino →
   Entregado.

### Pago en línea (Wompi) — implementado, deshabilitado en la interfaz

El código de esta integración está completo, pero el frontend la muestra
deshabilitada (badge "Próximamente") para que la demostración no dependa
de un servicio externo. Así es como funciona cuando está activa:

1. El backend crea el pedido con `estado_pago = 'pendiente'` y genera una
   **firma de integridad** (`src/utils/wompi.js`) con una llave secreta
   que solo conoce el servidor.
2. El frontend abre el **Widget de Wompi** con esos datos — el cliente
   ingresa los datos de su tarjeta o elige su banco ahí mismo, nunca en
   nuestro código (cumplimiento PCI-DSS).
3. Wompi notifica el resultado vía **webhook** (`POST /api/pagos/webhook/wompi`).
   El backend valida la firma de ese webhook antes de confiar en él.
4. Solo cuando el webhook confirma el pago como aprobado, se descuenta el
   inventario y el pedido queda disponible para preparación.
5. Mientras tanto, el frontend consulta `GET /api/pagos/estado/:referencia`
   cada pocos segundos hasta obtener el resultado final.

Para activarla de nuevo: completa `WOMPI_PUBLIC_KEY`,
`WOMPI_INTEGRITY_SECRET` y `WOMPI_EVENTS_SECRET` en el `.env`, configura el
webhook en el panel de Wompi apuntando a
`https://TU-DOMINIO/api/pagos/webhook/wompi`, y habilita de nuevo la
opción en `Pago.jsx` del frontend. Para pruebas en local, usa
[ngrok](https://ngrok.com) (`ngrok http 4000`) ya que Wompi no puede
alcanzar `localhost` directamente.

## Correo de recuperación de contraseña

Para que "¿Olvidaste tu contraseña?" funcione de verdad, completa las
variables `SMTP_*` en el `.env`. Con una cuenta de Gmail: activa la
verificación en dos pasos, genera una "contraseña de aplicación", y
úsala como `SMTP_PASSWORD` (`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`).
Para producción real conviene un servicio dedicado (Resend, SendGrid,
Amazon SES) en vez de una cuenta personal.

## Facturación electrónica (DIAN) — por qué no está incluida

Emitir factura electrónica en Colombia requiere ser facturador autorizado
o contratar un proveedor ya certificado por la DIAN (Siigo, Alegra,
Facturación Nacional, etc.) — no es algo que se resuelva solo con código.
Lo que sí queda preparado: la tabla `pedidos` ya tiene las columnas
`facturado` y `factura_url`, listas para conectar un proveedor el día que
el negocio opere con clientes reales.

## Seguridad — qué se implementó y por qué

- **Contraseñas con `bcryptjs`** (12 rounds): nunca se guarda la
  contraseña en texto plano.
- **JWT en cookie `httpOnly`**: no accesible desde JavaScript del
  navegador (reduce el riesgo de robo de sesión por XSS). En producción,
  la cookie usa `secure: true` y `sameSite: 'none'`, porque el frontend
  (Vercel) y el backend (Render) viven en dominios distintos.
- **Mismos mensajes de error** en login y recuperación de contraseña,
  exista o no la cuenta, para no revelar qué correos están registrados.
- **Precios recalculados en el servidor**, incluidas las pizzas
  personalizadas — el backend nunca confía en lo que mande el navegador.
- **Rutas de administración protegidas por rol**, verificado en cada
  petición del backend, no solo ocultando botones en el frontend.
- **Nunca se manejan datos de tarjeta**: el Widget de Wompi corre en el
  dominio de Wompi, no en el nuestro.
- **Firma de integridad y verificación de webhook** para el flujo de
  pago en línea (ver arriba).
- **El inventario se descuenta solo cuando el pago queda confirmado**
  (en el flujo de Wompi) o al crear el pedido (en efectivo, donde no hay
  nada externo que confirmar).

## Despliegue

Este backend está desplegado en **Render** (plan gratuito), conectado a
una base de datos **MySQL en Aiven** (plan gratuito, conexión SSL vía
`ca.pem`). El `FRONTEND_URL` configurado en Render debe coincidir
exactamente con el dominio del frontend en Vercel, o el navegador
bloqueará las peticiones por CORS.

> El plan gratuito de Render "duerme" el servicio tras ~15 minutos sin
> tráfico; la primera petición después de eso puede tardar hasta un
> minuto en responder.

Para los enlaces en vivo y cómo probar el sitio completo, ver el
`README.md` en la raíz del repositorio.

## Pendiente / fuera de alcance

- **Facturación electrónica (DIAN)** — ver sección arriba.
- **WebSockets**: el panel de administración usa sondeo cada 8 segundos
  en vez de actualizaciones instantáneas; el siguiente paso natural sería
  Socket.io.
- **Migraciones versionadas**: hoy los `.sql` se corren a mano; para un
  equipo más grande convendría una herramienta dedicada.
- **Monitoreo de webhooks fallidos**: Wompi reintenta automáticamente si
  el backend está caído al momento de notificar, pero conviene revisar
  los logs de producción para detectar fallos.
