-- -------------------------------------------------------
-- SESSÕES (Tokens de autenticação seguros)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessoes (
  id TEXT PRIMARY KEY,
  utilizador_id TEXT NOT NULL REFERENCES utilizadores(id),
  token TEXT NOT NULL UNIQUE,
  expira_em TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
