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
   <img width="719" height="225" alt="image" src="https://github.com/user-attachments/assets/9d448cd6-9c9c-4ce7-85a9-e01cc7f4148b" />

   

### Paso 3. Verificar la conexión con la base de datos
1. Abre: `https://il-capo-della-pizza.onrender.com/api/productos`
2. Debe mostrar un JSON con la lista de pizzas.
   - Si ves `{"error":"Ocurrió un error inesperado en el servidor"}` → la base sigue apagada o hay un problema de conexión (ver [Parte D](#parte-d--si-algo-falla)).
     <img width="1911" height="721" alt="image" src="https://github.com/user-attachments/assets/722a5657-66af-4155-a134-7b29cb66d98e" />


### Paso 4. Abrir el frontend (Vercel)
1. Entra a `https://il-capo-della-pizza.vercel.app/menu`.
2. Debes ver las pizzas con foto, precio y botón **Añadir**.
   <img width="1580" height="1010" alt="image" src="https://github.com/user-attachments/assets/153f7fb8-0f42-47b5-b258-7069ac886f5a" />


✅ **Listo para la demo** cuando el menú carga sin el mensaje de error.

---

## Parte B — Recorrido como cliente

### 1. Inicio
Abre la página principal. Muestra el encabezado (Inicio · Menú · Contacto), el botón **Iniciar Sesión** y el ícono del carrito.
<img width="1671" height="760" alt="image" src="https://github.com/user-attachments/assets/e5720dd6-4c2d-4abc-a0ac-20525700cf87" />


### 2. Menú de pizzas
1. Ve a **Menú**.
2. Cambia entre las categorías: **Clásicas**, **Especiales del Capo**, **Vegetarianas** y **Veganas**.
3. Observa que los productos vienen de la base de datos (no están escritos en el código).
<img width="1576" height="1001" alt="image" src="https://github.com/user-attachments/assets/a550c108-712c-4fd2-a038-82d88f65b0c6" />


### 3. Crea tu Pizza
1. Entra a **Crea tu Pizza**.
2. Elige **tamaño** (Pequeña, Mediana o Familiar), **masa** (Fina, Clásica o Borde de Queso) y los **extras** que quieras.
3. Observa cómo cambia el precio y añade la pizza al carrito.
> El precio real lo recalcula el servidor; el navegador no puede alterarlo.
<img width="1372" height="1009" alt="image" src="https://github.com/user-attachments/assets/9055f8ca-25a7-4d1d-822f-91a5765a4853" />


### 4. Añadir al carrito
1. Vuelve al menú y pulsa **Añadir** en una o dos pizzas.
2. Abre el carrito (ícono arriba a la derecha).
3. Cambia cantidades, elimina un producto y revisa el resumen.
<img width="1586" height="767" alt="image" src="https://github.com/user-attachments/assets/4083ec51-b7fc-4c22-9333-568328f535c2" />


### 5. Registro e inicio de sesión
1. Pulsa **Iniciar Sesión** → **Registro** y crea una cuenta con un correo de prueba.
2. Inicia sesión. Debe aparecer tu nombre en el encabezado.
> La sesión se guarda en una cookie `httpOnly`, por eso no se ve en `localStorage`.
<img width="1505" height="878" alt="image" src="https://github.com/user-attachments/assets/f1910d12-2e76-4999-a01a-134052b9d0e4" />
<img width="1549" height="855" alt="image" src="https://github.com/user-attachments/assets/7daeff2f-6e73-4d57-8edb-8e1a33ff5308" />



*(Opcional)* **Recuperar contraseña:** en el login, pulsa *¿Olvidaste tu contraseña?*, escribe tu correo y revisa tu bandeja para abrir el enlace de restablecimiento. Requiere que el backend tenga el SMTP configurado.
<img width="1490" height="785" alt="image" src="https://github.com/user-attachments/assets/a2d6297e-d983-4097-a43b-6fa3c2afb752" />


### 6. Pago (checkout)
Desde el carrito pulsa **Continuar al pago**, completa la dirección de entrega y elige un método:
<img width="1566" height="996" alt="image" src="https://github.com/user-attachments/assets/e7616b88-6461-4c11-bf31-253cdb7217d1" />
<img width="1567" height="950" alt="image" src="https://github.com/user-attachments/assets/b230e13a-9b49-4476-9afa-ad5b78d4b364" />




**Opción 1 — Efectivo a la entrega**
1. Selecciona *Efectivo a la Entrega* y confirma el pedido.
   <img width="1542" height="962" alt="image" src="https://github.com/user-attachments/assets/c1b0ae9b-390f-412e-b992-b9a467054490" />
   <img width="1542" height="986" alt="image" src="https://github.com/user-attachments/assets/a140a395-cc3b-4146-8fcf-fa1d1e6a93ae" />



**Opción 2 — Pago en línea (Wompi, modo pruebas)(ESTA FUNCION ESTA DESHABILITADA) **
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
   <img width="1534" height="856" alt="image" src="https://github.com/user-attachments/assets/58f158c3-7d2e-4c61-be04-81686766a1aa" />
   <img width="1424" height="973" alt="image" src="https://github.com/user-attachments/assets/d34a5e16-3d29-4199-8684-297fc033c09e" />


   

### 10. Pedidos
1. En **Admin → Pedidos** verás el pedido hecho en la Parte B.
2. Filtra por estado.
3. Cambia el estado siguiendo el flujo: `recibido → en_preparacion → en_camino → entregado` (o `cancelado`).
4. Vuelve a la cuenta del cliente y comprueba que el estado cambió.
> Los pedidos pagados en línea **no avanzan** hasta que Wompi confirma el pago (webhook); los de efectivo sí.
<img width="1483" height="955" alt="image" src="https://github.com/user-attachments/assets/4ee8210c-2de3-491d-9c1b-8c8850259ae8" />


### 11. Productos
1. En **Admin → Productos**, crea un producto nuevo (nombre, descripción, precio, imagen y categoría).
2. Edítalo y luego elimínalo.
3. Revisa el menú público: los cambios se reflejan al instante.
<img width="1448" height="866" alt="image" src="https://github.com/user-attachments/assets/224670b4-6c0b-44a1-a7c3-c6273b686a0a" />
<img width="1413" height="1010" alt="image" src="https://github.com/user-attachments/assets/e0aafd85-dee8-4f90-905c-217fd859753a" />



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

