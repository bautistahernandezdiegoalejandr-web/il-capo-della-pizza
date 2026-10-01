# 🍕 Il Capo della Pizza

Aplicación web full-stack para una pizzería: los clientes exploran el menú, arman su propia pizza, pagan en línea o en efectivo y siguen su pedido, mientras el administrador gestiona productos y pedidos desde un panel protegido.

> 📘 **¿Quieres ver el proyecto funcionando?** Sigue la [**Guía de demostración paso a paso**](docs/GUIA_DEMOSTRACION.md).

---

## 🌐 Demo en línea

| Parte | Tecnología | URL |
|---|---|---|
| Frontend | React + Vite (Vercel) | https://il-capo-della-pizza.vercel.app |
| API | Node.js + Express (Render) | https://il-capo-della-pizza.onrender.com/api/salud |
| Base de datos | MySQL 8 (Aiven) | Privada |

> ⚠️ **Importante: la demo usa planes gratuitos.**
> - **Render** se duerme tras ~15 min sin tráfico: la primera carga puede tardar hasta 1 minuto.
> - **Aiven** apaga el servicio MySQL por inactividad. Si el menú muestra *"No pudimos cargar el menú"*, la base de datos probablemente está apagada y hay que encenderla desde la consola de Aiven.
>
> Más detalles en [Solución de problemas](#-solución-de-problemas).

## 🎥 Video de demostración

<!-- Opción 1: arrastra el .mp4 (máx. ~10 MB) a este editor y GitHub generará el enlace -->
<!-- Opción 2: video en YouTube (no listado) con miniatura clicable: -->
<!-- [![Video de demostración](docs/img/miniatura-video.png)](https://youtu.be/TU_VIDEO) -->

*(Próximamente: aquí va el video de demostración del proyecto.)*

---

## ✨ Funcionalidades

**Para clientes**
- Menú por categorías: Clásicas, Especiales del Capo, Vegetarianas y Veganas.
- **Crea tu Pizza**: elige tamaño, tipo de masa y extras; el precio final lo calcula el servidor.
- Carrito de compras persistente en el navegador.
- Checkout como **invitado** o con cuenta registrada.
- Pago en línea con **Wompi** (tarjeta, PSE, Nequi, Bancolombia) o **efectivo a la entrega**.
- Registro, inicio de sesión (cookie `httpOnly` con JWT) y **recuperación de contraseña por correo**.
- Página de cuenta con pedidos recientes y direcciones de entrega.
- Páginas de Contacto, Ayuda, Términos y Condiciones y Política de Privacidad.

**Para administradores** (rol `admin`)
- Panel de **pedidos**: filtra por estado y cámbialo (`recibido → en_preparacion → en_camino → entregado` o `cancelado`).
- Panel de **productos**: crear, editar y eliminar productos del menú.

## 🧰 Tecnologías

| Capa | Herramientas |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3 |
| Backend | Node.js (ES Modules), Express 4, express-validator, cookie-parser, CORS |
| Autenticación | JWT en cookie `httpOnly`, bcryptjs |
| Base de datos | MySQL 8 con `mysql2` (SSL con certificado CA de Aiven) |
| Pagos | Wompi (Widget + webhook con verificación de firma) |
| Correo | Nodemailer (SMTP) |
| Despliegue | Vercel (frontend), Render (backend), Aiven (MySQL) |

## 🏗️ Arquitectura

```
   Navegador ──► Vercel (React/Vite) ──── fetch + cookie ───► Render (Express API) ──► Aiven (MySQL)
                                                                    ▲
                                          Wompi ── webhook ─────────┘
```

---

## 📸 Recorrido por la aplicación

> Sube tus capturas a `docs/img/` con estos nombres y se mostrarán automáticamente.

| | |
|---|---|
| **1. Inicio** <br> ![Inicio](docs/img/01-inicio.png) | **2. Menú de pizzas** <br> ![Menú](docs/img/02-menu.png) |
| **3. Crea tu Pizza** <br> ![Personalización](docs/img/03-crea-tu-pizza.png) | **4. Carrito** <br> ![Carrito](docs/img/04-carrito.png) |
| **5. Registro / Login** <br> ![Login](docs/img/05-login.png) | **6. Pago** <br> ![Pago](docs/img/06-pago.png) |
| **7. Confirmación del pedido** <br> ![Confirmación](docs/img/07-confirmacion.png) | **8. Mi cuenta** <br> ![Cuenta](docs/img/08-cuenta.png) |
| **9. Admin: pedidos** <br> ![Admin pedidos](docs/img/09-admin-pedidos.png) | **10. Admin: productos** <br> ![Admin productos](docs/img/10-admin-productos.png) |

---

## 📁 Estructura del proyecto

```
Proyecto_Sitio_Web_Il_Capo_della_Pizza/
├── backend_pizzeria/backend/
│   ├── server.js                 # Punto de entrada (Express, CORS, rutas)
│   ├── ca.pem                    # Certificado CA público de Aiven (SSL)
│   ├── .env.example
│   └── src/
│       ├── config/db.js          # Pool MySQL (usa ca.pem si existe)
│       ├── controllers/          # auth, productos, pedidos, direcciones, pagos
│       ├── routes/               # Definición de endpoints
│       ├── middleware/           # Sesión, rol admin, manejo de errores
│       ├── utils/                # JWT, correo (SMTP), firma Wompi
│       ├── data/personalizacionData.js   # Tamaños, masas y extras (precios reales)
│       └── db/
│           ├── schema.sql        # Tablas base
│           ├── migrations/       # 002_pagos.sql, 003_facturacion.sql
│           └── seed.js           # Menú inicial + usuario admin de ejemplo
├── frontend_pizzeria/react-app/
│   ├── .env.example
│   ├── vercel.json               # Rewrites para React Router
│   └── src/
│       ├── pages/                # Inicio, Menú, Carrito, Pago, Cuenta, admin/...
│       ├── components/           # Header, Footer, TarjetaProducto, RutaAdmin
│       ├── context/              # Carrito y Usuario
│       └── services/api.js       # Cliente HTTP (credentials: 'include')
└── docs/
    ├── GUIA_DEMOSTRACION.md
    └── img/                      # Capturas del README
```

---

## 🚀 Instalación y ejecución en local

### Requisitos
- [Node.js](https://nodejs.org) 18 o superior
- MySQL 8 local (o un servicio MySQL en la nube, como Aiven)
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

### 2. Crear la base de datos
Con MySQL corriendo en tu equipo, ejecuta en este orden:

```bash
mysql -u root -p < backend_pizzeria/backend/src/db/schema.sql
mysql -u root -p il_capo_della_pizza < backend_pizzeria/backend/src/db/migrations/002_pagos.sql
mysql -u root -p il_capo_della_pizza < backend_pizzeria/backend/src/db/migrations/003_facturacion.sql
```

> 💡 `schema.sql` crea la base `il_capo_della_pizza`. En un servicio gestionado como **Aiven** normalmente ya existe una base (`defaultdb`): ejecuta el contenido de los `.sql` sobre esa base, omitiendo las líneas `CREATE DATABASE` y `USE`.

### 3. Configurar y arrancar el backend
```bash
cd backend_pizzeria/backend
npm install
cp .env.example .env        # en Windows: copy .env.example .env
# Edita .env con tus datos (ver sección "Variables de entorno")
npm run seed                # carga el menú y crea el usuario admin de ejemplo
npm run dev                 # API en http://localhost:4000
```

Comprueba que responde: http://localhost:4000/api/salud → `{"ok":true,"mensaje":"API de Il Capo della Pizza funcionando"}`

### 4. Configurar y arrancar el frontend
En otra terminal:
```bash
cd frontend_pizzeria/react-app
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

### 5. Abrir la aplicación
Entra a **http://localhost:5173** y recorre el menú. Para probar el panel de administración, inicia sesión con el usuario admin que muestra `npm run seed` al terminar y entra a `/admin`.

### Scripts disponibles

| Carpeta | Comando | Qué hace |
|---|---|---|
| backend | `npm run dev` | Servidor con recarga automática |
| backend | `npm start` | Servidor en modo producción |
| backend | `npm run seed` | Carga productos y usuario admin de ejemplo |
| frontend | `npm run dev` | Servidor de desarrollo Vite |
| frontend | `npm run build` | Genera la carpeta `dist/` |
| frontend | `npm run preview` | Sirve el build localmente |

---

## 🔐 Variables de entorno

Nunca subas los archivos `.env` reales. Usa los `.env.example` como plantilla.

### Backend (`backend_pizzeria/backend/.env`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto `4000`) |
| `FRONTEND_URL` | URL exacta del frontend, sin `/` final (la usa CORS) |
| `NODE_ENV` | `development` en local, `production` en Render |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Datos de conexión a MySQL. En Aiven el puerto **no es 3306** y la base suele ser `defaultdb` |
| `JWT_SECRET` | Cadena aleatoria larga para firmar los tokens |
| `JWT_EXPIRES_IN` | Duración del token (ej. `7d`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Servidor de correo para recuperar contraseña |
| `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY` | Llaves de Wompi (usa las `test` en desarrollo) |
| `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET` | Secretos de integridad y de eventos (webhook) |

### Frontend (`frontend_pizzeria/react-app/.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API **terminada en `/api`**. Local: `http://localhost:4000/api` |
| `VITE_WOMPI_PUBLIC_KEY` | Llave pública de Wompi |

> **Nota SSL:** `src/config/db.js` busca el archivo `ca.pem` en la raíz del backend. Si existe, conecta con SSL (necesario en Aiven); si no, conecta sin SSL (válido para MySQL local).

---

## 🔌 Endpoints de la API

Prefijo común: `/api`. Los endpoints protegidos usan la cookie `token` (`httpOnly`).

### General
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/salud` | Público | Estado del servidor |

### Autenticación — `/auth`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/registro` | Público | Crear cuenta |
| POST | `/auth/login` | Público | Iniciar sesión |
| POST | `/auth/logout` | Público | Cerrar sesión |
| GET | `/auth/me` | Sesión | Usuario actual |
| POST | `/auth/olvide-password` | Público | Enviar correo de recuperación |
| POST | `/auth/restablecer-password` | Público | Definir nueva contraseña |

### Productos — `/productos`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/productos` | Público | Catálogo del menú |
| GET | `/productos/admin/todos` | Admin | Todos los productos |
| POST | `/productos/admin` | Admin | Crear producto |
| PUT | `/productos/admin/:id` | Admin | Actualizar producto |
| DELETE | `/productos/admin/:id` | Admin | Eliminar producto |

### Pedidos — `/pedidos`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/pedidos` | Invitado o sesión | Crear pedido (checkout) |
| GET | `/pedidos/mios` | Sesión | Pedidos del usuario |
| GET | `/pedidos/admin/todos?estado=` | Admin | Listar pedidos (filtro opcional) |
| PATCH | `/pedidos/admin/:id/estado` | Admin | Cambiar estado del pedido |

### Direcciones — `/direcciones`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/direcciones` | Sesión | Listar direcciones |
| POST | `/direcciones` | Sesión | Guardar dirección |
| DELETE | `/direcciones/:id` | Sesión | Eliminar dirección |

### Pagos — `/pagos`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/pagos/webhook/wompi` | Wompi (firma verificada) | Confirmación de pago |
| GET | `/pagos/estado/:referencia` | Público | Consultar estado de un pago |

**Reglas de negocio:** costo de envío fijo de **$6.000 COP** e **IVA del 19 %**. Los precios se recalculan siempre en el servidor. Un pedido pagado en línea no avanza de estado hasta que Wompi confirma el pago.

**Base de datos:** tablas `usuarios`, `productos`, `direcciones`, `metodos_pago`, `pedidos` y `pedido_items`.

---

## ☁️ Despliegue

**Aiven (MySQL)** — Crea un servicio MySQL gratuito, descarga el certificado CA (`ca.pem`) y ejecuta los `.sql` de `src/db/` sobre la base del servicio.

**Render (backend)** — Web Service con *Root Directory* `backend_pizzeria/backend`, *Build Command* `npm install` y *Start Command* `npm start`. Define todas las variables del backend; en especial `NODE_ENV=production` (activa `secure` y `sameSite=none` en la cookie de sesión, necesarios porque frontend y API están en dominios distintos) y `FRONTEND_URL` con la URL exacta de Vercel.

**Vercel (frontend)** — *Root Directory* `frontend_pizzeria/react-app`, preset Vite, *Build Command* `npm run build`, *Output* `dist`. Define `VITE_API_URL` (con `/api` al final) y `VITE_WOMPI_PUBLIC_KEY`. El archivo `vercel.json` ya incluye el *rewrite* para que las rutas de React Router funcionen al recargar.

**Wompi** — En el panel de Wompi configura la URL de eventos:
`https://il-capo-della-pizza.onrender.com/api/pagos/webhook/wompi`

---

## 🛠️ Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El menú dice *"No pudimos cargar el menú"* | Aiven apagado o Render dormido | Enciende MySQL en la consola de Aiven; abre `/api/salud` para despertar Render y recarga |
| `/api/productos` devuelve **500** | La base no responde, credenciales/puerto incorrectos o faltan tablas | Revisa los **Logs** de Render y las variables `DB_*` |
| Error de CORS en la consola del navegador | `FRONTEND_URL` no coincide exactamente con el origen | Corrígela (sin `/` final) y redespliega |
| Inicias sesión pero la sesión se pierde en producción | Falta `NODE_ENV=production` en Render | Defínela para que la cookie sea `secure` + `sameSite=none` |
| El frontend llama a la API equivocada | `VITE_API_URL` mal definida | Debe terminar en `/api`; en Vercel hay que **redesplegar** tras cambiar variables |
| Error SSL al conectar a MySQL | Falta `ca.pem` en la raíz del backend | Descárgalo de la consola de Aiven |
| El pedido pagado en línea no cambia de estado | El webhook de Wompi no llegó | Verifica la URL de eventos y `WOMPI_EVENTS_SECRET` |

## 🔒 Seguridad

- Los archivos `.env` están en `.gitignore`; no los subas.
- `ca.pem` es el certificado **público** de Aiven y puede versionarse; nunca subas claves privadas.
- El usuario administrador de ejemplo creado por `npm run seed` es solo para desarrollo: **cambia su contraseña** (o no ejecutes el seed) en cualquier base accesible desde internet.
- Los datos de tarjeta nunca pasan por este servidor: los gestiona el checkout de Wompi.

## 👤 Autor

**DIEGO ALEJANDRO BAUTISTA HERNANDEZ**
