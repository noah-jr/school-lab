-- ============================================================
-- MIGRAÇÃO 016 — Adiciona restrição diária configurável para turmas
-- ============================================================

ALTER TABLE turmas ADD COLUMN restricao_diaria INTEGER NOT NULL DEFAULT 1 CHECK(restricao_diaria IN (0, 1));
