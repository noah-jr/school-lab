-- ============================================================
-- MIGRAÇÃO 001 — Esquema inicial da Escola para Anciãos (EAC)
-- SQLite — sem Prisma — better-sqlite3
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- -------------------------------------------------------
-- UTILIZADORES (gestores do sistema)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilizadores (
  id          TEXT PRIMARY KEY,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  senha_hash  TEXT NOT NULL,
  papel       TEXT NOT NULL DEFAULT 'admin' CHECK(papel IN ('admin', 'instrutor', 'viajante')),
  activo      INTEGER NOT NULL DEFAULT 1,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -------------------------------------------------------
-- CIRCUITOS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS circuitos (
  id         TEXT PRIMARY KEY,
  codigo     TEXT NOT NULL UNIQUE,  -- ex: "206", "260", "410"
  nome       TEXT NOT NULL,
  pais       TEXT NOT NULL DEFAULT 'Angola',
  activo     INTEGER NOT NULL DEFAULT 1,
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -------------------------------------------------------
-- CONGREGAÇÕES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS congregacoes (
  id           TEXT PRIMARY KEY,
  nome         TEXT NOT NULL,
  circuito_id  TEXT NOT NULL REFERENCES circuitos(id),
  activo       INTEGER NOT NULL DEFAULT 1,
  criado_em    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_congregacoes_circuito ON congregacoes(circuito_id);

-- -------------------------------------------------------
-- ESTUDANTES (catálogo permanente)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS estudantes (
  id                  TEXT PRIMARY KEY,
  nome                TEXT NOT NULL,
  email_jwpub         TEXT,
  telefone_principal  TEXT,
  telefone_alternativo TEXT,
  congregacao_id      TEXT REFERENCES congregacoes(id),
  papel_ministerial   TEXT NOT NULL DEFAULT 'anciao' CHECK(papel_ministerial IN ('anciao', 'servo_ministerial')),
  activo              INTEGER NOT NULL DEFAULT 1,
  criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao ON estudantes(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_estudantes_nome ON estudantes(nome);

-- -------------------------------------------------------
-- PROGRAMA DE PARTES (template reutilizável)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS programas (
  id         TEXT PRIMARY KEY,
  nome       TEXT NOT NULL,         -- ex: "EAC Standard 5 Dias"
  descricao  TEXT,
  activo     INTEGER NOT NULL DEFAULT 1,
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS programa_partes (
  id              TEXT PRIMARY KEY,
  programa_id     TEXT NOT NULL REFERENCES programas(id),
  numero          INTEGER NOT NULL,         -- 1–46
  dia_semana      TEXT NOT NULL CHECK(dia_semana IN ('segunda','terca','quarta','quinta','sexta')),
  hora_inicio     TEXT,                     -- ex: "08:00"
  duracao_minutos INTEGER,
  titulo          TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK(tipo IN ('relatorio','comentario','demonstracao','entrevista','discurso','video','oracao','workshop','outro')),
  nivel_requerido TEXT NOT NULL DEFAULT 'C' CHECK(nivel_requerido IN ('A','B','C','A/B','B/C','A/B/C','NULO')),
  workshop_grupo  TEXT,                     -- ex: "w-1", "w-2" (para workshops)
  observacoes     TEXT,
  ordem           INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_partes_programa ON programa_partes(programa_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_partes_programa_num ON programa_partes(programa_id, numero);

-- -------------------------------------------------------
-- TURMAS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS turmas (
  id               TEXT PRIMARY KEY,
  numero_turma     INTEGER NOT NULL,         -- ex: 451
  nome             TEXT NOT NULL,            -- ex: "451ª Turma EAC"
  local_nome       TEXT NOT NULL,
  local_cidade     TEXT,
  pais             TEXT NOT NULL DEFAULT 'Angola',
  data_inicio      TEXT NOT NULL,            -- ISO date: "2024-01-08"
  data_fim         TEXT NOT NULL,
  instrutor_a_nome TEXT,
  instrutor_b_nome TEXT,
  programa_id      TEXT REFERENCES programas(id),
  status           TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','activa','concluida','cancelada')),
  observacoes      TEXT,
  criado_por       TEXT REFERENCES utilizadores(id),
  criado_em        TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_turmas_status ON turmas(status);
CREATE INDEX IF NOT EXISTS idx_turmas_numero ON turmas(numero_turma);

-- -------------------------------------------------------
-- ESTUDANTES POR TURMA (M:N com dados específicos da turma)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS turma_estudantes (
  id                  TEXT PRIMARY KEY,
  turma_id            TEXT NOT NULL REFERENCES turmas(id),
  estudante_id        TEXT NOT NULL REFERENCES estudantes(id),
  numero_lista        INTEGER,              -- # na lista da turma
  idade               REAL,
  anos_batismo        REAL,
  nivel_oratoria      TEXT CHECK(nivel_oratoria IN ('A','A+','A-','B','B+','B-','C','C+','C-')),
  cca_nome            TEXT,                -- Coordenador do Corpo de Anciãos
  cca_email           TEXT,
  avaliado_pelo_viajante INTEGER NOT NULL DEFAULT 0,
  data_avaliacao      TEXT,
  observacoes         TEXT,
  criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(turma_id, estudante_id)
);

CREATE INDEX IF NOT EXISTS idx_te_turma ON turma_estudantes(turma_id);
CREATE INDEX IF NOT EXISTS idx_te_estudante ON turma_estudantes(estudante_id);

-- -------------------------------------------------------
-- DESIGNAÇÕES (parte atribuída a estudante por turma)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS designacoes (
  id                  TEXT PRIMARY KEY,
  turma_id            TEXT NOT NULL REFERENCES turmas(id),
  turma_estudante_id  TEXT NOT NULL REFERENCES turma_estudantes(id),
  parte_id            TEXT NOT NULL REFERENCES programa_partes(id),
  dia_semana          TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','confirmada','realizada','cancelada')),
  observacoes         TEXT,
  criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_em      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_desig_turma ON designacoes(turma_id);
CREATE INDEX IF NOT EXISTS idx_desig_te ON designacoes(turma_estudante_id);
CREATE INDEX IF NOT EXISTS idx_desig_parte ON designacoes(parte_id);

-- -------------------------------------------------------
-- UPLOADS (metadados de ficheiros locais)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploads (
  id            TEXT PRIMARY KEY,
  turma_id      TEXT REFERENCES turmas(id),
  nome_original TEXT NOT NULL,
  nome_ficheiro TEXT NOT NULL,           -- nome no disco (uuid + ext)
  caminho       TEXT NOT NULL,           -- path relativo ao /data/uploads/
  tipo_mime     TEXT NOT NULL,
  tamanho_bytes INTEGER NOT NULL,
  tipo_upload   TEXT NOT NULL CHECK(tipo_upload IN ('lista_estudantes','avaliacao_viajante','programa','outro')),
  processado    INTEGER NOT NULL DEFAULT 0,
  criado_por    TEXT REFERENCES utilizadores(id),
  criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_uploads_turma ON uploads(turma_id);

-- -------------------------------------------------------
-- AUDIT LOGS (INSERT-only, nunca deletar)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id            TEXT PRIMARY KEY,
  tabela        TEXT NOT NULL,
  registo_id    TEXT NOT NULL,
  accao         TEXT NOT NULL CHECK(accao IN ('INSERT','UPDATE','DELETE_SOFT','VIEW')),
  dados_antes   TEXT,                    -- JSON
  dados_depois  TEXT,                    -- JSON
  utilizador_id TEXT REFERENCES utilizadores(id),
  ip_address    TEXT,
  user_agent    TEXT,
  criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_tabela ON audit_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_registo ON audit_logs(registo_id);
CREATE INDEX IF NOT EXISTS idx_audit_data ON audit_logs(criado_em);

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
