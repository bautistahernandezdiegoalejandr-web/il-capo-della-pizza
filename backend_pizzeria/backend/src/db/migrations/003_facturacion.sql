-- =====================================================================
-- Migración 003 — Preparación para facturación electrónica
-- =====================================================================
-- Esto NO conecta ningún proveedor de facturación real todavía — solo deja
-- los campos listos en la base de datos para cuando se integre uno.
-- Ver la sección "Facturación electrónica" del README para más contexto.
--
--   mysql -u root -p il_capo_della_pizza < src/db/migrations/003_facturacion.sql
-- =====================================================================

USE il_capo_della_pizza;

ALTER TABLE pedidos
  ADD COLUMN facturado    BOOLEAN NOT NULL DEFAULT FALSE AFTER estado,
  ADD COLUMN factura_url  VARCHAR(500) DEFAULT NULL AFTER facturado;
