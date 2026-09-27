# Il Capo della Pizza — Backend (API REST + MySQL)

Esto es el backend real de la Fase 2 de la hoja de ruta: reemplaza el
`localStorage` del prototipo por una base de datos MySQL de verdad, con
autenticación segura y una API que el frontend React consume.

## Requisitos

- **Node.js** 18 o superior.
- **MySQL** 8 o superior instalado y corriendo en tu computador (o un servicio como PlanetScale, Railway, AWS RDS, etc. cuando quieras desplegarlo).

## Puesta en marcha, paso a paso

### 1. Instala las dependencias

```bash
cd backend
npm install
```

### 2. Crea la base de datos

Con tu servidor MySQL corriendo, ejecuta:

```bash
mysql -u root -p < src/db/schema.sql
```

Esto crea la base de datos `il_capo_della_pizza` y las 6 tablas: `usuarios`,
`productos`, `pedidos`, `pedido_items`, `direcciones`, `metodos_pago`.

### 3. Configura las variables de entorno

Copia el archivo de ejemplo y ábrelo para completar tus propios datos:

```bash
cp .env.example .env
```

Como mínimo, completa:
- `DB_USER` y `DB_PASSWORD`: tus credenciales de MySQL.
- `JWT_SECRET`: una cadena aleatoria larga. Puedes generar una con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `SMTP_*`: credenciales de un servidor de correo, para que funcione la recuperación de contraseña (ver sección de abajo).

### 4. Carga los datos iniciales (menú + usuario admin)

```bash
npm run seed
```

Esto imprime en la consola el correo y la contraseña del usuario
administrador de ejemplo — **cámbiala apenas inicies sesión la primera vez**.

### 5. Inicia el servidor

```bash
npm run dev
```

Deberías ver: `🍕 API corriendo en http://localhost:4000`

Prueba que funciona abriendo `http://localhost:4000/api/salud` en el
navegador — debería mostrar `{"ok":true, ...}`.

## Configurar el envío de correos (recuperación de contraseña)

Para que el botón de "¿Olvidaste tu contraseña?" funcione de verdad, necesitas
credenciales SMTP reales en el `.env`. La opción más simple para empezar:

1. Ve a tu cuenta de Gmail → Seguridad → Verificación en 2 pasos (actívala si no la tienes).
2. Busca "Contraseñas de aplicaciones" y genera una nueva para "Correo".
3. Usa esa contraseña de 16 caracteres como `SMTP_PASSWORD`, y tu correo de Gmail como `SMTP_USER` y `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`.

Para producción, es más recomendable usar un servicio dedicado como
**Resend**, **SendGrid** o **Amazon SES**, que tienen mejor entregabilidad
que una cuenta personal de Gmail.

## Configurar la pasarela de pago (Wompi)

Fase 3 de la hoja de ruta: los pagos ya no son una simulación — se procesan
de verdad a través de **Wompi**, la pasarela más usada en comercios
colombianos (soporta tarjeta, PSE, Nequi y Bancolombia en un solo widget).

