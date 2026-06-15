-- ============================================================
-- MIGRAÇÃO 008 — Adicionar papel de "secretaria"
-- ============================================================

PRAGMA foreign_keys=off;
CREATE TABLE utilizadores_new (
  id          TEXT PRIMARY KEY,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  senha_hash  TEXT NOT NULL,
  papel       TEXT NOT NULL DEFAULT 'admin' CHECK(papel IN ('admin', 'instrutor', 'viajante', 'secretaria')),
  activo      INTEGER NOT NULL DEFAULT 1,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO utilizadores_new SELECT * FROM utilizadores;
DROP TABLE utilizadores;
ALTER TABLE utilizadores_new RENAME TO utilizadores;

PRAGMA foreign_keys=on;
