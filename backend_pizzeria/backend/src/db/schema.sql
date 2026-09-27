-- =====================================================================
-- Il Capo della Pizza — Esquema de base de datos (MySQL 8+)
-- =====================================================================
-- Cómo usarlo: ver README.md ("Cómo poner en marcha el backend").
-- Puedes ejecutar este archivo completo con:
--   mysql -u root -p < src/db/schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS il_capo_della_pizza
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE il_capo_della_pizza;

-- ---------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  nombre              VARCHAR(150) NOT NULL,
  correo              VARCHAR(150) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  rol                 ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  reset_token_hash    VARCHAR(255) DEFAULT NULL,
  reset_token_expira  DATETIME DEFAULT NULL,
  creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- productos  (el menú — reemplaza menuData.js hardcodeado del frontend)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(150) NOT NULL UNIQUE,
  nombre        VARCHAR(150) NOT NULL,
  descripcion   VARCHAR(500),
  precio        INT NOT NULL COMMENT 'Precio en COP, sin decimales',
  imagen_url    VARCHAR(500),
  categoria     ENUM('clasicas', 'especiales', 'vegetarianas', 'veganas') NOT NULL,
  disponible    BOOLEAN NOT NULL DEFAULT TRUE,
  stock         INT NOT NULL DEFAULT 100 COMMENT 'Inventario disponible',
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- direcciones  (direcciones de envío guardadas por cada usuario)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS direcciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  nombre          VARCHAR(150) NOT NULL,
  direccion       VARCHAR(255) NOT NULL,
  ciudad          VARCHAR(100) NOT NULL,
  codigo_postal   VARCHAR(20),
  telefono        VARCHAR(30) NOT NULL,
  predeterminada  BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- metodos_pago  (métodos de pago guardados/asociados a un usuario — sin
-- datos sensibles reales; en producción esto son referencias/tokens que
-- entrega la pasarela de pago, nunca el número de tarjeta real)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metodos_pago (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT NOT NULL,
  tipo          ENUM('tarjeta', 'pse', 'efectivo') NOT NULL,
  etiqueta      VARCHAR(100) NOT NULL COMMENT 'Ej: "Visa terminada en 4829" o "Bancolombia"',
  token_externo VARCHAR(255) DEFAULT NULL COMMENT 'Token/id que entrega la pasarela de pago real (Wompi, PayU, etc.)',
  predeterminado BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- pedidos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  numero_seguimiento  VARCHAR(20) NOT NULL UNIQUE,
  referencia_pago     VARCHAR(50) UNIQUE COMMENT 'Referencia enviada a la pasarela de pago (Wompi)',
  usuario_id          INT DEFAULT NULL COMMENT 'NULL si el pedido fue como invitado',
  direccion_id         INT DEFAULT NULL,
  -- Copia de la dirección al momento del pedido (por si luego el usuario la edita/borra)
  direccion_nombre    VARCHAR(150) NOT NULL,
  direccion_texto     VARCHAR(255) NOT NULL,
  direccion_ciudad    VARCHAR(100) NOT NULL,
  direccion_telefono  VARCHAR(30) NOT NULL,
  metodo_pago         ENUM('Pago en línea (Wompi)', 'Efectivo a la Entrega') NOT NULL,
  estado_pago         ENUM('pendiente', 'aprobado', 'declinado', 'error', 'vencido')
                       NOT NULL DEFAULT 'pendiente',
  wompi_transaccion_id VARCHAR(100) DEFAULT NULL,
  subtotal            INT NOT NULL,
  costo_envio         INT NOT NULL,
  iva                 INT NOT NULL,
  total               INT NOT NULL,
  estado              ENUM('recibido', 'en_preparacion', 'en_camino', 'entregado', 'cancelado')
                       NOT NULL DEFAULT 'recibido',
  -- Facturación electrónica (Fase 3): campos de solo lectura para cuando se
  -- conecte un proveedor certificado ante la DIAN (ver nota en el README).
  -- Por ahora quedan en FALSE/NULL — esta app todavía no emite facturas.
  facturado           BOOLEAN NOT NULL DEFAULT FALSE,
  factura_url         VARCHAR(500) DEFAULT NULL,
  creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (direccion_id) REFERENCES direcciones(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- pedido_items  (líneas de cada pedido, incluye pizzas personalizadas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedido_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id         INT NOT NULL,
  producto_id       INT DEFAULT NULL COMMENT 'NULL si es una pizza personalizada',
  nombre_producto   VARCHAR(200) NOT NULL COMMENT 'Copia del nombre al momento de la compra',
  descripcion       VARCHAR(300),
  precio_unitario   INT NOT NULL,
  cantidad          INT NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Índices útiles para las consultas más comunes del panel de administración
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_estado_pago ON pedidos(estado_pago);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_productos_categoria ON productos(categoria);