1. Crea una cuenta de comercio en [comercios.wompi.co](https://comercios.wompi.co) (el proceso de aprobación para cobrar de verdad toma unos días; mientras tanto puedes probar todo con las llaves de **sandbox/pruebas**).
2. En el panel de Wompi, ve a la sección de "Llaves API" y copia:
   - **Llave pública** (`pub_test_...` en pruebas, `pub_prod_...` en producción)
   - **Llave privada** (`prv_test_...`) — no se usa en este proyecto por ahora, pero consérvala.
   - **Secreto de integridad** (para firmar el monto a cobrar, evita que alguien lo manipule)
   - **Secreto de eventos** (para verificar que los webhooks realmente vienen de Wompi)
3. Pégalas en el `.env` del backend:
   ```
   WOMPI_PUBLIC_KEY=pub_test_...
   WOMPI_INTEGRITY_SECRET=...
   WOMPI_EVENTS_SECRET=...
   WOMPI_PRIVATE_KEY=prv_test_...
   ```
4. **Configura el webhook** en el panel de Wompi (sección "Eventos" o "Webhooks"), apuntando a:
   ```
   https://TU-DOMINIO-PUBLICO/api/pagos/webhook/wompi
   ```
   Mientras desarrollas en tu computador, Wompi no puede alcanzar `localhost` directamente — usa una herramienta como [ngrok](https://ngrok.com) (`ngrok http 4000`) para exponer temporalmente tu backend local con una URL pública, y usa esa URL en el webhook mientras pruebas.
5. Si ejecutaste el `schema.sql` original antes de esta fase, corre también las migraciones nuevas:
   ```bash
   mysql -u root -p il_capo_della_pizza < src/db/migrations/002_pagos.sql
   mysql -u root -p il_capo_della_pizza < src/db/migrations/003_facturacion.sql
   ```
   (Si es una instalación nueva, `schema.sql` ya incluye todo — no necesitas correr las migraciones por separado.)

### Cómo funciona el flujo de pago

1. El cliente arma su pedido y elige "Pago en línea". El frontend llama a `POST /api/pedidos`.
2. El backend crea el pedido con `estado_pago = 'pendiente'`, calcula el total de forma segura (nunca confía en lo que mande el navegador), y genera una **firma de integridad** con la llave secreta.
3. El frontend abre el **Widget de Wompi** con esos datos — ahí es donde el cliente ingresa los datos de su tarjeta o elige su banco para PSE. Esos datos **nunca pasan por nuestro backend**, van directo a Wompi (cumplimiento PCI-DSS).
4. Wompi procesa el pago y, en paralelo, le avisa a nuestro backend vía **webhook** (`POST /api/pagos/webhook/wompi`) si fue aprobado o rechazado. El backend valida la firma del webhook antes de confiar en él.
5. Solo cuando el webhook confirma el pago como aprobado, el backend descuenta el inventario y el pedido queda disponible para que la cocina lo prepare.
6. Mientras tanto, la pantalla de "Confirmación" del frontend consulta `GET /api/pagos/estado/:referencia` cada pocos segundos hasta obtener el resultado final.

## Facturación electrónica (DIAN) — por qué no está incluida

En Colombia, dependiendo del tipo y volumen de tu negocio, puede ser
obligatorio emitir factura electrónica ante la DIAN. Esto **no es algo que
se pueda simplemente programar desde cero** — requiere ser facturador
electrónico autorizado (o, en la práctica casi todos los negocios pequeños,
contratar un proveedor tecnológico ya autorizado por la DIAN, como Siigo,
Alegra, Facturación Nacional, etc.) y cumplir sus requisitos técnicos y
legales de habilitación.

Lo que sí queda preparado en este backend:
- La tabla `pedidos` ya tiene los campos `facturado` (booleano) y
  `factura_url` (para guardar el enlace al PDF/XML de la factura una vez
  exista), listos para cuando conectes un proveedor.
- Recomendación: antes de operar con clientes reales, confirma con un
  contador si tu negocio está obligado a facturar electrónicamente y, si es
  así, cuál proveedor te conviene — la mayoría ofrece una API REST sencilla
  de conectar una vez tengas ese backend funcionando (que es justo lo que
  tienes aquí).
## Conectar el frontend

En el proyecto de React, crea un archivo `.env` con:

```
VITE_API_URL=http://localhost:4000/api
```

Así el frontend sabrá a qué dirección enviar las peticiones (ver
`src/services/api.js`). Corre `npm run dev` en el frontend como siempre — con
el backend corriendo en paralelo (en otra terminal), ya deberían hablar entre sí.

## Estructura del proyecto

```
backend/
├── server.js               Punto de entrada: configura Express, CORS, cookies
├── src/
│   ├── config/db.js         Conexión (pool) a MySQL
│   ├── db/
│   │   ├── schema.sql        Las 6 tablas de la base de datos
│   │   └── seed.js           Carga el menú inicial + usuario admin
│   ├── middleware/
│   │   ├── auth.js           Verifica sesión (JWT) y rol de administrador
│   │   └── errorHandler.js   Manejo centralizado de errores
│   ├── controllers/          La lógica de cada endpoint
│   ├── routes/                Define las URLs de la API
│   └── utils/
│       ├── token.js          Generar/verificar JWT, opciones de la cookie
│       └── email.js          Envío del correo de recuperación de contraseña
```

## Endpoints principales

| Método | Ruta | Descripción | Requiere |
|---|---|---|---|
| POST | `/api/auth/registro` | Crear cuenta | — |
| POST | `/api/auth/login` | Iniciar sesión | — |
| POST | `/api/auth/logout` | Cerrar sesión | — |
| GET | `/api/auth/me` | Sesión actual | Sesión |
| POST | `/api/auth/olvide-password` | Solicitar recuperación | — |
| POST | `/api/auth/restablecer-password` | Fijar nueva contraseña | — |
| GET | `/api/productos` | Ver el menú | — |
| POST | `/api/pedidos` | Realizar un pedido (checkout) | — (opcional) |
| GET | `/api/pedidos/mios` | Ver mis pedidos | Sesión |
| GET | `/api/productos/admin/todos` | Ver todo el menú (incl. inactivos) | Admin |
| POST/PUT/DELETE | `/api/productos/admin/...` | Gestionar el menú | Admin |
| GET | `/api/pedidos/admin/todos` | Ver todos los pedidos | Admin |
| PATCH | `/api/pedidos/admin/:id/estado` | Cambiar estado de un pedido | Admin |
| POST | `/api/pagos/webhook/wompi` | Recibe confirmaciones de pago de Wompi | — (verificado por firma) |
| GET | `/api/pagos/estado/:referencia` | Consultar si un pago ya fue confirmado | — |

## Seguridad — qué se implementó y por qué

- **Contraseñas con `bcryptjs`** (12 rounds): nunca se guarda la contraseña en texto plano, solo su hash.
- **JWT en cookie `httpOnly`**: el token de sesión no es accesible desde JavaScript del navegador, lo que reduce el riesgo de robo de sesión por ataques XSS.
- **Mismos mensajes de error** en login y recuperación de contraseña exista o no la cuenta, para no revelar qué correos están registrados.
- **Los precios del pedido se recalculan en el servidor** a partir de la base de datos — el backend nunca confía en el precio que manda el navegador, así nadie puede alterar el total del pedido manipulando el frontend. Esto incluye las pizzas personalizadas (ver `src/data/personalizacionData.js`).
- **Rutas de administración protegidas** por rol, verificado en cada petición (no solo ocultando botones en el frontend).
- **Nunca manejamos datos de tarjeta**: el Widget de Wompi corre en un dominio de Wompi, no en el nuestro — cumple PCI-DSS por diseño.
- **Firma de integridad y verificación de webhook**: el monto a cobrar se firma con una llave secreta que solo conoce el backend (evita que alguien manipule el total antes de pagar), y cada webhook de Wompi se valida contra su propia firma antes de confiar en él.
- **El inventario solo se descuenta cuando el pago queda aprobado** (vía webhook), nunca antes — así no se "reservan" productos por pagos que nunca se completan.

## Lo que sigue faltando (próximos pasos de la hoja de ruta)

- **Facturación electrónica (DIAN)**: preparado a nivel de base de datos (`facturado`, `factura_url`), pero requiere contratar un proveedor certificado — ver la sección de arriba.
- **WebSockets para el panel de administración**: hoy el panel usa "sondeo" (vuelve a preguntar cada 8 segundos) — funciona bien, pero para pedidos verdaderamente instantáneos el siguiente paso sería Socket.io.
- **Migraciones versionadas**: por ahora los archivos `.sql` se ejecutan uno a uno a mano; para un equipo más grande conviene una herramienta de migraciones (ej. Prisma Migrate si se migra a un ORM).
- **Reintentos de webhook**: si el backend está caído justo cuando Wompi intenta notificar, Wompi reintenta automáticamente por un tiempo — pero vale la pena monitorear los logs del servidor en producción para detectar webhooks fallidos.
