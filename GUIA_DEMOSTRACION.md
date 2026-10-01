# 📘 Guía de demostración — Il Capo della Pizza

Esta guía te lleva paso a paso para **ver el proyecto funcionando**, ya sea en la demo en línea o en tu equipo. Duración estimada del recorrido completo: **10–15 minutos**.

- [Parte A — Preparar la demo en línea](#parte-a--preparar-la-demo-en-línea-5-min)
- [Parte B — Recorrido como cliente](#parte-b--recorrido-como-cliente)
- [Parte C — Recorrido como administrador](#parte-c--recorrido-como-administrador)
- [Parte D — Si algo falla](#parte-d--si-algo-falla)
- [Parte E — Guion para grabar el video y capturas](#parte-e--guion-para-grabar-el-video-y-capturas)

> Si prefieres correrlo en tu computador, sigue primero la sección *Instalación y ejecución en local* del [README](../README.md) y usa `http://localhost:5173` en lugar de la URL de Vercel.

---

## Parte A — Preparar la demo en línea (~5 min)

La demo usa planes gratuitos que se "duermen". Haz estos pasos **antes** de mostrar el proyecto.

### Paso 1. Encender la base de datos (Aiven)
1. Entra a [console.aiven.io](https://console.aiven.io) → tu proyecto → **Services**.
2. Abre el servicio `il-capo-della-pizza-mysql`.
3. Si junto al nombre aparece **"Apagado"**, abre el menú **⋯** (arriba a la derecha) y elige **Encender / Power on**.
4. Espera a que el estado cambie a **"En ejecución" o "Running"** (puede tardar unos minutos).
   <img width="1909" height="873" alt="image" src="https://github.com/user-attachments/assets/bbc62ced-9dcc-4ec9-9f4a-e9a2866135a5" />


### Paso 2. Despertar el backend (Render)
1. Abre en el navegador: `https://il-capo-della-pizza.onrender.com/api/salud`
2. La primera vez puede tardar hasta ~1 minuto. Debe responder:
   ```json
   {"ok":true,"mensaje":"API de Il Capo della Pizza funcionando"}
   ```

### Paso 3. Verificar la conexión con la base de datos
1. Abre: `https://il-capo-della-pizza.onrender.com/api/productos`
2. Debe mostrar un JSON con la lista de pizzas.
   - Si ves `{"error":"Ocurrió un error inesperado en el servidor"}` → la base sigue apagada o hay un problema de conexión (ver [Parte D](#parte-d--si-algo-falla)).

### Paso 4. Abrir el frontend (Vercel)
1. Entra a `https://il-capo-della-pizza.vercel.app/menu`.
2. Debes ver las pizzas con foto, precio y botón **Añadir**.

✅ **Listo para la demo** cuando el menú carga sin el mensaje de error.

---

## Parte B — Recorrido como cliente

### 1. Inicio
Abre la página principal. Muestra el encabezado (Inicio · Menú · Contacto), el botón **Iniciar Sesión** y el ícono del carrito.
📸 `docs/img/01-inicio.png`

### 2. Menú de pizzas
1. Ve a **Menú**.
2. Cambia entre las categorías: **Clásicas**, **Especiales del Capo**, **Vegetarianas** y **Veganas**.
3. Observa que los productos vienen de la base de datos (no están escritos en el código).
📸 `docs/img/02-menu.png`

### 3. Crea tu Pizza
1. Entra a **Crea tu Pizza**.
2. Elige **tamaño** (Pequeña, Mediana o Familiar), **masa** (Fina, Clásica o Borde de Queso) y los **extras** que quieras.
3. Observa cómo cambia el precio y añade la pizza al carrito.
> El precio real lo recalcula el servidor; el navegador no puede alterarlo.
📸 `docs/img/03-crea-tu-pizza.png`

### 4. Añadir al carrito
1. Vuelve al menú y pulsa **Añadir** en una o dos pizzas.
2. Abre el carrito (ícono arriba a la derecha).
3. Cambia cantidades, elimina un producto y revisa el resumen.
📸 `docs/img/04-carrito.png`

### 5. Registro e inicio de sesión
1. Pulsa **Iniciar Sesión** → **Registro** y crea una cuenta con un correo de prueba.
2. Inicia sesión. Debe aparecer tu nombre en el encabezado.
> La sesión se guarda en una cookie `httpOnly`, por eso no se ve en `localStorage`.
📸 `docs/img/05-login.png`

*(Opcional)* **Recuperar contraseña:** en el login, pulsa *¿Olvidaste tu contraseña?*, escribe tu correo y revisa tu bandeja para abrir el enlace de restablecimiento. Requiere que el backend tenga el SMTP configurado.

### 6. Pago (checkout)
Desde el carrito pulsa **Continuar al pago**, completa la dirección de entrega y elige un método:

**Opción 1 — Efectivo a la entrega**
1. Selecciona *Efectivo a la Entrega* y confirma el pedido.

**Opción 2 — Pago en línea (Wompi, modo pruebas)**
1. Selecciona *Pago en línea (Wompi)*. Se abre el checkout seguro de Wompi.
2. Usa los datos de prueba de la [documentación de Wompi](https://docs.wompi.co) (tarjeta de pruebas, fecha futura y CVC cualquiera).
3. Termina el pago; el sitio te devuelve a la confirmación y consulta el estado del pago.
> Solo funciona con llaves **sandbox**. Nunca se ingresan datos de tarjeta reales en la demo.

Resumen de costos que verás: subtotal + **envío $6.000** + **IVA 19 %**.
📸 `docs/img/06-pago.png`

### 7. Confirmación
Se muestra el número del pedido, el resumen y su estado (**recibido**).
📸 `docs/img/07-confirmacion.png`

### 8. Mi cuenta
Entra a **Cuenta** (con tu usuario): verás el saludo y los **Pedidos Recientes**, incluido el que acabas de crear.
📸 `docs/img/08-cuenta.png`

### 9. Páginas informativas
Recorre rápidamente **Contacto**, **Ayuda**, **Términos y Condiciones** y **Política de Privacidad** desde el pie de página.

---

## Parte C — Recorrido como administrador

1. Cierra la sesión del cliente.
2. Inicia sesión con el **usuario administrador**. Ejecutar `npm run seed` crea un admin de ejemplo (`admin@ilcapodellapizza.com.co`); la contraseña se imprime en la consola al terminar el seed.
3. En el encabezado aparecerá el acceso a **Admin** (o entra directo a `/admin`). Los usuarios sin rol `admin` son bloqueados.

### 10. Pedidos
1. En **Admin → Pedidos** verás el pedido hecho en la Parte B.
2. Filtra por estado.
3. Cambia el estado siguiendo el flujo: `recibido → en_preparacion → en_camino → entregado` (o `cancelado`).
4. Vuelve a la cuenta del cliente y comprueba que el estado cambió.
> Los pedidos pagados en línea **no avanzan** hasta que Wompi confirma el pago (webhook); los de efectivo sí.
📸 `docs/img/09-admin-pedidos.png`

### 11. Productos
1. En **Admin → Productos**, crea un producto nuevo (nombre, descripción, precio, imagen y categoría).
2. Edítalo y luego elimínalo.
3. Revisa el menú público: los cambios se reflejan al instante.
📸 `docs/img/10-admin-productos.png`

---

## Parte D — Si algo falla

| Qué ves | Qué hacer |
|---|---|
| *"No pudimos cargar el menú"* | Enciende MySQL en Aiven (Paso 1) y despierta Render (Paso 2). Recarga la página. |
| `/api/productos` → error 500 | Revisa en Render → **Logs** el error real (`ECONNREFUSED`, `Access denied`, `ER_NO_SUCH_TABLE`, SSL…). |
| La primera carga tarda mucho | Render estaba dormido; es normal en plan gratuito. Espera hasta 1 minuto. |
| Error de CORS en la consola | `FRONTEND_URL` en Render debe coincidir exactamente con la URL de Vercel (sin `/` final). |
| Inicias sesión y se pierde la sesión | Verifica `NODE_ENV=production` en Render. |
| El carrito/login llama a una URL equivocada | `VITE_API_URL` en Vercel debe terminar en `/api`; redespliega tras cambiarla. |
| El pago en línea queda "pendiente" | Revisa la URL de eventos en Wompi: `…/api/pagos/webhook/wompi`. |

---

## Parte E — Guion para grabar el video y capturas

### Guion sugerido (3–5 min)
| Tiempo | Qué mostrar |
|---|---|
| 0:00 | Presentación: qué es el proyecto y su stack (React · Express · MySQL · Vercel/Render/Aiven) |
| 0:30 | Menú y categorías |
| 1:00 | Crea tu Pizza (tamaño, masa, extras) |
| 1:45 | Carrito → registro/login |
| 2:30 | Pago (efectivo y/o Wompi sandbox) y confirmación |
| 3:15 | Panel admin: cambio de estado del pedido y gestión de productos |
| 4:15 | Cierre: repositorio, README y tecnologías |

### Consejos de grabación
- Haz primero la **Parte A** para evitar esperas durante la grabación.
- Graba en resolución 1080p, con el navegador a pantalla completa y sin pestañas personales a la vista.
- Para subirlo directo a GitHub, mantenlo **por debajo de ~10 MB** (clips cortos o GIF). Si es más largo, súbelo a YouTube como *no listado* y enlázalo en el README.

### Capturas a tomar (nombres para `docs/img/`)
- [ ] `01-inicio.png`
- [ ] `02-menu.png`
- [ ] `03-crea-tu-pizza.png`
- [ ] `04-carrito.png`
- [ ] `05-login.png`
- [ ] `06-pago.png`
- [ ] `07-confirmacion.png`
- [ ] `08-cuenta.png`
- [ ] `09-admin-pedidos.png`
- [ ] `10-admin-productos.png`
- [ ] `miniatura-video.png` (si usas YouTube)

> 🔒 Antes de tomar capturas, oculta correos y datos personales reales y no muestres llaves ni variables de entorno.
