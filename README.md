# Il Capo della Pizza 🍕

Sitio  web de pedidos de pizza (SPA) con panel de administración, desarrollado como proyecto académico.

## 🔗 Enlaces en vivo

| Servicio | URL |
|---|---|
| **Sitio web (frontend)** | https://il-capo-della-pizza.vercel.app |
| **API (backend)** | https://il-capo-della-pizza.onrender.com/api/salud |
| **Repositorio** | https://github.com/bautistahernandezdiegoalejandr-web/il-capo-della-pizza |

> ⚠️ **Nota para el evaluador:** el backend está alojado en el plan gratuito de Render, que "duerme" el servidor tras ~15 minutos sin uso. Si el sitio tarda en cargar el menú la primera vez, espera unos 30-60 segundos — es normal, el servidor solo se está reactivando.

### Cómo probar el flujo completo

1. Entra a https://il-capo-della-pizza.vercel.app
2. Agrega una o más pizzas al carrito desde **Menú**
3. Ve a pagar: completa la dirección de entrega
4. En **Forma de pago**, selecciona **Efectivo a la Entrega** (la opción de pago en línea está deshabilitada a propósito, ver más abajo)
5. Confirma el pedido — verás el número de seguimiento
6. Inicia sesión como administrador para ver el pedido en el panel:
   - Correo: admin@ilcapodellapizza.com.co
   - Contraseña: CambiaEstaClave123!
7. Entra a **Panel Admin** → puedes cambiar el estado del pedido (Recibido → En preparación → En camino → Entregado)

## 🧱 Arquitectura

```
Proyecto_Sitio_Web_Il_Capo_della_Pizza/
├── backend_pizzeria/backend/    → API REST (Node.js + Express)
└── frontend_pizzeria/react-app/ → SPA (React + Vite + Tailwind)
```

| Capa | Tecnología | Hosting |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Vercel |
| Backend | Node.js + Express | Render |
| Base de datos | MySQL 8 | Aiven (con conexión SSL) |
| Autenticación | JWT en cookie httpOnly | — |
| Pagos en línea | Wompi (Widget + Webhooks) | Implementado, deshabilitado en la UI |

## 💳 Sobre la integración de pagos (Wompi)

El proyecto incluye una integración completa con **Wompi** para pagos en línea (tarjeta, PSE, Nequi, Bancolombia):

- Firma de integridad calculada en el servidor (nunca en el navegador) con la llave secreta
- Verificación de la firma del webhook de confirmación de pago
- Diseño compatible con PCI-DSS: el backend nunca recibe ni almacena datos de tarjetas

**Por qué está deshabilitada en la demo:** para garantizar que la sustentación en vivo no dependa de la disponibilidad de un servicio de pagos externo, la opción "Pago en línea" se deshabilitó visualmente en la interfaz (badge "Próximamente"), sin eliminar el código. El flujo que se demuestra end-to-end es **Efectivo a la Entrega**, que sí crea el pedido real en la base de datos y es visible en el panel de administración.

## ⚙️ Cómo correr el proyecto en local

### Backend
```bash
cd backend_pizzeria/backend
npm install
cp .env.example .env   # completa tus propias variables
npm run dev
```

### Frontend
```bash
cd frontend_pizzeria/react-app
npm install
cp .env.example .env   # completa VITE_API_URL
npm run dev
```

Variables de entorno necesarias en `backend_pizzeria/backend/.env`:

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

## 🗄️ Base de datos

El esquema completo está en `backend_pizzeria/backend/src/db/schema.sql`. Para cargarlo:

```bash
mysql -u root -p < backend_pizzeria/backend/src/db/schema.sql
```

Para cargar datos de ejemplo (productos + usuario administrador):

```bash
cd backend_pizzeria/backend
node src/db/seed.js
```

## 📦 Despliegue

El proyecto está desplegado en:
- **GitHub** — control de versiones (monorepo, rama `main`)
- **Aiven** — MySQL gestionado con SSL
- **Render** — API backend (Node.js)
- **Vercel** — sitio frontend (Vite/React)

---

Proyecto académico — Il Capo della Pizza © 2026
