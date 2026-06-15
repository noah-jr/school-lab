-- ============================================================
-- MIGRAÇÃO 007 — Motivo de Recusa em Designações
-- Adiciona a coluna para guardar o motivo quando o estudante
-- recusa uma designação através do portal público.
-- ============================================================

ALTER TABLE designacoes ADD COLUMN motivo_recusa TEXT;
