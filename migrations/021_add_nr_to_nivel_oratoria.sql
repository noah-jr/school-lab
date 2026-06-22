-- ============================================================
-- MIGRAÇÃO 021 — Adicionar 'NR' ao check constraint de nivel_oratoria
-- ============================================================

-- 1. Renomear tabelas existentes para temporárias
ALTER TABLE designacoes RENAME TO old_designacoes;
ALTER TABLE turma_estudantes RENAME TO old_turma_estudantes;

-- 2. Criar a nova tabela turma_estudantes com o check contendo 'NR'
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
  token_acesso        TEXT,
  criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(turma_id, estudante_id)
);

-- 3. Copiar dados para a nova turma_estudantes
INSERT INTO turma_estudantes (
  id, turma_id, estudante_id, numero_lista, idade, anos_batismo, 
  nivel_oratoria, cca_nome, cca_email, avaliado_pelo_viajante, 
  data_avaliacao, observacoes, token_acesso, criado_em, actualizado_em
) 
SELECT 
  id, turma_id, estudante_id, numero_lista, idade, anos_batismo, 
  nivel_oratoria, cca_nome, cca_email, avaliado_pelo_viajante, 
  data_avaliacao, observacoes, token_acesso, criado_em, actualizado_em 
FROM old_turma_estudantes;

-- 4. Criar a nova tabela designacoes
CREATE TABLE designacoes (
  id                  TEXT PRIMARY KEY,
  turma_id            TEXT NOT NULL REFERENCES turmas(id),
  turma_estudante_id  TEXT NOT NULL REFERENCES turma_estudantes(id),
  parte_id            TEXT NOT NULL REFERENCES programa_partes(id),
  dia_semana          TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','confirmada','realizada','cancelada')),
  observacoes         TEXT,
  motivo_recusa       TEXT,
  criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Copiar dados para a nova designacoes
INSERT INTO designacoes (
  id, turma_id, turma_estudante_id, parte_id, dia_semana, 
  status, observacoes, motivo_recusa, criado_em, actualizado_em
)
SELECT 
  id, turma_id, turma_estudante_id, parte_id, dia_semana, 
  status, observacoes, motivo_recusa, criado_em, actualizado_em
FROM old_designacoes;

-- 6. Eliminar tabelas temporárias
DROP TABLE old_designacoes;
DROP TABLE old_turma_estudantes;

-- 7. Criar índices para ambas as tabelas
CREATE INDEX IF NOT EXISTS idx_te_turma ON turma_estudantes(turma_id);
CREATE INDEX IF NOT EXISTS idx_te_estudante ON turma_estudantes(estudante_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_te_token_acesso ON turma_estudantes(token_acesso);

CREATE INDEX IF NOT EXISTS idx_desig_turma ON designacoes(turma_id);
CREATE INDEX IF NOT EXISTS idx_desig_te ON designacoes(turma_estudante_id);
CREATE INDEX IF NOT EXISTS idx_desig_parte ON designacoes(parte_id);

