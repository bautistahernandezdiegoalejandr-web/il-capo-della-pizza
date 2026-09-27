-- =====================================================================
-- Migración 002 — Fase 3: Pagos reales (Wompi)
-- =====================================================================
-- Ejecútala sobre una base de datos que YA tiene el esquema de la Fase 2
-- (si es una instalación nueva, no la necesitas: schema.sql ya la incluye).
--
--   mysql -u root -p il_capo_della_pizza < src/db/migrations/002_pagos.sql
-- =====================================================================

USE il_capo_della_pizza;

ALTER TABLE pedidos
  MODIFY COLUMN metodo_pago ENUM('Pago en línea (Wompi)', 'Efectivo a la Entrega') NOT NULL,
  ADD COLUMN estado_pago ENUM('pendiente', 'aprobado', 'declinado', 'error', 'vencido')
    NOT NULL DEFAULT 'pendiente' AFTER metodo_pago,
  ADD COLUMN referencia_pago VARCHAR(50) UNIQUE AFTER numero_seguimiento,
  ADD COLUMN wompi_transaccion_id VARCHAR(100) DEFAULT NULL AFTER estado_pago;

CREATE INDEX idx_pedidos_estado_pago ON pedidos(estado_pago);
