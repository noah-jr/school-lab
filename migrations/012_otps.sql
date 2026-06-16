-- ============================================================
-- MIGRAÇÃO 012 — Sistema de OTP (Recuperação e Registo)
-- ============================================================

CREATE TABLE IF NOT EXISTS otps (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  proposito TEXT NOT NULL CHECK(proposito IN ('recuperacao', 'registo', 'convite')),
  expira_em TEXT NOT NULL,
  usado INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
CREATE INDEX IF NOT EXISTS idx_otps_codigo ON otps(codigo);
