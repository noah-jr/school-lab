-- ============================================================
-- MIGRAÇÃO 021 — Adicionar 'NR' ao check constraint de nivel_oratoria
-- ============================================================

PRAGMA foreign_keys=OFF;

ALTER TABLE turma_estudantes RENAME TO old_turma_estudantes;

CREATE TABLE turma_estudantes (
  id                  TEXT PRIMARY KEY,
  turma_id            TEXT NOT NULL REFERENCES turmas(id),
  estudante_id        TEXT NOT NULL REFERENCES estudantes(id),
  numero_lista        INTEGER,
  idade               REAL,
  anos_batismo        REAL,
  nivel_oratoria      TEXT CHECK(nivel_oratoria IN ('A','A+','A-','B','B+','B-','C','C+','C-','NR')),
  cca_nome            TEXT,
  cca_email           TEXT,
  avaliado_pelo_viajante INTEGER NOT NULL DEFAULT 0,
  data_avaliacao      TEXT,
  observacoes         TEXT,
  criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(turma_id, estudante_id)
);

INSERT INTO turma_estudantes SELECT * FROM old_turma_estudantes;

DROP TABLE old_turma_estudantes;

CREATE INDEX IF NOT EXISTS idx_te_turma ON turma_estudantes(turma_id);
CREATE INDEX IF NOT EXISTS idx_te_estudante ON turma_estudantes(estudante_id);

PRAGMA foreign_keys=ON;
