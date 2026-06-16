-- ============================================================
-- MIGRAÇÃO 013 — Suporte para Uploads no Perfil do Estudante
-- ============================================================

ALTER TABLE uploads ADD COLUMN estudante_id TEXT REFERENCES estudantes(id);
CREATE INDEX IF NOT EXISTS idx_uploads_estudante ON uploads(estudante_id);
