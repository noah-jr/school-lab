-- ============================================================
-- MIGRAÇÃO 006 — Tokens de Acesso para Estudantes
-- Adiciona um token único a cada inscrição de estudante na turma
-- para permitir o acesso público à página de confirmação de designações.
-- ============================================================

ALTER TABLE turma_estudantes ADD COLUMN token_acesso TEXT;

-- Índice para procura rápida pelo token
CREATE UNIQUE INDEX IF NOT EXISTS idx_te_token_acesso ON turma_estudantes(token_acesso);
