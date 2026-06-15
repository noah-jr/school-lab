-- ============================================================
-- MIGRAÇÃO 005 — Tokens de acesso temporário para viajantes
-- Permite ao admin gerar um link único com expiração para que
-- o viajante de um circuito possa avaliar os estudantes da
-- turma sem necessitar de conta no sistema.
-- ============================================================

CREATE TABLE IF NOT EXISTS tokens_avaliacao (
  id          TEXT PRIMARY KEY,
  token       TEXT NOT NULL UNIQUE,       -- slug aleatório de 32 bytes (hex)
  turma_id    TEXT NOT NULL REFERENCES turmas(id),
  descricao   TEXT,                       -- ex: "Viajante do Circuito 206 - João Silva"
  expira_em   TEXT NOT NULL,              -- ISO datetime
  revogado    INTEGER NOT NULL DEFAULT 0, -- 0=activo, 1=revogado manualmente
  criado_por  TEXT REFERENCES utilizadores(id),
  criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tokens_turma  ON tokens_avaliacao(turma_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token  ON tokens_avaliacao(token);
